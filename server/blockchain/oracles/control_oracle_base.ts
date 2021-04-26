const {ethers} = require('ethers');
import ABI_TELEPORT_AGENT from '../../abi/NFTTeleportAgent.json';
import ABI_ERC721TokenImplementation from '../../abi/NFTokenImplementation.json';
import ABI_IERC721Metadata from '../../abi/IERC721Metadata.json';
import * as tools from '../tools';
import { CHAIN_BLOCK_CONFIRMATIONS } from '../../../config';
import { ControlBase } from '../control_base';
import { IControlOracleBase } from './control_oracle_base_interface';
import { logger } from 'server/base/logger';

//**************************************************************************************************
export abstract class ControlOracleBase extends ControlBase implements IControlOracleBase
{
	protected oracleWallet;
	protected oracleWalletOwner;
	protected provider;
	protected teleportContractOriginal;
	protected ctrlOracleOtherChain:IControlOracleBase;
	protected oracleTeleportContract;

	//==============================================================================================
	protected abstract _pushPairTokensToOtherChainCache(_originalAddress:string,
														_pairAddress:string,
														_name:string,
														_symbol:string);

	//==============================================================================================
	constructor(_provider,
				_oraclePrivateKey:string,
				_teleportContractAddress:string,
				_oracleListenEventsFromBlock:number)
	{
		super();
		this.provider = _provider;
		this.oracleWalletOwner = new ethers.Wallet(_oraclePrivateKey);
		this.oracleWallet = this.oracleWalletOwner.connect(this.provider);

		this.teleportContractOriginal = new ethers.Contract(_teleportContractAddress,
															ABI_TELEPORT_AGENT,
															this.provider);
		this.provider.resetEventsBlock(_oracleListenEventsFromBlock);
		this._subscribeToEventTeleportPairRegistered();
		this._subscribeToEventTeleportOriginalStarted();
		this._subscribeToEventTeleportWrappedStarted();
		this._subscribeToEventTeleportPairCreated();

		this.oracleTeleportContract = this.teleportContractOriginal.connect(this.oracleWallet);
	}
	//==============================================================================================
	public Init(_ctrlOracleOtherChain:IControlOracleBase)
	{
		this.ctrlOracleOtherChain = _ctrlOracleOtherChain;
	}
	//==============================================================================================
	public async populateTxRegisterTeleportPair(_fromAddress:string, _erc721Address:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::populateTxRegisterTeleportPair] input: `
						+ `[(fromAddress/${_fromAddress}), `
						+ `(erc721Address/${_erc721Address})]`);
			const isRegistered:boolean = await this.teleportContractOriginal.originalErc721_(_erc721Address);
			if(isRegistered)
			{
				logger.warning(`[ControlOracleBase::populateTxRegisterTeleportPair] already registered (address/${_erc721Address})`);
				return "";
			}
			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			const contract = this.teleportContractOriginal.connect(wallet);

			const contractTx = await contract.populateTransaction['registerTeleportPair(address)'](_erc721Address);
			contractTx['gasPrice'] = await this.provider.getGasPrice();
			this.provider.estimateGas(contractTx).then(estimate => {
				contractTx['gasLimit'] = estimate;
			});

			let tx = await wallet.populateTransaction(contractTx);
			this.prepareTxFormatUnits(tx, '0');
			return tx;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::populateTxRegisterTeleportPair] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	public async completeCreateTeleportPair(_otherChainTxHash:string,
											_originalErc721Addr:string,
											_name:string,
											_symbol:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::completeCreateTeleportPair] input: `
						+ `[(txHash/${_otherChainTxHash}), `
						+ `(originalErc721Addr/${_originalErc721Addr}), `
						+ `(name/${_name}), `
						+ `(symbol/${_symbol})]`);

			const pairAddress = await this.teleportContractOriginal.teleportPairsThereToHere_(_originalErc721Addr);
			if(pairAddress.toString() !== "0x0000000000000000000000000000000000000000")
			{
				logger.log(`[ControlOracleBase::createSwapPair] token pair is already created. `
							+ `(originalErc721Addr/${_originalErc721Addr.toString()}), `
							+ `(pairAddress/${pairAddress}), `
							+ `(name/${_name}), `
							+ `(symbol/${_symbol})`);
				return;
			}

			const contractTx = await this.oracleTeleportContract.populateTransaction
									['createTeleportPair(bytes32,address,string,string)']
									(_otherChainTxHash,
									 _originalErc721Addr,
									 _name,
									 _symbol);
									
			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = ethers.BigNumber.from('0');
			contractTx['to'] = this.teleportContractOriginal.address;
			this.provider.estimateGas(contractTx).then(function (estimate) {
				contractTx['gasLimit'] = estimate;
			});
			const txResponse = await this.oracleWallet.sendTransaction(contractTx);
			await txResponse.wait(CHAIN_BLOCK_CONFIRMATIONS);
		}
		catch(error)
		{
			const problem = `[ControlOracleBase::completeCreateTeleportPair] on event caught an exception`;
			logger.error(`${problem} `
							+ `. Error: "${error}"`);
		}
	}
	//==============================================================================================
	public async populateTxTeleportStart(_fromAddress:string,
										 _erc721Address:string,
										 _tokenId:string)
	{
		try
		{
			const isWrapped:boolean = await this.teleportContractOriginal.wrappedErc721_(_erc721Address);
			if(isWrapped)
			{
				return this._populateTxTeleportWrappedStart(_fromAddress, _erc721Address, _tokenId);
			}
			else
			{
				return this._populateTxTeleportOriginalStart(_fromAddress, _erc721Address, _tokenId);
			}
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::populateTxTeleportStart] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}	
	//==============================================================================================
	protected async _populateTxTeleportOriginalStart(_fromAddress:string,
													 _erc721Address:string,
													 _tokenId:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::_populateTxTeleportOriginalStart] input: `
						+ `[(fromAddress/${_fromAddress}), `
						+ `(erc721Address/${_erc721Address}), `
						+ `(tokenId/${_tokenId})]`);
			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			const contract = this.teleportContractOriginal.connect(wallet);

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const fee = await this.teleportContractOriginal.fee_();

			const contractTx = await contract.populateTransaction['teleportOriginalStart(address,uint256)'](_erc721Address, tokenId);
			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = ethers.BigNumber.from(fee);
			this.provider.estimateGas(contractTx).then(estimate => {
				contractTx['gasLimit'] = estimate;
			});

			let tx = await wallet.populateTransaction(contractTx);
			this.prepareTxFormatUnits(tx, fee);
			return tx;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::_populateTxTeleportOriginalStart] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	public async completeTeleportOriginalFill(_otherChainTxHash:string,
											  _originalErc721Addr:string,
											  _toAddress:string,
											  _tokenId:string,
											  _tokenUri:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::completeTeleportOriginalFill] input: `
						+ `[(otherChainTxHash/${_otherChainTxHash}), `
						+ `(originalErc721Addr/${_originalErc721Addr}), `
						+ `(toAddress/${_toAddress}), `
						+ `(tokenId/${_tokenId})]`);

			const isTxRegistred:boolean = await this.teleportContractOriginal.filledTeleports_(_otherChainTxHash);
			if(isTxRegistred)
			{
				logger.log(`[ControlOracleBase::completeTeleportOriginalFill] token teleport had been completed `
							+ `(otherChainTxHash/${_otherChainTxHash})`);
				return;
			}

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const contractTx = await this.oracleTeleportContract.populateTransaction
									['teleportOriginalFill(bytes32,address,address,uint256,string)']
									(_otherChainTxHash,
									 _originalErc721Addr,
									 _toAddress,
									 tokenId,
									 _tokenUri);

			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = ethers.BigNumber.from('0');
			contractTx['to'] = this.teleportContractOriginal.address;
			this.provider.estimateGas(contractTx).then(function (estimate) {
				contractTx['gasLimit'] = estimate;
			});
			const txResponse = await this.oracleWallet.sendTransaction(contractTx);
			await txResponse.wait(CHAIN_BLOCK_CONFIRMATIONS);
		}
		catch(error)
		{
			const problem = `[ControlOracleBase::completeTeleportOriginalFill] on event caught an exception`;
			logger.error(`${problem} `
							+ `. Error: "${error}"`);
		}
	}
	//==============================================================================================
	private async _populateTxTeleportWrappedStart(_fromAddress:string,
												  _wrappedErc721Addr:string,
												  _tokenId:string)
	{
		try
		{
			const isApproved:boolean = await this.isApproved(_fromAddress, _wrappedErc721Addr, _tokenId);
			if(!isApproved)
			{
				return this._populateTxSelfTeleport(_fromAddress, _wrappedErc721Addr, _tokenId);
			}
			else
			{
				return this._populateTxTeleportWrappedApprovedStart(_fromAddress, _wrappedErc721Addr, _tokenId);
			}
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::_populateTxTeleportWrappedStart] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	public async completeTeleportWrappedFill(_otherChainTxHash:string,
											 _originalErc721Addr:string,
											 _toAddress:string,
											 _tokenId:string)
	{
		try
		{
			logger.log(`[ControlOracleEthSide::completeTeleportWrappedFill] input: `
						+ `[(otherChainTxHash/${_otherChainTxHash}), `
						+ `(originalErc721Addr/${_originalErc721Addr}), `
						+ `(toAddress/${_toAddress}), `
						+ `(tokenId/${_tokenId})]`);

			const isTxRegistred:boolean = await this.teleportContractOriginal.filledTeleports_(_otherChainTxHash);
			if(isTxRegistred)
			{
				logger.log(`[ControlOracleBase::completeTeleportWrappedFill] teleport had been completed `
							+ `(otherChainTxHash/${_otherChainTxHash})`);
				return;
			}

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const contractTx = await this.oracleTeleportContract.populateTransaction
									['teleportWrappedFill(bytes32,address,address,uint256)']
									(_otherChainTxHash,
									 _originalErc721Addr,
									 _toAddress,
									 tokenId);

			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = ethers.BigNumber.from('0');
			contractTx['to'] = this.teleportContractOriginal.address;
			this.provider.estimateGas(contractTx).then(function (estimate) {
				contractTx['gasLimit'] = estimate;
			});
			const txResponse = await this.oracleWallet.sendTransaction(contractTx);
			await txResponse.wait(CHAIN_BLOCK_CONFIRMATIONS);
		}
		catch(error)
		{
			const problem = `[ControlOracleBase::completeTeleportWrappedFill] on event caught an exception`;
			logger.error(`${problem} `
							+ `. Error: "${error}"`);
		}
	}
	//==============================================================================================
	public async isApproved(_fromAddress:string,
							_nfTokenAddress:string,
							_tokenId:string)
							: Promise<boolean>
	{
		try
		{
			logger.log(`[ControlOracleBase::isApproved] input:`
						+ `[(fromAddress/${_fromAddress}), (token/${_nfTokenAddress})]`);

			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			const nfTokenContract = this._makeContractFromDefaultTokenInterface(_nfTokenAddress);
			if(!nfTokenContract)
			{
				throw new Error(`Can't create NFT contract by address/${_nfTokenAddress})`);
			}
			const nfContract = nfTokenContract.connect(wallet);
			
			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const approvedAddress = await nfContract.getApproved(tokenId);

			const isApproved = this.teleportContractOriginal.address.toLowerCase() === approvedAddress.toString().toLowerCase();
			logger.log(`[ControlOracleBase::isApproved] result: `
						+ `(approvedAddress/${approvedAddress.toString()})`
						+ `(teleportAddress/${this.teleportContractOriginal.address})`
						+ `(isApproved/${isApproved})`);
			return isApproved;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::isApproved] caugth an exception`;
			logger.error(`${problem}: ${err}`);
			return false;
		}
	}
	//==============================================================================================
	public async populateTransactionApproveToTeleport(_fromAddress:string,
													  _nfTokenAddress:string,
													  _tokenId:string)
	{
		return this._populateTransactionApprove(_fromAddress,
												this.teleportContractOriginal.address,
												_nfTokenAddress,
												_tokenId);
	}
	//==============================================================================================
	public async populateTransactionApproveCancel(_fromAddress:string,
												  _nfTokenAddress:string,
												  _tokenId:string)
	{
		return this._populateTransactionApprove(_fromAddress,
												"0x0000000000000000000000000000000000000000",
												_nfTokenAddress,
												_tokenId);
	}
	//==============================================================================================
	protected _subscribeToEventTeleportPairRegistered()
	{
		this.teleportContractOriginal.on("TeleportPairRegistered", async(_sponsor,_originalErc721Addr,_name,_symbol,event) =>
		{
			let eventLogData;
			try
			{
				eventLogData = `[(event blockNumber/ ${event.blockNumber}), `
								+ `(event transactionHash/${event.transactionHash.toString()}), `
								+ `(sponsor/${_sponsor.toString()}), `
								+ `(originalErc721Addr/${_originalErc721Addr.toString()}), `
								+ `(name/${_name.toString()}), `
								+ `(symbol/${_symbol.toString()})]`;
				await this.ctrlOracleOtherChain.completeCreateTeleportPair(event.transactionHash.toString(),
																		   _originalErc721Addr.toString(),
																		   _name.toString(),
																		   _symbol.toString());
				logger.log(`[ControlOracleBase::TeleportPairRegistered] on event `
							+ `ctrlOracleOtherChain.completeCreateTeleportPair completed by `
							+ eventLogData);
			}
			catch(err)
			{
				const problem = `[ControlOracleBase::TeleportPairRegistered] on event caught an exception`;
				logger.error(`${problem} `
								+ eventLogData
								+ `. Error: "${err}"`);
			}
		});
	}
	
	//==============================================================================================
	protected _subscribeToEventTeleportPairCreated()
	{
		this.teleportContractOriginal.on("TeleportPairCreated", async(_otherChainRegisterTxHash,_wrappedErc721Addr,_originalErc721Addr,_symbol,_name,event) =>
		{
			let eventLogData;
			try
			{
				eventLogData = `[(event blockNumber/ ${event.blockNumber}), `
								+ `(event transactionHash/${event.transactionHash.toString()}), `
								+ `(otherChainRegisterTxHash/${_otherChainRegisterTxHash.toString()}), `
								+ `(wrappedErc721Addr/${_wrappedErc721Addr.toString()}), `
								+ `(originalErc721Addr/${_originalErc721Addr.toString()}), `
								+ `(symbol/${_symbol.toString()})`;
								+ `(name/${_name.toString()})]`
				logger.log(`[ControlOracleBase::TeleportPairCreated] on event `
							+ eventLogData);
				this._pushPairTokensToOtherChainCache(_originalErc721Addr.toString(),
													  _wrappedErc721Addr.toString(),
													  _name.toString(),
													  _symbol.toString());
			}
			catch(err)
			{
				const problem = `[ControlOracleBase::TeleportPairCreated] on event caught an exception`;
				logger.error(`${problem} `
								+ eventLogData
								+ `. Error: "${err}"`);
			}
		});
	}
	//==============================================================================================
	protected _subscribeToEventTeleportOriginalStarted()
	{
		this.teleportContractOriginal.on("TeleportOriginalStarted", async(_originalErc721Addr,_fromAddr,_tokenId,_tokenUri,_feeAmount,event) =>
		{
			let eventLogData;
			try
			{
				eventLogData = `[(event blockNumber/${event.blockNumber}), `
								+ `(event transactionHash/${event.transactionHash.toString()}), `
								+ `(originalErc721Addr/${_originalErc721Addr.toString()}), `
								+ `(fromAddress/${_fromAddr.toString()}), `
								+ `(tokenId/${_tokenId.toString()}), `;
								+ `(tokenUri/${_tokenUri.toString()}), `;
								+ `(feeAmount/${_feeAmount.toString()})]`;
				await this.ctrlOracleOtherChain.completeTeleportOriginalFill(event.transactionHash.toString(),
																			 _originalErc721Addr.toString(),
																			 _fromAddr.toString(),
																			 _tokenId.toString(),
																			 _tokenUri.toString());
				logger.log(`[ControlOracleBase::TeleportOriginalStarted] on event `
							+ `ctrlOracleOtherChain.completeTeleportOriginalFill completed by `
							+ eventLogData);
			}
			catch(err)
			{
				const problem = `[ControlOracleBase::TeleportOriginalStarted] on event caught an exception`;
				logger.error(`${problem} `
								+ eventLogData
								+ `. Error: "${err}"`);
			}
		});
	}
	//==============================================================================================
	protected _subscribeToEventTeleportWrappedStarted()
	{
		this.teleportContractOriginal.on("TeleportWrappedStarted", async(_wrappedErc721Addr,_originalErc721Addr,_fromAddr,_tokenId,_feeAmount,event) =>
		{
			let eventLogData;
			try
			{
				eventLogData = `[(event blockNumber/ ${event.blockNumber}), `
								+ `(event txHash/${event.transactionHash.toString()}), `
								+ `(wrappedErc721Addr/${_wrappedErc721Addr.toString()}), `
								+ `(originalErc721Addr/${_originalErc721Addr.toString()}), `
								+ `(fromAddr/${_fromAddr.toString()}), `
								+ `(tokenId/${_tokenId.toString()}), `
								+ `(feeAmount/${_feeAmount.toString()})]`;
				await this.ctrlOracleOtherChain.completeTeleportWrappedFill(event.transactionHash.toString(),
																			_originalErc721Addr.toString(),
																			_fromAddr.toString(),
																			_tokenId.toString());

				logger.log(`[ControlOracleBase::TeleportWrappedStarted] on event `
							+ `ctrlOracleOtherChain.completeTeleportWrappedFill complete `
							+ eventLogData);
			}
			catch(err)
			{
				const problem = `[ControlOracleBase::TeleportWrappedStarted] on event caught an exception`;
				logger.error(`${problem} ` 
								+ eventLogData
								+ `. Error: "${err}"`);
			}
		});
	}
	//==============================================================================================
	private async _populateTxSelfTeleport(_fromAddress:string,
										  _wrappedErc721Addr:string,
										  _tokenId:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::_populateTxSelfTeleport] input: `
						+ `[(fromAddress/${_fromAddress}), `
						+ `(wrappedErc721Addr/${_wrappedErc721Addr}), `
						+ `(tokenId/${_tokenId})]`);

			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			let nfTokenContract = this._makeContractFromTokenImplInterface(_wrappedErc721Addr);
			nfTokenContract = nfTokenContract.connect(wallet);

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const fee = await this.teleportContractOriginal.fee_();

			const contractTx = await nfTokenContract.populateTransaction['safeTransferToOriginalChain(uint256)'](tokenId);
			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = fee;
			this.provider.estimateGas(contractTx).then(estimate => {
				contractTx['gasLimit'] = estimate;
			});

			let tx = await wallet.populateTransaction(contractTx);
			this.prepareTxFormatUnits(tx, fee);
			return tx;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::_populateTxSelfTeleport] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	private async _populateTxTeleportWrappedApprovedStart(_fromAddress:string,
														  _wrappedErc721Addr:string,
														  _tokenId:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::_populateTxTeleportWrappedApprovedStart] input: `
						+ `[(fromAddress/${_fromAddress}), `
						+ `(wrappedErc721Addr/${_wrappedErc721Addr}), `
						+ `(tokenId/${_tokenId})]`);

			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			const contract = this.teleportContractOriginal.connect(wallet);

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const value = await this.teleportContractOriginal.fee_();

			const contractTx = await contract.populateTransaction['teleportWrappedStart(address,uint256)'](_wrappedErc721Addr, tokenId);
			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['value'] = value;
			this.provider.estimateGas(contractTx).then(estimate => {
				contractTx['gasLimit'] = estimate;
			});

			let tx = await wallet.populateTransaction(contractTx);
			this.prepareTxFormatUnits(tx, value);
			return tx;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::_populateTxTeleportWrappedApprovedStart] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	private async _populateTransactionApprove(_fromAddress:string,
											  _approveToAddress:string,
											  _nfTokenAddress:string,
											  _tokenId:string)
	{
		try
		{
			logger.log(`[ControlOracleBase::_populateTransactionApprove] input: `
						+ `[(fromAddress/${_fromAddress}), `
						+ `(approveToAddress/${_approveToAddress}), `
						+ `(nfTokenAddress/${_nfTokenAddress}), `
						+ `(tokenId/${_tokenId})]`);

			let wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			wallet = wallet.connect(this.provider);
			const tokenContract = this._makeContractFromDefaultTokenInterface(_nfTokenAddress);
			if(!tokenContract)
			{
				throw new Error(`Can't create NFT contract by address/${_nfTokenAddress})`);
			}
			const contract = tokenContract.connect(wallet);

			const tokenId = tools.castDecimalToBigNumber(_tokenId, 0);
			const contractTx = await contract.populateTransaction['approve(address,uint256)'](_approveToAddress, tokenId);

			contractTx['gasPrice'] = await this.provider.getGasPrice();
			contractTx['from'] = _fromAddress;
			this.provider.estimateGas(contractTx).then(estimate => {
				contractTx['gasLimit'] = estimate;
			});
			let tx = await wallet.populateTransaction(contractTx);
			this.prepareTxFormatUnits(tx, '0');
			return tx;
		}
		catch(err)
		{
			const problem = `[ControlOracleBase::_populateTransactionApprove] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
	//==============================================================================================
	private _makeContractFromDefaultTokenInterface(_addressContract:string)
	{
		return this._makeContractFromInterface(_addressContract, ABI_IERC721Metadata);
	}
	//==============================================================================================
	private _makeContractFromTokenImplInterface(_addressContract:string)
	{
		return this._makeContractFromInterface(_addressContract, ABI_ERC721TokenImplementation);
	}
	//==============================================================================================
	private _makeContractFromInterface(_addressContract:string, _abi:any)
	{
		return new ethers.Contract(_addressContract, _abi, this.provider);
	}
}
const {ethers} = require('ethers');
import { logger } from 'server/base/logger';
import { ControlBase } from './control_base';
import ABI_NFT_SCOTTY_BEAM from '../abi/NFTScottyBeam.json';

//**************************************************************************************************
export class ControlFaucetScottyBeam extends ControlBase
{
	protected provider;
	protected faucetContract;

	//==============================================================================================
	constructor(_provider,
				_faucetContractAddress:string)
	{
		super();
		this.provider = _provider;
		this.faucetContract = new ethers.Contract(_faucetContractAddress,
												  ABI_NFT_SCOTTY_BEAM,
												  this.provider);
	}
	//==============================================================================================
	public async isAvailableFreeNft(_fromAddress:string): Promise<boolean>
	{
		try
		{
			logger.log(`[ControlFaucetScottyBeam::isAvailableFreeNft] input:`
						+ `[(fromAddress/${_fromAddress})]`);

			const isAvailable:boolean = await this.faucetContract.canGetFreeNft(_fromAddress);

			logger.log(`[ControlFaucetScottyBeam::isAvailableFreeNft] result: `
						+ `(fromAddress/${_fromAddress}), `
						+ `(isAvailable/${isAvailable}), `
						+ `(faucetContractAddress/${this.faucetContract.address})`);
			return isAvailable;
		}
		catch(err)
		{
			const problem = `[ControlFaucetScottyBeam::isAvailableFreeNft] caugth an exception`;
			logger.error(`${problem}: ${err}`);
			return false;
		}
	}
	//==============================================================================================
	public async populateTxMintFreeNft(_fromAddress:string)
	{
		try
		{
			logger.log(`[ControlFaucetScottyBeam::populateTxMintFreeNft] input: `
						+ `[(fromAddress/${_fromAddress})]`);

			const wallet = new ethers.VoidSigner(_fromAddress, this.provider);
			const contract = this.faucetContract.connect(wallet);

			const contractTx = await contract.populateTransaction['mintFreeNft()']();
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
			const problem = `[ControlFaucetScottyBeam::populateTxMintFreeNft] caught an exception`;
			logger.error(`${problem}: ${err}`);
			return "";
		}
	}
}
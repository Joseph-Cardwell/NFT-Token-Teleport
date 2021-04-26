import { logger } from 'server/base/logger';
import { BlockchainBridgePairNFT} from './blockchain_token';

//**************************************************************************************************
export class BlockchainBridgePairNFTs
{
	private tokens_:BlockchainBridgePairNFT[];
	//==============================================================================================
	constructor()
	{
		this.tokens_ = new Array();
	}
	//==============================================================================================
	public tokens()		{ return this.tokens_; }
	//==============================================================================================
	public push(_token:BlockchainBridgePairNFT):boolean
	{
		if(!_token)
		{
			return false;
		}
		if(!this.hasToken(_token))
		{
			this.tokens_.push(_token);
			logger.log(`BlockchainBridgeTokens:push new token: ${JSON.stringify(_token.toJson())}`);
			return true;
		}
		return false;
	}
	//==============================================================================================
	public getByEthAddress(_address:string): BlockchainBridgePairNFT
	{
		_address = String(_address).toLowerCase();
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].addressETH() === _address)
			{
				return this.tokens_[i];
			}
		}
		logger.error(`[BlockchainBridgeTokens::getByEthAddress] missing address: ${_address}`);
		return null;
	}
	//==============================================================================================
	public getByBscAddress(_address:string): BlockchainBridgePairNFT
	{
		_address = String(_address).toLowerCase();
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].addressBSC() === _address)
			{
				return this.tokens_[i];
			}
		}
		logger.error(`[BlockchainBridgeTokens::getByBscAddress] missing address: ${_address}`);
		return null;
	}
	//==============================================================================================
	public getById(_tokenId:string): BlockchainBridgePairNFT
	{
		_tokenId = String(_tokenId).toUpperCase();
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].id() === _tokenId)
			{
				return this.tokens_[i];
			}
		}
		return null;
	}
	//==============================================================================================
	public hasTokenEthAddress(_address:string):boolean
	{
		_address = _address.toLowerCase();
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].addressETH() === _address)
			{
				return true;
			}
		}
		return false;
	}
	//==============================================================================================
	public hasTokenBscAddress(_address:string):boolean
	{
		_address = _address.toLowerCase();
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].addressBSC() === _address)
			{
				return true;
			}
		}
		return false;
	}
	//==============================================================================================
	public hasTokenSymbol(_symbol:string):boolean
	{
		_symbol = _symbol.toUpperCase()
		for(let i in this.tokens_)
		{
			if(this.tokens_[i].symbol() === _symbol)
			{
				return true;
			}
		}
		return false;
	}
	//==============================================================================================
	public hasToken(_token:BlockchainBridgePairNFT):boolean
	{
		return this.tokens_.includes(_token)
			|| (this.hasTokenEthAddress(_token.addressETH())
				&& this.hasTokenBscAddress(_token.addressBSC()));
	}
}
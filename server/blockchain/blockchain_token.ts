
//**************************************************************************************************
export class BlockchainBridgePairNFT
{
	private id_:string;
	private addressEth_:string;
	private addressBsc_:string;
	private name_:string;
	private symbol_:string;
	//==============================================================================================
	constructor(_id:string,
				_addressEth:string,
				_addressBsc:string,
				_name:string,
				_symbol:string)
	{
		if(_addressEth === _addressBsc)
		{
			throw new Error(`[BlockchainBridgeToken::constructor] ETH and BSC addresses is same: ${_addressEth}`);
		}
		this.id_			= _id.toUpperCase();
		this.addressEth_	= _addressEth.toLowerCase();
		this.addressBsc_	= _addressBsc.toLowerCase();
		this.name_			= _name.toUpperCase();
		this.symbol_		= _symbol.toUpperCase();
	}
	//==============================================================================================
	public id():string			{ return this.id_; }
	//==============================================================================================
	public addressETH():string	{ return this.addressEth_; }
	//==============================================================================================
	public addressBSC():string	{ return this.addressBsc_; }
	//==============================================================================================
	public name():string		{ return this.name_; }
	//==============================================================================================
	public symbol():string		{ return this.symbol_; }
	//==============================================================================================
	public toJson()
	{
		return {
			addressEth	: this.addressEth_,
			addressBsc	: this.addressBsc_,
			name		: this.name_,
			symbol		: this.symbol_,
		};
	}
}
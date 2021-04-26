//**************************************************************************************************
export enum ProviderType {
	ETHERSCAN	= 1,
	INFURA		= 2,
	ALCHEMY		= 3,
	JSON_RPC	= 4,
}
//**************************************************************************************************
export interface ProviderConfig
{
	priority: number,
	weight: number,
	stallTimeout: number,
	providerId: string,
	provider_type: ProviderType,
}
//**************************************************************************************************
export class PairTokensInfo
{
	public token_name:string;
	public token_symbol:string;
	public token_address_eth:string;
	public token_address_bsc:string;
}
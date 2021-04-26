
//**************************************************************************************************
export interface IControlOracleBase
{
	completeCreateTeleportPair(otherChainTxHash:string, originalErc721Addr:string, name:string, symbol:string);
	completeTeleportOriginalFill(otherChainTxHash:string, originalErc721Addr:string, toAddress:string, tokenId:string, tokenUri:string);
	completeTeleportWrappedFill(otherChainTxHash:string, originalErc721Addr:string, toAddress:string, tokenId:string);
}

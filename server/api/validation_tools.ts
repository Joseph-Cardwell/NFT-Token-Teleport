
//**************************************************************************************************
enum CurrencyType
{
	AIOT = "AIOT",
	JASMY = "JASMY",
}
//**************************************************************************************************
export function isValidRequestAddress(_walletAddress):boolean
{
	const address = String(_walletAddress).toLowerCase();
	return address.length === 42 && address.startsWith('0x');
}
//**************************************************************************************************
export function isValidRequestNFTokenId(_tokenId):boolean
{
    return _tokenId
           && !isNaN(Number(_tokenId))
           && Number(_tokenId) >= 0;
}
//**************************************************************************************************
export function isValidRequestType(_bridgeFrom):boolean
{
	const bridgeFrom = String(_bridgeFrom).toUpperCase();
	return _bridgeFrom
			&& (bridgeFrom === 'ETH' || bridgeFrom === 'BSC');
}
//**************************************************************************************************
export function isValidRequestIsWrapped(_isWrapped):boolean
{
    return _isWrapped
           && !isNaN(Number(_isWrapped))
           && (Number(_isWrapped) === 0 || Number(_isWrapped) === 1);
}
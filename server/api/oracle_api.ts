import {Router} from 'express';
import axios from 'axios';
import { BlockchainBridgePairNFT } from '../blockchain/blockchain_token';
import { PairTokensInfo } from '../blockchain/types';
import {ctrlOracleEth,
		ctrlOracleBsc,
		bridgePairTokensCacheEth,
		bridgePairTokensCacheBsc,
		ctrlFaucetEth,
		ctrlFaucetBsc} from '../init';
import * as tools from './validation_tools';
import { logger } from 'server/base/logger';

const router = Router();

//**************************************************************************************************
export enum BridgeType
{
	ETH = 'ETH',
	BSC = 'BSC',
}

//**************************************************************************************************
export enum BridgeApiResult
{
	FAILED_BY_BLOCKCHAIN_TRANSACTION	= -2,
	FAILED_BY_INVALID_REQUEST			= -1,
	OK									= 0,
}
//**************************************************************************************************
export const BRIDGE_RESPONSE_FORMAT =
{
	"result":BridgeApiResult.OK,
	"data":{}
}

//**************************************************************************************************
export const asyncMiddleware = function(lambdaFunc)
{
	return async (req, res, next) =>
	{
		try
		{
			await lambdaFunc(req, res, next);
		}
		catch(error)
		{
			const problem = `[${req.method}][${req.originalUrl}] caught an exception`;
			logger.error(`${problem}: ${error}`);

			res.sendStatus(500);
		}
	}
};

//**************************************************************************************************
router.use('*', async (req, res, next) =>
{
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] req.body: ${JSON.stringify(req.body)}`);
	next();
});

//**************************************************************************************************
router.post('/get-check-free-nft', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!tools.isValidRequestAddress(wallet_address))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	let isAvailableEth = await ctrlFaucetEth.isAvailableFreeNft(wallet_address);
	let isAvailableBsc = await ctrlFaucetBsc.isAvailableFreeNft(wallet_address);

	respResult['data'] = {eth: isAvailableEth, bsc: isAvailableBsc};
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-tx-mint-nft', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!tools.isValidRequestAddress(wallet_address)
		|| !tools.isValidRequestType(bridge_from))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	let tx;
	if(isBridgeTypeETH(bridge_from))
	{
		tx = await ctrlFaucetEth.populateTxMintFreeNft(wallet_address);
	}
	else if(isBridgeTypeBSC(bridge_from))
	{
		tx = await ctrlFaucetBsc.populateTxMintFreeNft(wallet_address);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	if(tx === "")
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_BLOCKCHAIN_TRANSACTION;
	}
	else
	{
		respResult['data'] = {tx: tx};
	}
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-allowance', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from, nftoken_address, nftoken_id} = req.body;
	
	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!isValidRequestToBridge(wallet_address, bridge_from, nftoken_address, nftoken_id))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	const token:BlockchainBridgePairNFT = getTokenByBridgeType(bridge_from, nftoken_address);
	let isApproved:boolean;
	if(token && isBridgeTypeETH(bridge_from))
	{
		isApproved = await ctrlOracleEth.isApproved(wallet_address,
													token.addressETH(),
													nftoken_id);
	}
	else if(token && isBridgeTypeBSC(bridge_from))
	{
		isApproved = await ctrlOracleBsc.isApproved(wallet_address,
													token.addressBSC(),
													nftoken_id);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	respResult['data'] = {is_approved: isApproved};
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-tx-approve', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from, nftoken_address, nftoken_id} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!isValidRequestToBridge(wallet_address, bridge_from, nftoken_address, nftoken_id))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	const token:BlockchainBridgePairNFT = getTokenByBridgeType(bridge_from, nftoken_address);
	let tx;
	if(token && isBridgeTypeETH(bridge_from))
	{
		tx = await ctrlOracleEth.populateTransactionApproveToTeleport(wallet_address,
																	  token.addressETH(),
																	  nftoken_id);
	}
	else if(token && isBridgeTypeBSC(bridge_from))
	{
		tx = await ctrlOracleBsc.populateTransactionApproveToTeleport(wallet_address,
																	  token.addressBSC(),
																	  nftoken_id);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	if(tx === "")
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_BLOCKCHAIN_TRANSACTION;
	}
	else
	{
		respResult['data'] = {tx: tx};
	}
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-tx-approve-cancel', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from, nftoken_address, nftoken_id} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!isValidRequestToBridge(wallet_address, bridge_from, nftoken_address, nftoken_id))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	const token:BlockchainBridgePairNFT = getTokenByBridgeType(bridge_from, nftoken_address);
	let tx;
	if(token && isBridgeTypeETH(bridge_from))
	{
		tx = await ctrlOracleEth.populateTransactionApproveCancel(wallet_address,
																  token.addressETH(),
																  nftoken_id);
	}
	else if(token && isBridgeTypeBSC(bridge_from))
	{
		tx = await ctrlOracleBsc.populateTransactionApproveCancel(wallet_address,
																  token.addressBSC(),
																  nftoken_id);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	if(tx === "")
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_BLOCKCHAIN_TRANSACTION;
	}
	else
	{
		respResult['data'] = {tx: tx};
	}
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-tx-swap', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from, nftoken_address, nftoken_id} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!isValidRequestToBridge(wallet_address, bridge_from, nftoken_address, nftoken_id))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	const token:BlockchainBridgePairNFT = getTokenByBridgeType(bridge_from, nftoken_address);
	let tx;
	if(token && isBridgeTypeETH(bridge_from))
	{
		tx = await ctrlOracleEth.populateTxTeleportStart(wallet_address, token.addressETH(), nftoken_id);
	}
	else if(token && isBridgeTypeBSC(bridge_from))
	{
		tx = await ctrlOracleBsc.populateTxTeleportStart(wallet_address, token.addressBSC(), nftoken_id);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	if(tx === "")
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_BLOCKCHAIN_TRANSACTION;
	}
	else
	{
		respResult['data'] = {tx: tx};
	}
	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);

	res.json(respResult);
}));

//**************************************************************************************************
router.post('/get-tx-register-pair', asyncMiddleware(async (req, res, next) =>
{
	const {wallet_address, bridge_from, nftoken_address} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!tools.isValidRequestAddress(wallet_address)
	   || !tools.isValidRequestAddress(nftoken_address))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	let tx;
	if(isBridgeTypeETH(bridge_from) && !bridgePairTokensCacheEth.hasTokenEthAddress(nftoken_address))
	{
		tx = await ctrlOracleEth.populateTxRegisterTeleportPair(wallet_address, nftoken_address);
	}
	else if(isBridgeTypeBSC(bridge_from) && !bridgePairTokensCacheBsc.hasTokenBscAddress(nftoken_address))
	{
		tx = await ctrlOracleBsc.populateTxRegisterTeleportPair(wallet_address, nftoken_address);
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	if(tx === "")
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_BLOCKCHAIN_TRANSACTION;
	}
	else
	{
		respResult['data'] = {tx: tx};
	}

	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);
	res.json(respResult);
}));
//**************************************************************************************************
router.post('/check-nftoken-address', asyncMiddleware(async (req, res, next) =>
{
	const {bridge_from, nftoken_address, is_token_wrapped} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(!tools.isValidRequestAddress(nftoken_address)
		|| !tools.isValidRequestIsWrapped(is_token_wrapped))
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	let token;
	if(isBridgeTypeETH(bridge_from))
	{
		token = Number(is_token_wrapped) === 0
				? bridgePairTokensCacheEth.getByEthAddress(nftoken_address)
				: bridgePairTokensCacheBsc.getByEthAddress(nftoken_address);
	}
	else if(isBridgeTypeBSC(bridge_from))
	{
		token = Number(is_token_wrapped) === 0
				? bridgePairTokensCacheBsc.getByBscAddress(nftoken_address)
				: bridgePairTokensCacheEth.getByBscAddress(nftoken_address);
	}

	if(token)
	{
		let pairToken:PairTokensInfo	= new PairTokensInfo();
		pairToken.token_name			= token.name();
		pairToken.token_symbol			= token.symbol();
		pairToken.token_address_eth		= token.addressETH();
		pairToken.token_address_bsc		= token.addressBSC();

		respResult['data'] = pairToken;
	}
	else
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
	}

	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);
	res.json(respResult);
}));
//**************************************************************************************************
router.post('/get-nftoken-metadata', asyncMiddleware(async (req, res, next) =>
{
	const {uri} = req.body;

	let respResult = Object.assign({}, BRIDGE_RESPONSE_FORMAT);
	if(String(uri).length === 0)
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
		res.json(respResult);
		return;
	}

	const responseMetadata = await axios.get(String(uri));
	if(responseMetadata.status !== 200)
	{
		respResult['result'] = BridgeApiResult.FAILED_BY_INVALID_REQUEST;
	}
	else
	{
		respResult['data'] = responseMetadata.data;
	}

	logger.log(`[${req.method}][${req.baseUrl}][from/${req.ip}] response: ${JSON.stringify(respResult)}`);
	res.json(respResult);
}));
//**************************************************************************************************
export function getTokenByBridgeType(_bridgeFrom:string, _nfTokenAddress:string): BlockchainBridgePairNFT
{
	const bridgeFrom = String(_bridgeFrom).toUpperCase();
	if(bridgeFrom === BridgeType.ETH)
	{
		return bridgePairTokensCacheEth.hasTokenEthAddress(_nfTokenAddress)
				? bridgePairTokensCacheEth.getByEthAddress(_nfTokenAddress)
				: bridgePairTokensCacheBsc.getByEthAddress(_nfTokenAddress);
	}
	else if(bridgeFrom === BridgeType.BSC)
	{
		return bridgePairTokensCacheBsc.hasTokenBscAddress(_nfTokenAddress)
				? bridgePairTokensCacheBsc.getByBscAddress(_nfTokenAddress)
				: bridgePairTokensCacheEth.getByBscAddress(_nfTokenAddress);
	}
	else
	{
		return null;
	}
}
//**************************************************************************************************
export function isBridgeTypeETH(_bridgeFrom:string):boolean
{
	const bridgeFrom = String(_bridgeFrom).toUpperCase();
	return bridgeFrom === BridgeType.ETH;
}
//**************************************************************************************************
export function isBridgeTypeBSC(_bridgeFrom:string):boolean
{
	const bridgeFrom = String(_bridgeFrom).toUpperCase();
	return bridgeFrom === BridgeType.BSC;
}
//**************************************************************************************************
function isValidRequestToBridge(_walletAddress, _bridgeFrom, _nfTokenAddress, _nfTokenId):boolean
{
	return tools.isValidRequestAddress(_walletAddress)
		&& tools.isValidRequestType(_bridgeFrom)
		&& tools.isValidRequestAddress(_nfTokenAddress)
		&& tools.isValidRequestNFTokenId(_nfTokenId);
}
export default router;
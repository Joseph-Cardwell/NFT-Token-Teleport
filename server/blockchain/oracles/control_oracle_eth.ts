import { ControlOracleBase } from './control_oracle_base';
import {ETH_TELEPORT_AGENT_CONTRACT_ADDRESS,
		ETH_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK} from '../../../config';
import { BlockchainBridgePairNFT } from '../blockchain_token';
import { bridgePairTokensCacheBsc } from 'server/init';

//**************************************************************************************************
export class ControlOracleEthSide extends ControlOracleBase
{
	//==============================================================================================
	constructor(_provider, _oraclePrivateKey:string)
	{
		super(_provider,
			  _oraclePrivateKey,
			  ETH_TELEPORT_AGENT_CONTRACT_ADDRESS,
			  ETH_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK);
	}
	//==============================================================================================
	protected _pushPairTokensToOtherChainCache(_originalAddress:string,
											   _pairAddress:string,
											   _name:string,
											   _symbol:string)
	{
		bridgePairTokensCacheBsc.push(new BlockchainBridgePairNFT(_symbol,
																  _pairAddress,
																  _originalAddress,
																  _name,
																  _symbol));
	}
}
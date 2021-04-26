import { ControlOracleBase } from './control_oracle_base';
import {BSC_TELEPORT_AGENT_CONTRACT_ADDRESS,
		BSC_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK,} from '../../../config';
import { BlockchainBridgePairNFT } from '../blockchain_token';
import { bridgePairTokensCacheEth } from 'server/init';

//**************************************************************************************************
export class ControlOracleBscSide extends ControlOracleBase
{
	//==============================================================================================
	constructor(_provider, _oraclePrivateKey:string)
	{
		super(_provider,
			  _oraclePrivateKey,
			  BSC_TELEPORT_AGENT_CONTRACT_ADDRESS,
			  BSC_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK);
	}
	//==============================================================================================
	protected _pushPairTokensToOtherChainCache(_originalAddress:string,
											   _pairAddress:string,
											   _name:string,
											   _symbol:string)
	{
		bridgePairTokensCacheEth.push(new BlockchainBridgePairNFT(_symbol,
																  _originalAddress,
																  _pairAddress,
																  _name,
																  _symbol));
	}
}
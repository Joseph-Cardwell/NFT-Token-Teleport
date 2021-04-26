import {fallbackProviderEth, fallbackProviderBsc} from './blockchain/provider_pool/blockchain_provider_pool';
import { ControlOracleEthSide } from './blockchain/oracles/control_oracle_eth';
import { ControlOracleBscSide } from './blockchain/oracles/control_oracle_bsc';
import { BlockchainBridgePairNFTs } from './blockchain/blockchain_tokens';
import { ControlFaucetScottyBeam } from './blockchain/control_faucet';
import { BSC_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS, ETH_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS } from '../config';

export let bridgePairTokensCacheEth:BlockchainBridgePairNFTs	= null;
export let bridgePairTokensCacheBsc:BlockchainBridgePairNFTs	= null;
export let ctrlOracleEth:ControlOracleEthSide					= null;
export let ctrlOracleBsc:ControlOracleBscSide					= null;

export let ctrlFaucetEth:ControlFaucetScottyBeam				= null;
export let ctrlFaucetBsc:ControlFaucetScottyBeam				= null;

//**************************************************************************************************
export async function init()
{
	bridgePairTokensCacheEth = new BlockchainBridgePairNFTs();
	bridgePairTokensCacheBsc = new BlockchainBridgePairNFTs();

	ctrlOracleEth = new ControlOracleEthSide(fallbackProviderEth, process.env.ORACLE_BRIDGE_ETH_PK);
	ctrlOracleBsc = new ControlOracleBscSide(fallbackProviderBsc, process.env.ORACLE_BRIDGE_BSC_PK);

	ctrlOracleEth.Init(ctrlOracleBsc);
	ctrlOracleBsc.Init(ctrlOracleEth);

	ctrlFaucetEth = new ControlFaucetScottyBeam(fallbackProviderEth, ETH_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS);
	ctrlFaucetBsc = new ControlFaucetScottyBeam(fallbackProviderBsc, BSC_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS);
}

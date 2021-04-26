require('dotenv').config();
import { ProviderType, ProviderConfig } from './server/blockchain/types';

export function isEnvVarTrue(_envVar:string):boolean
{
	return _envVar === "true"
		|| _envVar === "TRUE"
		|| (!!+_envVar); // check for process.env.VAR='0' and process.env.VAR='1'
}

export const USE_MAINNET:boolean				= isEnvVarTrue(process.env.USE_MAINNET) || false
export const CONSOLE_LOG_ON:boolean				= true;

export const ETHERS_NAME:string					= USE_MAINNET ? "homestead": "kovan";
export const CHAIN_BLOCK_CONFIRMATIONS:number	= 3;

//--------------------------------------------------------------------------------------------
// Src environment
//--------------------------------------------------------------------------------------------
export const ALCHEMY_PROVIDER_API_KEY = "RF2sbfZ8A4tumj8is9RvNDSrmNFWgQcl";
export const ETHERSCAN_PROVIDER_API_KEY = "91V9JVJPFVIG14RK9UNJPWTWFX6DEP6G81";
export const INFURA_PROVIDER_API_KEY = "ff0173e53f944b2d913bed58f440b834";
export const BSCSCAN_PROVIDER_API_KEY = "I6Z66B54HIZACYDPCB1MKFH4RGWDHNXD7K";


//--------------------------------------------------------------------------------------------
// ETH Provider pool configuration
//--------------------------------------------------------------------------------------------
export const PROVIDER_POOL_CFG:Array<ProviderConfig> =
[
	{priority: 1, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.INFURA_PROVIDER_ID_1,		provider_type: ProviderType.INFURA},
	{priority: 1, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.ALCHEMY_PROVIDER_ID_1,		provider_type: ProviderType.ALCHEMY},

	{priority: 2, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.INFURA_PROVIDER_ID_2,		provider_type: ProviderType.INFURA},
	{priority: 2, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.INFURA_PROVIDER_ID_3,		provider_type: ProviderType.INFURA},
	{priority: 2, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.ALCHEMY_PROVIDER_ID_2,		provider_type: ProviderType.ALCHEMY},

	{priority: 3, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.ETHERSCAN_PROVIDER_ID_1,	provider_type: ProviderType.ETHERSCAN},
	{priority: 3, weight: 1, stallTimeout: 2 * 1000, providerId: process.env.ETHERSCAN_PROVIDER_ID_2,	provider_type: ProviderType.ETHERSCAN}
];
export const PROVIDER_POOL_QUORUM:number			= 2;

//--------------------------------------------------------------------------------------------
// Binance Smart Chain Provider pool configuration
//--------------------------------------------------------------------------------------------
export const JSON_RPC_BSC_PROVIDER_ID_0:string					= USE_MAINNET
																	? 'https://bsc-dataseed1.binance.org:443/'
																	: 'https://data-seed-prebsc-2-s3.binance.org:8545/';
export const JSON_RPC_BSC_PROVIDER_ID_1:string					= USE_MAINNET
																	? 'https://bsc-dataseed2.binance.org:443/'
																	: 'https://data-seed-prebsc-2-s1.binance.org:8545/';
export const JSON_RPC_BSC_PROVIDER_ID_2:string					= USE_MAINNET
																	? 'https://bsc-dataseed3.binance.org:443/'
																	: 'https://data-seed-prebsc-1-s2.binance.org:8545/';
export const JSON_RPC_BSC_PROVIDER_ID_3:string					= USE_MAINNET
																	? 'https://bsc-dataseed4.binance.org:443/'
																	: 'https://data-seed-prebsc-1-s3.binance.org:8545/';
export const PROVIDER_POOL_BSC_CFG:Array<ProviderConfig> =
[
	{priority: 1, weight: 1, stallTimeout: 2 * 1000, providerId: JSON_RPC_BSC_PROVIDER_ID_0,	provider_type: ProviderType.JSON_RPC},
	{priority: 1, weight: 1, stallTimeout: 2 * 1000, providerId: JSON_RPC_BSC_PROVIDER_ID_1,	provider_type: ProviderType.JSON_RPC},

	{priority: 2, weight: 1, stallTimeout: 2 * 1000, providerId: JSON_RPC_BSC_PROVIDER_ID_2,	provider_type: ProviderType.JSON_RPC},
	{priority: 2, weight: 1, stallTimeout: 2 * 1000, providerId: JSON_RPC_BSC_PROVIDER_ID_3,	provider_type: ProviderType.JSON_RPC}
];

//--------------------------------------------------------------------------------------------
// BRIDGE
//--------------------------------------------------------------------------------------------
export const ETH_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK:number	= USE_MAINNET
																	? 0 //todo
																	: 24396845;

export const BSC_BRIDGE_START_LISTEN_EVENTS_FROM_BLOCK:number	= USE_MAINNET
																	? 0 //todo
																	: 8204691;

//--------------------------------------------------------------------------------------------
// Ethereum Bridge contract
//--------------------------------------------------------------------------------------------
export const ETH_TELEPORT_AGENT_CONTRACT_ADDRESS:string			= USE_MAINNET
																	? "".toLowerCase()
																	: "0x4A92724471C2e98B662169fc5efF1040b09436cb".toLowerCase();
//--------------------------------------------------------------------------------------------
// Binance Smart Chain Bridge contract
//--------------------------------------------------------------------------------------------
export const BSC_TELEPORT_AGENT_CONTRACT_ADDRESS:string			= USE_MAINNET
																	? "".toLowerCase()
																	: "0x4BEB6b218917FcE7824445d5398187e2B1A259cF".toLowerCase();

//--------------------------------------------------------------------------------------------
// Ethereum Bridge contract
//--------------------------------------------------------------------------------------------
export const ETH_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS:string		= USE_MAINNET
																	? "".toLowerCase()
																	: "0x75412121FB2F46CDFa6aF8f1fd0c0AC5409eb9d2".toLowerCase();
//--------------------------------------------------------------------------------------------
// Binance Smart Chain Bridge contract
//--------------------------------------------------------------------------------------------
export const BSC_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS:string		= USE_MAINNET
																	? "".toLowerCase()
																	: "0x3aaD0cC127cFE1c527C18D537141214839096914".toLowerCase();

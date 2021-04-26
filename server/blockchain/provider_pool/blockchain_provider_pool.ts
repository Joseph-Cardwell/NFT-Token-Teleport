const ethers = require('ethers');
import {ProviderConfig, ProviderType} from '../types';
import {ETHERS_NAME,
		PROVIDER_POOL_QUORUM,
		PROVIDER_POOL_CFG,
		PROVIDER_POOL_BSC_CFG} from '../../../config';

//**************************************************************************************************
function createFallbackProvider()
{
	const config = createFallbackProviderConfig(ETHERS_NAME, PROVIDER_POOL_CFG);
	return  new ethers.providers.FallbackProvider(config, PROVIDER_POOL_QUORUM);
}
//**************************************************************************************************
function createFallbackProviderBsc()
{
	const config = createFallbackProviderConfig('', PROVIDER_POOL_BSC_CFG);
	return  new ethers.providers.FallbackProvider(config, PROVIDER_POOL_QUORUM);
}
//**************************************************************************************************
function createFallbackProviderConfig(network: string, providerPoolConfiguration: Array<ProviderConfig>): Array<any>
{
	let fallbackConfig: Array<any> = [];
	
	for(const id in providerPoolConfiguration)
	{
		const config = providerPoolConfiguration[id];
		
		let fallbackProviderConfig =
		{
			provider: undefined,
			weight: config.weight,
			priority: config.priority,
			stallTimeout: config.stallTimeout,
		};
		switch(config.provider_type)
		{
			case ProviderType.ETHERSCAN:
				fallbackProviderConfig.provider = new ethers.providers.EtherscanProvider(network, config.providerId);
				break;
			case ProviderType.INFURA:
				fallbackProviderConfig.provider = new ethers.providers.InfuraProvider(network, config.providerId);
				break;
			case ProviderType.ALCHEMY:
				fallbackProviderConfig.provider = new ethers.providers.AlchemyProvider(network, config.providerId);
				break;
			case ProviderType.JSON_RPC:
				fallbackProviderConfig.provider = new ethers.providers.JsonRpcProvider(config.providerId);
				break;
		}
		fallbackConfig.push(fallbackProviderConfig);
	}

	return fallbackConfig;
}

export const fallbackProviderEth = createFallbackProvider();
export const fallbackProviderBsc = createFallbackProviderBsc();
import
{
    ALCHEMY_PROVIDER_API_KEY,
    BSCSCAN_PROVIDER_API_KEY,
    BSC_TELEPORT_AGENT_CONTRACT_ADDRESS,
    ETHERSCAN_PROVIDER_API_KEY,
    ETH_TELEPORT_AGENT_CONTRACT_ADDRESS,
    INFURA_PROVIDER_API_KEY
} from "config";

export const environment = {
    production: true,
    networks: {
        ethereum: { chainId: 42, name: 'kovan' },
        bsc: { chainId: 97, name: 'bsc-testnet' }
    },
    network_names: {
        1: 'Ethereum Mainnet',
        42: 'Ethereum Kovan',
        56: 'Binance Smart Chain Mainnet',
        97: 'Binance Smart Chain Testnet'
    },
    opposite_networks: {
        1: 56,
        56: 1,
        42: 97,
        97: 42
    },
    providers: {
        alchemy: ALCHEMY_PROVIDER_API_KEY,
        etherscan: ETHERSCAN_PROVIDER_API_KEY,
        bscscan: BSCSCAN_PROVIDER_API_KEY
    },
    rpc_nodes: {
        bsc: {
            'mainnet': [
                'https://bsc-dataseed.binance.org/',
                'https://bsc-dataseed1.defibit.io/',
                'https://bsc-dataseed1.ninicoin.io/',
                'https://bsc-dataseed1.binance.org/',
                'https://bsc-dataseed2.binance.org/',
                'https://bsc-dataseed3.binance.org/'
            ],
            'bsc-testnet': [
                'https://data-seed-prebsc-1-s1.binance.org:8545/',
                'https://data-seed-prebsc-2-s1.binance.org:8545/',
                'https://data-seed-prebsc-1-s2.binance.org:8545/',
                'https://data-seed-prebsc-2-s2.binance.org:8545/',
                'https://data-seed-prebsc-1-s3.binance.org:8545/',
                'https://data-seed-prebsc-2-s3.binance.org:8545/'
            ]
        }
    },
    api: {
        etherscan: {
            kovan: 'https://api-kovan.etherscan.io/api',
            mainnet: 'https://api.etherscan.io/api'
        },
        bscscan: {
            'bsc-testnet': 'https://api-testnet.bscscan.com/api',
            mainnet: 'https://api.bscscan.com/api'
        }
    },
    teleport_agents: {
        ethereum: {
            kovan: ETH_TELEPORT_AGENT_CONTRACT_ADDRESS,
            mainnet: ''
        },
        bsc: {
            'bsc-testnet': BSC_TELEPORT_AGENT_CONTRACT_ADDRESS,
            mainnet: ''
        }
    },
    walletconnect: {
        rpc: {
            1: `https://mainnet.infura.io/v3/${INFURA_PROVIDER_API_KEY}`,
            42: `https://kovan.infura.io/v3/${INFURA_PROVIDER_API_KEY}`,
            56: "https://bsc-dataseed.binance.org/",
            97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
        }
    },
    default_contracts: {
        bsc: [
            "0x3aad0cc127cfe1c527c18d537141214839096914",
            "0x03aeef0d6dd7291a80e57f89d32d05fe3615eb2a"
        ],
        ethereum: [
            "0x4db1e6883dabad3fd432e2bd9c2a5a84f36d465c",
            "0x75412121fb2f46cdfa6af8f1fd0c0ac5409eb9d2"
        ]
    }
};

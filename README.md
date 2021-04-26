Aye there, human behind the computer!👋

Scotty on the line. Where you may see a silly hamster,
others see a miracle worker, a captain by rank,
and an engineer by calling.

I have spent my whole life
trying to figure out crazy ways of doing things.
Now my duty is to maintain and operate the NFT Transporter,
which can beam your precious NFTs from Ethereum to the Binance Smart Chain
and other way around. Wee bit tricky, but I can show you how it works.

Ready?

All right, you lovelies, hold together!

-----------------------------------------------------------------------------

## Getting started:

1. Deploy NFT token contracts.
This teleport works with any NFT token, that conforms to EIP-721 standart (https://eips.ethereum.org/EIPS/eip-721).
But for the sake of simplicity we provide our own NFT token contracts, that you can deploy into testnets of Ethereum and Binance Smart Chain.
- Deploy smart-contracts/TestnetNft/ScottyBeam/ScottyBeam.sol

2. Deploy teleport contracts.
In both Ethereum and Binance Smart Chain you have to deploy following contracts:
- ERC721Implementation.sol - implementation of teleported/wrapped NFT tokens
- NftTeleportAgent.sol - agent for NFT teleportation

Pro tip:
If you want to deploy one contract in different networks to the same address, you should know that
the address a contract is deployed to is generated deterministically using the address of the deployer
and the deployer's total number of transactions (the nonce).

4. Configure web-service.

4.1 Configure environment variables.
Add file with name '.env' and specify following variables there:

Private keys of NftTeleportAgent owner:
ORACLE_BRIDGE_ETH_PK
ORACLE_BRIDGE_BSC_PK

Blockchain provider API keys:
INFURA_PROVIDER_ID_1
INFURA_PROVIDER_ID_2
INFURA_PROVIDER_ID_3
ALCHEMY_PROVIDER_ID_1
ALCHEMY_PROVIDER_ID_2
ETHERSCAN_PROVIDER_ID_1
ETHERSCAN_PROVIDER_ID_2

* You can edit PROVIDER_POOL_CFG constant in ./config.ts file in order to change the required pool of blockchain providers.

4.2 Specify values of deployed smart contracts in ./config.ts file.
Following constants must be set:
ETH_TELEPORT_AGENT_CONTRACT_ADDRESS
BSC_TELEPORT_AGENT_CONTRACT_ADDRESS
ETH_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS
BSC_FAUCET_SCOTTY_BEAM_CONTRACT_ADDRESS

5. Start web-service.
Development configuration:
`-npm install`
`-npm run dev:ssr`

Production configuration:
`-npm install`
`-npm run build:ssr`
`-node index.js`

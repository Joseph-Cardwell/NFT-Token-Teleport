import { Injectable, Provider } from '@angular/core';
import { Contract, providers, utils } from 'ethers';
import { environment } from '../../../environments/environment';
import { BlockchainApiService } from '../blockchain-api/blockchain-api.service';
import { BlockchainConnectorService } from '../blockchain-connector/blockchain-connector.service';
import ERC721_METADATA_ABI from '../../../../server/abi/IERC721Metadata.json';
import NFT_TELEPORt_AGENT_ABI from '../../../../server/abi/NFTTeleportAgent.json';
import { Observable, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export type Platform = 'ethereum' | 'bsc'

export type AccountToken = {
    contractAddress: string
    contract: Contract;
    symbol: string;
    name: string;
    tokenId: string;
    tokenURI: any;
    platform: Platform;
    wrapped: boolean;
}

export enum NftSearchingState
{
    Searching = 'Searching',
    Searched = 'Searched'
}

@Injectable({
    providedIn: 'root'
})
export class NftObserverService
{

    private ethereumProvider: providers.Provider;
    private bscProvider: providers.Provider;
    private tokens: AccountToken[] = [];
    private tokensSubject: ReplaySubject<AccountToken[]> = new ReplaySubject(1);
    private tokensCount: number = 0;
    private tokensCountSubject: ReplaySubject<number> = new ReplaySubject(1);
    private nftSearchStateSubject: ReplaySubject<NftSearchingState> = new ReplaySubject(1);
    private contractsCount = 0;
    private contractProccessedCount = 0;

    constructor(
        private blockchainConnector: BlockchainConnectorService,
        private blockchainApi: BlockchainApiService,
        private http: HttpClient
    )
    {
        this.blockchainConnector.state.subscribe(_state => 
        {
            if (_state) return this.loadTokens();

            this.tokens = [];
            this.tokensSubject.next(this.tokens);
            this.ethereumProvider = null;
            this.bscProvider = null;
            this.tokensCount = 0;
            this.tokensCountSubject.next(0);
            this.contractsCount = 0;
            this.contractProccessedCount = 0;
            this.nftSearchStateSubject.next(NftSearchingState.Searched);
        });
    }

    get accountTokens(): Observable<AccountToken[]>
    {
        return this.tokensSubject.asObservable();
    }

    get accountTokensCount(): Observable<number>
    {
        return this.tokensCountSubject.asObservable();
    }

    get searchState(): Observable<NftSearchingState>
    {
        return this.nftSearchStateSubject.asObservable();
    }

    public async getTokens(_force: boolean = false)
    {
        if (!_force) return this.accountTokens.pipe(take(1)).toPromise();

        this.tokensCount = 0;
        this.tokensCountSubject.next(0);
        this.tokens = [];
        this.tokensSubject.next(this.tokens);
        this.contractsCount = 0;
        this.contractProccessedCount = 0;
        this.nftSearchStateSubject.next(NftSearchingState.Searching);
        await this.loadTokens();

        return this.accountTokens.pipe(take(1)).toPromise();
    }

    public getToken(_platform: Platform, _contract: string, _tokenId: string): AccountToken
    {
        return this.tokens.find(_item => 
        {
            return _item.platform === _platform &&
                _item.contractAddress.toLowerCase() === _contract.toLowerCase() &&
                _item.tokenId === _tokenId
        });
    }

    public async checkToken(_contractAddress: string, _tokenId: string, _platform: Platform): Promise<boolean>
    {
        try 
        {
            let contract: Contract;

            if (_platform === 'bsc')
            {
                contract = new Contract(_contractAddress, ERC721_METADATA_ABI, this.bscProvider);
            }
            else
            {
                contract = new Contract(_contractAddress, ERC721_METADATA_ABI, this.ethereumProvider);
            }

            const ownerAddress = await contract.ownerOf(_tokenId.toString());

            return ownerAddress.toLowerCase() === this.blockchainConnector.walletAddress.toLowerCase();
        }
        catch (e)
        {
            console.error(e.message);
            return false;
        }
    }

    private async loadTokens()
    {
        this.tokens = [];
        this.tokensSubject.next(this.tokens);
        
        const walletAddress = this.blockchainConnector.walletAddress;
        const network = <providers.Network>this.blockchainConnector.network;
        const networks = this.blockchainApi.getNetworks(network);
        this.nftSearchStateSubject.next(NftSearchingState.Searching);

        this.setupProviders(networks);

        const etherTokens = await this.blockchainApi.getEtherNFTTokensTransactions(walletAddress, networks.ethereum.name);
        const bscTokens = await this.blockchainApi.getBscNFTTokensTransactions(walletAddress, networks.bsc.name);

        this.contractsCount = Object.keys(etherTokens).length + Object.keys(bscTokens).length;

        if (this.contractsCount === 0)
        {
            this.nftSearchStateSubject.next(NftSearchingState.Searched);
        }

        await Promise.all([
            this.loadEthereumWalletNFTTokens(walletAddress, etherTokens),
            this.loadBscWalletNFTTokens(walletAddress, bscTokens)
        ]);
    }

    private async loadEthereumWalletNFTTokens(_walletAddress: string, _tokens: Record<string, string[]>)
    {
        const agentsAddress = this.getTeleportAgents();

        await this.loadWalletNFTTokens(_walletAddress, _tokens, this.ethereumProvider, agentsAddress.ethereum, 'ethereum');
    }

    private async loadBscWalletNFTTokens(_walletAddress: string, _tokens: Record<string, string[]>)
    {
        const agentsAddress = this.getTeleportAgents();

        await this.loadWalletNFTTokens(_walletAddress, _tokens, this.bscProvider, agentsAddress.bsc, 'bsc');
    }

    private async loadWalletNFTTokens(_walletAddress: string, _tokens: Record<string, string[]>, _provider: providers.Provider, _agentAdress: string, _platform: Platform)
    {
        if (!_provider) return;

        const teleportAgentContract = new Contract(_agentAdress, NFT_TELEPORt_AGENT_ABI, _provider);

        Object.keys(_tokens).forEach(async (contractAddress) => 
        {
            if (!_provider) return;

            const contract = new Contract(contractAddress, ERC721_METADATA_ABI, _provider);

            const balanceBN = await contract.balanceOf(_walletAddress)

            const balance = utils.formatUnits(balanceBN, 0);

            if (Number(balance) === 0) 
            {
                return this.incrementProcessedContract();
            }

            this.incrementTokensCount(balance);
            this.incrementProcessedContract();

            const wrapped = await teleportAgentContract.wrappedErc721_(contractAddress);

            const symbol = await contract.symbol();
            const name = await contract.name();

            if (await contract.supportsInterface("0x780e9d63"))
            {
                this.loadTokensByEnumerable(_walletAddress, Number(balance), _provider, contract, _platform, name, symbol, wrapped);
            }
            else
            {
                this.loadTokensByContractAndTokenId(_walletAddress, _tokens, _provider, contract, _platform, name, symbol, wrapped);
            }
        })
    }

    private async loadTokensByEnumerable(
        _walletAddress: string,
        _balance: number,
        _provider: providers.Provider,
        _contract: Contract,
        _platform: Platform,
        _name: string,
        _symbol: string,
        _wrapped: boolean): Promise<void>
    {
        Array.apply(null, Array(_balance)).forEach(async (_item, _index) => 
        {
            if (!_provider) return;

            const tokenIdBN = await _contract.tokenOfOwnerByIndex(_walletAddress, _index);

            const tokenId = utils.formatUnits(tokenIdBN, 0).split('.')[0];

            let tokenURI = await _contract.tokenURI(tokenId);

            const tokenData = await this.parseTokenUri(tokenURI, _name);

            this.addToken({
                contractAddress: _contract.address,
                contract: _contract,
                symbol: _symbol,
                name: _name,
                tokenId: tokenId,
                tokenURI: tokenURI,
                platform: _platform,
                wrapped: _wrapped,
                ...tokenData
            });
        })
    }

    private async loadTokensByContractAndTokenId(
        _walletAddress: string,
        _tokens: Record<string, string[]>,
        _provider: providers.Provider,
        _contract: Contract,
        _platform: Platform,
        _name: string,
        _symbol: string,
        _wrapped: boolean): Promise<void>
    {
        await Promise.all(_tokens[_contract.address].map(async (_tokenID: string) =>
        {
            if (!_provider) return;

            const ownerAddress = await _contract.ownerOf(_tokenID);

            if (ownerAddress.toLowerCase() !== _walletAddress.toLowerCase()) return;

            let tokenURI = await _contract.tokenURI(_tokenID);

            const tokenData = await this.parseTokenUri(tokenURI, _name);

            this.addToken({
                contractAddress: _contract.address,
                contract: _contract,
                symbol: _symbol,
                name: _name,
                tokenId: _tokenID,
                tokenURI: tokenURI,
                platform: _platform,
                wrapped: _wrapped,
                ...tokenData
            });

            return;
        }));
    }

    private async parseTokenUri(_tokeUri: string, _name: string): Promise<{ tokenURI: string, name: string }>
    {
        try
        {

            if (_tokeUri.match(/\.(jpeg|jpg|gif|png)(.*)$/))
            {
                return {
                    tokenURI: _tokeUri,
                    name: _name
                }
            }

            const response = <any>await this.http.post('/api/bridge/get-nftoken-metadata', { uri: _tokeUri }).toPromise();

            return {
                tokenURI: response.data.image || response.data.properties?.image || _tokeUri,
                name: response.data.name || response.data.properties?.name || _name,
            }
        }
        catch (e)
        {
            return {
                tokenURI: _tokeUri,
                name: _name
            }
        }

    }

    private setupProviders(_networks: { ethereum: providers.Network, bsc: providers.Network })
    {
        this.ethereumProvider = new providers.AlchemyProvider(_networks.ethereum, environment.providers.alchemy);
        this.bscProvider = this.getBSCProvider(environment.rpc_nodes.bsc[_networks.bsc.name], _networks.bsc);
        return;
    }

    private getBSCProvider(_jsonRpcNodes: string[], _network: providers.Network): providers.FallbackProvider
    {
        const jsonRpcProviders = [];

        _jsonRpcNodes.forEach(_item =>
        {
            jsonRpcProviders.push(new providers.JsonRpcProvider(_item, _network));
        });

        return new providers.FallbackProvider(jsonRpcProviders, 1);
    }

    public getTeleportAgents(): { ethereum: string, bsc: string }
    {
        const chainId = this.blockchainConnector.network.chainId
        if (chainId === 42 || chainId === 97)
        {
            return {
                ethereum: environment.teleport_agents.ethereum.kovan,
                bsc: environment.teleport_agents.bsc['bsc-testnet']
            }
        }

        return {
            ethereum: environment.teleport_agents.ethereum.mainnet,
            bsc: environment.teleport_agents.bsc.mainnet
        }
    }

    private incrementTokensCount(_count: number | string)
    {
        this.tokensCount += Number(_count);
        this.tokensCountSubject.next(this.tokensCount);
    }

    private addToken(_token: AccountToken)
    {
        this.tokens.push(_token);
        this.tokensSubject.next(this.tokens);
    }

    private incrementProcessedContract()
    {
        this.contractProccessedCount++;

        if (this.contractsCount === this.contractProccessedCount)
        {
            this.nftSearchStateSubject.next(NftSearchingState.Searched);
        }
    }
}

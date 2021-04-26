import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { providers, utils, VoidSigner } from 'ethers';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { getPlatformByChainId } from '../../shared/utils';
import { Platform } from '../nft-observer/nft-observer.service';
import { TxFromApi } from '../teleport/teleport.service';

export type Connectors = 'walletconnect' | 'metamask';

@Injectable({
    providedIn: 'root'
})
export class BlockchainConnectorService
{

    private stateSubject: ReplaySubject<boolean> = new ReplaySubject(1);
    private network_: providers.Network;
    private walletAddress_: string;
    private externalProvider: any;
    private externalWeb3Provider: providers.Web3Provider;
    private internalProvider: providers.Provider;
    private wallet: VoidSigner;
    private connector_: Connectors;

    constructor(
        private router: Router
    )
    {
        this.stateSubject.next(false);

        this.stateSubject.subscribe(_state => 
            {
                if (!_state)
                {
                    this.router.navigateByUrl('/wallet');
                }
            });
    }

    public async connect(_connector: Connectors, _platform: Platform = 'ethereum')
    {
        this.network_ = environment.networks[_platform];
        this.connector_ = _connector;

        if (_connector === 'metamask')
        {
            await this.connectToMetamask();
        }

        if (_connector === 'walletconnect')
        {
            await this.connectToWalletconnect();
        }
    }

    public async disconnect()
    {
        await this.resetConnection();
    }

    get walletAddress(): string
    {
        return this.walletAddress_;
    }

    get network(): providers.Network
    {
        return this.network_;
    }

    get state(): Observable<boolean>
    {
        return this.stateSubject.asObservable().pipe(distinctUntilChanged());
    }

    get connector(): Connectors
    {
        return this.connector_;
    }

    public async getBalance(): Promise<number>
    {
        const balance = await this.wallet.getBalance();

        return Number(utils.formatEther(balance));
    }

    public async sendTransation(_tx: TxFromApi): Promise<providers.TransactionResponse>
    {
        if (this.externalWeb3Provider == null) throw new Error('NO_PROVIDER');

        const tx = {
            from: _tx.from,
            to: _tx.to,
            data: _tx.data,
            gasLimit: Number(_tx.gasLimit).toString(),
            gasPrice: Number(_tx.gasPrice).toString(),
            value: Number(_tx.value).toString(),
            nonce: _tx.nonce,
            chainId: _tx.chainId,
        };

        try
        {
            tx.gasLimit = <any>utils.parseUnits(tx.gasLimit.toString(), 'wei');
            tx.value = <any>utils.parseUnits(tx.value.toString(), 'wei');
            tx.gasPrice = <any>utils.parseUnits(tx.gasPrice.toString(), 'wei')

            const signer = await this.externalWeb3Provider.getSigner(this.walletAddress);

            const populatedTx = await signer.populateTransaction(tx);
            const txResponse = await signer.sendTransaction(populatedTx);

            return txResponse;
        } catch (e)
        {
            console.error(e);

            if (e.code === 4001 || e.message.toLowerCase().includes('user rejected'))
            {
                throw new Error('CANCEL');
            }

            throw e;
        }
    }

    public async waitTxConfirmation(_txData: string | providers.TransactionResponse, _confirmations = 1): Promise<void>
    {
        let tx: providers.TransactionResponse;

        if (typeof _txData === "string") tx = await this.internalProvider.getTransaction(_txData);
        else tx = _txData;

        await tx.wait(_confirmations);
    }

    private async connectToMetamask()
    {
        try 
        {
            console.debug('Start connect to metamask...');

            this.externalProvider = window['ethereum'];

            if (this.network.chainId === 97 || this.network.chainId === 56)
            {
                await this.tryToAddBSCNetworkToMetamask();
            }

            this.externalWeb3Provider = new providers.Web3Provider(this.externalProvider);

            if (this.network_.chainId !== providers.getNetwork(Number(this.externalProvider.networkVersion)).chainId)
            {
                throw new Error('WRONG_NETWORK');
            }

            if (this.network.chainId === 97 || this.network.chainId === 56)
            {
                this.internalProvider = this.getBSCProvider();
            }
            else 
            {
                this.internalProvider = new providers.AlchemyProvider(this.network_, environment.providers.alchemy);
            }

            const addreses = await this.externalWeb3Provider.send('eth_requestAccounts', []);

            this.walletAddress_ = addreses[0];
            this.wallet = new VoidSigner(this.walletAddress, this.internalProvider);

            console.debug(`Connected to metamask with address ${this.walletAddress}`);

            this.listenChainIdChange();
            this.listenDisconnect();

            this.stateSubject.next(true);
        }
        catch (e)
        {
            console.error(`Failed to connect to metamask.`, e);

            if (e.message === 'WRONG_NETWORK') throw e;

            this.resetConnection();
        }
    }

    private async connectToWalletconnect()
    {
        const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;

        this.externalProvider = new WalletConnectProvider({
            chainId: this.network_.chainId,
            rpc: environment.walletconnect.rpc
        });

        const addreses = await this.externalProvider.enable();

        this.externalWeb3Provider = new providers.Web3Provider(this.externalProvider, this.network_);

        if (this.network.chainId === 97 || this.network.chainId === 56)
        {
            this.internalProvider = this.getBSCProvider();
        }
        else 
        {
            this.internalProvider = new providers.AlchemyProvider(this.network_, environment.providers.alchemy);
        }

        this.walletAddress_ = addreses[0];
        this.wallet = new VoidSigner(this.walletAddress, this.internalProvider);

        console.debug(`Connected to walletconnect with address ${this.walletAddress}`);

        this.listenChainIdChange();
        this.listenDisconnect();

        this.stateSubject.next(true);

        return;
    }

    private async resetConnection()
    {
        if (!this.externalProvider) return;
        
        this.stateSubject.next(false);

        try {
            if (Boolean(this.externalProvider?.close)) await this.externalProvider.close();
        } catch (e)
        {}

        
        this.externalProvider = null;
        this.externalWeb3Provider = null;
        this.network_ = null;
        this.internalProvider = null;
        this.walletAddress_ = null;
        this.wallet = null;
    }

    private async tryToAddBSCNetworkToMetamask(): Promise<void>
    {
        try 
        {
            if (this.network.chainId === 97)
            {
                await this.externalProvider.request({
                    method: 'wallet_addEthereumChain', 
                    params: [
                        {
                            chainId: `0x${Number(97).toString(16)}`,
                            chainName: 'Binance Smart Chain Testnet',
                            nativeCurrency: {
                                name: 'Binance Chain Native Token',
                                symbol: 'BSC',
                                decimals: 18
                            },
                            rpcUrls: environment.rpc_nodes.bsc['bsc-testnet'],
                            blockExplorerUrls: ['https://testnet.bscscan.com/']
                        }
                    ]
                });
            }
            else if (this.network.chainId === 56)
            {
                await this.externalProvider.request({
                    method: 'wallet_addEthereumChain', 
                    params: [
                        {
                            chainId: `0x${Number(56).toString(16)}`,
                            chainName: 'Binance Smart Chain',
                            nativeCurrency: {
                                name: 'Binance Chain Native Token',
                                symbol: 'BSC',
                                decimals: 18
                            },
                            rpcUrls: environment.rpc_nodes.bsc.mainnet,
                            blockExplorerUrls: ['https://bscscan.com/']
                        }
                    ]
                });
            }
        }
        catch(e)
        {
            console.error(e);
        }
    }

    private getBSCProvider(): providers.FallbackProvider
    {
        const jsonRpcProviders = [];

        const jsonRpcNodes = environment.rpc_nodes.bsc[this.network_.name];

        jsonRpcNodes.forEach(_item =>
        {
            jsonRpcProviders.push(new providers.JsonRpcProvider(_item, this.network_));
        });

        return new providers.FallbackProvider(jsonRpcProviders, 1);
    }

    private listenChainIdChange()
    {
        this.externalProvider.on('chainChanged', (_chainId: number | string) => {
            const chainId = Number(_chainId);

            if (!this.network_) return;

            if (this.network_?.chainId === chainId) return;

            if (environment.networks.ethereum.chainId === chainId)
            {
                this.changeNetwork(environment.networks.ethereum);
            }
            else if (environment.networks.bsc.chainId === chainId)
            {
                this.changeNetwork(environment.networks.bsc);
            }
            else 
            {
                this.resetConnection();
            }
        });
    }

    private listenDisconnect()
    {
        this.externalProvider.on('disconnect', async (_chainId: number | string) => {
            if (!await this.state.pipe(take(1)).toPromise()) return;
            
            this.resetConnection();
        });
    }

    private async changeNetwork(_network: providers.Network)
    {
        this.network_ = _network;

        if (this.network.chainId === 97 || this.network.chainId === 56)
        {
            this.internalProvider = this.getBSCProvider();
            this.externalProvider = 
            this.externalWeb3Provider = new providers.Web3Provider(this.externalProvider);
            this.wallet = new VoidSigner(this.walletAddress, this.internalProvider);
            this.externalProvider = null;
            this.externalWeb3Provider = null;
            this.network_ = null;
            this.internalProvider = null;
            this.walletAddress_ = null;
            this.wallet = null;
        }
        else 
        {
            this.internalProvider = new providers.AlchemyProvider(this.network_, environment.providers.alchemy);
            this.externalWeb3Provider = new providers.Web3Provider(this.externalProvider);
            this.wallet = new VoidSigner(this.walletAddress, this.internalProvider);
        }

        if (this.connector_ === 'walletconnect')
        {
            this.externalWeb3Provider = new providers.Web3Provider(this.externalProvider, this.network_);
            this.wallet = new VoidSigner(this.walletAddress, this.internalProvider);
        }
    }
}

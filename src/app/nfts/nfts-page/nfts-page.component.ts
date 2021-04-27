import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../services/alert/alert.service';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { AllowedTokensFaucet, FaucetService } from '../../services/faucet/faucet.service';
import { AccountToken, NftObserverService, NftSearchingState, Platform } from '../../services/nft-observer/nft-observer.service';
import { TxFromApi } from '../../services/teleport/teleport.service';
import { parseImgSrc } from '../../shared/utils';

@Component({
    selector: 'app-nfts-page',
    templateUrl: './nfts-page.component.html',
    styleUrls: ['./nfts-page.component.scss']
})
export class NftsPageComponent implements OnInit, OnDestroy
{

    public tokens: AccountToken[] = [];
    public state: 'loading' | 'loaded' = 'loading';
    public tokensCount: number = 0;

    public isFaucetAllowed: AllowedTokensFaucet;
    public showFaucetTokens: boolean = false;
    public faucetPlatform: Platform;
    public faucetTx: TxFromApi;
    public processingFaucet: boolean = false;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private nftsObserver: NftObserverService,
        private router: Router,
        private blockchainConnector: BlockchainConnectorService,
        private alertService: AlertService,
        private faucetService: FaucetService
    ) { }

    async ngOnInit()
    {
        this.state = 'loading';

        this.subscriptions.add(this.nftsObserver.searchState.subscribe(_state =>
        {
            if (_state === NftSearchingState.Searched) this.state = 'loaded';
        }));

        this.subscriptions.add(this.nftsObserver.accountTokens.subscribe(_tokens =>
        {
            this.tokens = _tokens;
        }));

        this.subscriptions.add(this.nftsObserver.accountTokensCount.subscribe(_count => this.tokensCount = _count));

        this.isFaucetAllowed = await this.faucetService.canGetTokens();
    }

    ngOnDestroy()
    {
        this.subscriptions.unsubscribe();
    }

    public teleport(_token: AccountToken)
    {
        if (!this.checkNetwork(_token.platform)) return;

        this.router.navigate(['/teleport'], {
            queryParams: {
                platform: _token.platform,
                contract: _token.contractAddress.toLowerCase(),
                token_id: _token.tokenId
            },
            queryParamsHandling: 'merge'
        })
    }

    public checkNetwork(_tokenPlatform: Platform): boolean
    {
        const network = this.blockchainConnector.network;
        const connector = this.blockchainConnector.connector;

        let wrongNetwork = false;
        
        if ([56, 97].includes(network.chainId) && _tokenPlatform !== 'bsc')
        {
            wrongNetwork = true;

        }
        else if ([1, 42].includes(network.chainId) && _tokenPlatform !== 'ethereum')
        {
            wrongNetwork = true;
        }

        if (wrongNetwork && connector === 'metamask')
        {
            this.alertService.show({
                title: "ALERTS.METAMASK-WRONG-NETWORK.TITLE",
                message: "ALERTS.METAMASK-WRONG-NETWORK.DESCRIPTION",
                params: { network: environment.network_names[environment.opposite_networks[network.chainId]] },
                type: 'network-change',
                network_data: { platform: _tokenPlatform, connector: "metamask" },
            });
        }

        if (wrongNetwork && connector === 'walletconnect')
        {
            this.alertService.show({
                title: "ALERTS.WALLETCONNECT-WRONG-NETWORK.TITLE",
                message: "ALERTS.WALLETCONNECT-WRONG-NETWORK.DESCRIPTION",
                type: 'network-change',
                network_data: { platform: _tokenPlatform, connector: "walletconnect" },
                params: { network: environment.network_names[environment.opposite_networks[network.chainId]] }
            });
        }

        return !wrongNetwork;
    }

    public parseImgUrl(_event, _token)
    {
        const isLoadedBefore = _event.target.getAttribute('data-second-load');

        if (Boolean(isLoadedBefore)) return;

        _event.target.onerror = null;
        _event.target.setAttribute('data-second-load', 'true');
        _event.target.src = parseImgSrc(_event.target.src);
    }

    public async faucetTokens(_platform: Platform): Promise<void>
    {
        this.processingFaucet = true;
        this.faucetPlatform = _platform;

        if (!this.checkNetwork(_platform)) 
        {
            this.processingFaucet = false;
            return;
        }

        const balance = await this.blockchainConnector.getBalance();

        if (balance === 0)
        {
            let assets = 'ETH';

            if ([56, 97].includes(this.blockchainConnector.network.chainId))
            {
                assets = 'BNB';
            }

            this.alertService.show({ title: 'COMMON.SMALL-BALANCE.TITLE', message: 'COMMON.SMALL-BALANCE.DESCRIPTION', params: {asset: assets} });
            this.processingFaucet = false;
            return;
        }

        if (!this.isFaucetAllowed || !this.isFaucetAllowed[_platform.toLowerCase()]) return;

        try
        {
            this.faucetTx = await this.faucetService.faucetTokens(_platform);

            this.showFaucetTokens = true;
        }
        catch (e)
        {
            this.processingFaucet = false;
        }
    }

    public async hideFaucet(_success: boolean)
    {
        if (_success)
        {
            this.nftsObserver.getTokens(true);
            this.state = 'loading';
        }

        this.showFaucetTokens = false;

        this.isFaucetAllowed = await this.faucetService.canGetTokens(true);

        this.processingFaucet = false;
    }
}

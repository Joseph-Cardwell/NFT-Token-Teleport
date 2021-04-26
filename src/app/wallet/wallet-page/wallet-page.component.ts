import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debug } from 'node:console';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../services/alert/alert.service';
import { BlockchainConnectorService, Connectors } from '../../services/blockchain-connector/blockchain-connector.service';
import { Platform } from '../../services/nft-observer/nft-observer.service';

@Component({
    selector: 'app-wallet-page',
    templateUrl: './wallet-page.component.html',
    styleUrls: ['./wallet-page.component.scss']
})
export class WalletPageComponent implements OnInit
{

    public state: 'default' | 'connecting' = 'default';
    public connectionState: boolean = false;
    public connectionError: boolean = false;

    public connectors: string[] = ['walletconnect'];

    public selectedPlatform: Platform = 'ethereum';

    constructor(
        private blockchainConnector: BlockchainConnectorService,
        private alertService: AlertService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void
    {
        this.blockchainConnector.state.subscribe(_state => this.connectionState = _state);

        this.detectConnectors();

        this.checkParams();
    }

    get walletAddress(): string
    {
        return this.blockchainConnector.walletAddress;
    }

    public showWalletConnection(): void
    {
        this.connectionError = false;
        this.state = 'connecting';
    }

    public disconnectWallet(): void
    {
        this.blockchainConnector.disconnect();
    }

    public cancelConnectWallet(): void 
    {
        this.state = 'default';
    }

    public async connectWallet(_connector: Connectors)
    {
        try 
        {
            this.connectionError = false;
            await this.blockchainConnector.connect(_connector, this.selectedPlatform);

            this.cancelConnectWallet();
        }
        catch (e)
        {
            console.error(e);

            if (e.message === "WRONG_NETWORK")
            {
                this.checkNetwork();
            }
            else if (e.message === "User closed modal")
            {
                return;
            }
            else 
            {
                this.connectionError = true;
            }
        }
    }

    public selectPlatform(_platform: Platform)
    {
        this.selectedPlatform = _platform;
    }

    private detectConnectors(): void
    {
        if (window['ethereum'] && window['ethereum'].isMetaMask)
        {
            this.connectors = ['walletconnect', 'metamask'];
        }
    }

    public checkNetwork(): boolean
    {
        const network = this.blockchainConnector.network;
        const connector = this.blockchainConnector.connector;

        let wrongNetwork = false;

        if ([56, 97].includes(network.chainId) && this.selectedPlatform !== 'bsc')
        {
            wrongNetwork = true;

        }
        else if ([1, 42].includes(network.chainId) && this.selectedPlatform !== 'ethereum')
        {
            wrongNetwork = true;
        }

        if (connector === 'metamask')
        {
            this.alertService.show({
                title: "ALERTS.METAMASK-WRONG-NETWORK.TITLE",
                message: "ALERTS.METAMASK-WRONG-NETWORK.DESCRIPTION",
                params: { network: environment.network_names[network.chainId] }
            });
        }

        return !wrongNetwork;
    }

    private async checkParams()
    {
        const { platform, connector, action } = this.route.snapshot.queryParams;

        if (action === 'connect') 
        {
            await this.blockchainConnector.disconnect();

            this.connectionState = false;

            this.showWalletConnection();

            if (Boolean(platform)) this.selectPlatform(platform);

            if (Boolean(connector)) this.connectWallet(connector);
        }
    }
}

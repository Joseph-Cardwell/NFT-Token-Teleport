import { Component, OnInit } from '@angular/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { NftObserverService } from '../../services/nft-observer/nft-observer.service';

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit
{

    public connectionState: boolean = false;
    public hasTokens: boolean = false;

    constructor(
        private blockchainConnector: BlockchainConnectorService,
        private nftsObserver: NftObserverService
    ) { }

    ngOnInit(): void
    {
        this.blockchainConnector.state.subscribe(_state => this.connectionState = _state);
        this.nftsObserver.accountTokensCount.subscribe(_count => this.hasTokens = _count > 0);
    }

}

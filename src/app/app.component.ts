import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainConnectorService } from './services/blockchain-connector/blockchain-connector.service';
import { FaucetService } from './services/faucet/faucet.service';
import { NftObserverService } from './services/nft-observer/nft-observer.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent
{

    constructor(
        private nftObserver: NftObserverService,
        private translateService: TranslateService,
        private faucetService: FaucetService
    )
    {
        this.translateService.addLangs(['en'])
        this.translateService.setDefaultLang('en');
    }
}

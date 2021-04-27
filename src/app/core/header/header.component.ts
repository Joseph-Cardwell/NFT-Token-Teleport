import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { Platform } from '../../services/nft-observer/nft-observer.service';
import { getPlatformByChainId } from '../../shared/utils';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit
{

    public platform: Platform;

    constructor(
        private blockchainConnector: BlockchainConnectorService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void
    {
        this.blockchainConnector.state.subscribe(_state => 
        {
            if (!_state) 
            {
                this.platform = null;
            }
            else
            {
                this.platform = getPlatformByChainId(this.blockchainConnector.network.chainId);
            }

            this.cdr.detectChanges();
        })
    }

}

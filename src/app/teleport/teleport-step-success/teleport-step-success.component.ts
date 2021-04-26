import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { Platform } from '../../services/nft-observer/nft-observer.service';
import { TeleportService, TeleportState } from '../../services/teleport/teleport.service';
import { parseImgSrc } from '../../shared/utils';

@Component({
    selector: 'app-teleport-step-success',
    templateUrl: './teleport-step-success.component.html',
    styleUrls: ['./teleport-step-success.component.scss']
})
export class TeleportStepSuccessComponent implements OnInit
{
    public teleportState: TeleportState;

    constructor(
        private teleport: TeleportService,
        private blockchainConnector: BlockchainConnectorService,
        private router: Router
    ) { }

    ngOnInit(): void
    {
        this.teleportState = this.teleport.getState();
    }

    public getPlatformTo(): Platform
    {
        switch (this.teleportState.token.platform)
        {
            case 'ethereum':
                return 'bsc';
            case 'bsc':
                return 'ethereum';
        }
    }
    
    public parseImgUrl(_event)
    {
        const isLoadedBefore = _event.target.getAttribute('data-second-load');

        if (Boolean(isLoadedBefore)) return;
        
        _event.target.onerror = null;
        _event.target.setAttribute('data-second-load', 'true');
        _event.target.src = parseImgSrc(_event.target.src);
    }
}

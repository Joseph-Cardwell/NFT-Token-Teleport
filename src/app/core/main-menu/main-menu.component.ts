import { Component, OnInit } from '@angular/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit
{

    public connectionState: boolean = false;

    constructor(
        private blockchainConnector: BlockchainConnectorService
    ) { }

    ngOnInit(): void
    {
        this.blockchainConnector.state.subscribe(_state => this.connectionState = _state);
    }

}

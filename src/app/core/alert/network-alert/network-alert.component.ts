import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { BlockchainConnectorService } from '../../../services/blockchain-connector/blockchain-connector.service';
import { Platform } from '../../../services/nft-observer/nft-observer.service';

@Component({
    selector: 'app-network-alert',
    templateUrl: './network-alert.component.html',
    styleUrls: ['./network-alert.component.scss']
})
export class NetworkAlertComponent implements OnInit
{

    public title: string;
    public message: string;
    public params: Record<string, string>;
    public platform: Platform;
    public visible: boolean = false;

    constructor(
        private alertService: AlertService,
        private router: Router,
        private blockchainConnector: BlockchainConnectorService
    ) { }

    ngOnInit(): void
    {
        this.alertService.messages.subscribe((_data) =>
        {
            if (_data.type !== 'network-change') return;

            this.platform = _data.network_data.platform;
            this.title = _data.title;
            this.message = _data.message;
            this.params = _data.params || {};
            this.show();
        });
    }

    public show()
    {
        this.visible = true;
    }

    public hide(_event?)
    {
        this.visible = false;
        this.params = {};
        this.message = '';
        this.title = '';
    }

    public change()
    {
        this.router.navigate(
            ['/wallet'],
            {
                queryParams: {
                    platform: this.platform,
                    connector: 'walletconnect',
                    action: 'connect'
                }
            }
        );

        this.hide();
    }
}

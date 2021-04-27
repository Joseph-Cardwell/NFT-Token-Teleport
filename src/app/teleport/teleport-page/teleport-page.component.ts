import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AlertService } from '../../services/alert/alert.service';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { AccountToken, NftObserverService, NftSearchingState, Platform } from '../../services/nft-observer/nft-observer.service';
import { TeleportService } from '../../services/teleport/teleport.service';
import { getPlatformByChainId, parseImgSrc } from '../../shared/utils';

@Component({
    selector: 'app-teleport-page',
    templateUrl: './teleport-page.component.html',
    styleUrls: ['./teleport-page.component.scss']
})
export class TeleportPageComponent implements OnInit
{

    public platform: Platform = 'ethereum';
    public contractAddress: string;
    public tokenId: string;

    public token: AccountToken;
    public processing: boolean = true;

    public oppositeContractAddress: string;

    constructor(
        private route: ActivatedRoute,
        private nftObserver: NftObserverService,
        private teleport: TeleportService,
        private blockchainConnector: BlockchainConnectorService,
        private alertService: AlertService
    ) { }

    async ngOnInit(): Promise<void>
    {
        this.platform = (this.route.snapshot.queryParams.platform || getPlatformByChainId(this.blockchainConnector.network.chainId)).toLowerCase();
        this.contractAddress = this.route.snapshot.queryParams.contract || '';
        this.tokenId = this.route.snapshot.queryParams.token_id || '';

        this.token = this.nftObserver.getToken(this.platform, this.contractAddress, this.tokenId);

        try
        {
            if (!this.token)
            {
                await this.getFirstToken();
            }

            console.debug('Token > ', this.token);

            if (this.token)
            {
                await this.checkAddress();

                this.teleport.setNewTeleportState(this.token, this.getPlatformTo(), this.oppositeContractAddress);
            }
        }
        catch (e)
        {
            console.error(e);
        }

        this.processing = false;
    }

    public async startTeleport()
    {
        this.processing = true;

        const balance = await this.blockchainConnector.getBalance();

        if (balance === 0)
        {
            this.alertService.show({ title: 'Attention!', message: 'Your balance is 0!' });
            return this.processing = false;
        }

        if (await this.teleport.checkIsApproved()) 
        {
            console.debug('Is Approved > ', true);
            await this.teleport.goToNextStep('swap');
            return this.processing = false;
        }

        console.debug('Is Approved > ', false);

        await this.teleport.goToNextStep();

        return this.processing = false;
    }

    public getPlatformTo(): Platform
    {
        switch (this.platform)
        {
            case 'ethereum':
                return 'bsc';
            case 'bsc':
                return 'ethereum';
        }
    }

    private async checkAddress(): Promise<void>
    {
        this.oppositeContractAddress = await this.teleport.checkAddress(this.token.contractAddress, this.token.platform, this.token.wrapped);
    }

    public parseImgUrl(_event)
    {
        const isLoadedBefore = _event.target.getAttribute('data-second-load');

        if (Boolean(isLoadedBefore)) return;

        _event.target.onerror = null;
        _event.target.setAttribute('data-second-load', 'true');
        _event.target.src = parseImgSrc(_event.target.src);
    }

    private async getFirstToken()
    {
        await this.nftObserver.searchState.pipe(
            filter(_state => _state === NftSearchingState.Searched),
            take(1)
        ).toPromise();
        
        const count = await this.nftObserver.accountTokensCount.pipe(take(1)).toPromise()

        return new Promise((resolve) => 
        {
            const subscription = this.nftObserver.accountTokens.subscribe(_tokens => 
                {
                    if (!!this.token) return;

                    this.token = _tokens.find(_item => _item.platform === this.platform);
                    
                    if (!!this.token || _tokens.length === count)
                    {
                        resolve(null);
                    }
                })
        });
    }
}

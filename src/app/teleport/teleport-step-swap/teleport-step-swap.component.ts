import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { NftObserverService } from '../../services/nft-observer/nft-observer.service';
import { TeleportState, TeleportService, FormTxErrors } from '../../services/teleport/teleport.service';
import { sleep } from '../../shared/utils';
import { FeeOracle } from '../../shared/gas-price-selector/gas-price-selector.component';

@Component({
    selector: 'app-teleport-step-swap',
    templateUrl: './teleport-step-swap.component.html',
    styleUrls: ['./teleport-step-swap.component.scss']
})
export class TeleportStepSwapComponent implements OnInit
{

    public feeOracle: any;
    public processing: boolean = false;
    public error: { message: string, params?: Record<string, string | number> };

    public teleportState: TeleportState;

    public step: 'preparing' | 'performing' | 'confirmation' | 'checking' = 'preparing';

    private selectedGasPrice: string;

    constructor(
        private teleport: TeleportService,
        private blockchainConnector: BlockchainConnectorService,
        private router: Router,
        private translate: TranslateService,
        private nftObserver: NftObserverService
    ) { }

    ngOnInit(): void
    {
        this.teleportState = this.teleport.getState();
    }

    public async swap()
    {
        this.processing = true;
        this.error = null;
        this.step = 'preparing';

        try
        {
            const tx = this.teleportState.swapTx || await this.teleport.getSwapTx();

            this.step = 'confirmation';

            const txResponse = await this.blockchainConnector.sendTransation({
                ...tx,
                gasPrice: this.selectedGasPrice || tx.gasPrice
            });

            if (!txResponse)
            {
                this.error = { message: 'TELEPORT.ERRORS.FAILED-TX' };
                return this.processing = false;
            }

            this.step = 'performing';

            await this.blockchainConnector.waitTxConfirmation(txResponse, 3);

            this.step = 'checking';

            let isSwaped = false;
            let attemps = 0;

            while(!isSwaped)
            {
                isSwaped = Boolean(await this.nftObserver.checkToken(this.teleportState.contractAddressTo, this.teleportState.token.tokenId, this.teleportState.platformTo));
                attemps++;

                if (attemps > 10) isSwaped = true;

                if (!isSwaped)
                {
                    await sleep(5000);
                }
            }

            this.nftObserver.getTokens(true);

            await this.teleport.goToNextStep('success');
        }
        catch (e)
        {
            console.error(e);
            this.processing = false;

            if (e.message === FormTxErrors.INVALID_REQUEST)
            {
                return this.error = { message: 'TELEPORT.ERRORS.INVALID-REQUEST' };
            }
            else if (e.message === FormTxErrors.FAILED_BY_BLOCKCHAIN)
            {
                return this.error = { message: 'TELEPORT.ERRORS.BLOCKCHAIN-FAILED' };
            }
            else if (e.message === 'CANCEL')
            {
                return this.error = null;
            }

            this.error = { message: 'TELEPORT.ERRORS.FAILED-TX' };
        }

        this.processing = false;
    }

    public async cancel()
    {
        this.processing = true;
        this.error = null;

        try
        {
            if (!await this.teleport.checkIsApproved())
            {
                this.close();
            }

            const tx = await this.teleport.getCancelApprovalTx();

            const txResponse = await this.blockchainConnector.sendTransation(tx);

            if (!txResponse)
            {
                this.error = { message: 'TELEPORT.ERRORS.FAILED-TX' };
                return this.processing = false;
            }

            await this.blockchainConnector.waitTxConfirmation(txResponse);

            this.close();
        }
        catch (e)
        {
            console.error(e);
            this.processing = false;

            if (e.message === FormTxErrors.INVALID_REQUEST)
            {
                return this.error = { message: 'TELEPORT.ERRORS.INVALID-REQUEST' };
            }
            else if (e.message === FormTxErrors.FAILED_BY_BLOCKCHAIN)
            {
                return this.error = { message: 'TELEPORT.ERRORS.BLOCKCHAIN-FAILED' };
            }
            else if (e.message === 'CANCEL')
            {
                return this.error = null;
            }

            this.error = { message: 'TELEPORT.ERRORS.FAILED-TX' };
        }

        this.processing = false;
    }

    public gasChanged(_gasOracle: FeeOracle)
    {
        this.selectedGasPrice = _gasOracle.gasPrice;
    }

    public close()
    {
        this.router.navigate(['/teleport'], { queryParamsHandling: 'merge' });
    }

    public getTitle(): string
    {   
        let steps = "";
        if (this.teleportState.stepsCount > 1)
        {
            steps = this.translate.instant("TELEPORT.STEPS", {current_step: this.teleportState.currentStepNumber, steps: this.teleportState.stepsCount});
            steps += " ";
        }

        let title = this.translate.instant("TELEPORT.SWAP.TITLE");

        return steps + title;
    }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../services/alert/alert.service';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { FormTxErrors, TeleportService, TeleportState, TxFromApi } from '../../services/teleport/teleport.service';
import { FeeOracle } from '../../shared/gas-price-selector/gas-price-selector.component';

@Component({
    selector: 'app-teleport-step-approve',
    templateUrl: './teleport-step-approve.component.html',
    styleUrls: ['./teleport-step-approve.component.scss']
})
export class TeleportStepApproveComponent implements OnInit
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
        private translate: TranslateService
    ) { }

    ngOnInit(): void
    {
        this.teleportState = this.teleport.getState();
    }

    public async approve()
    {
        this.processing = true;
        this.error = null;
        this.step = 'preparing';

        try
        {
            const tx = this.teleportState.approvalTx || await this.teleport.getApprovalTx();

            this.step = 'confirmation';

            const txResponse = await this.blockchainConnector.sendTransation({
                ...tx,
                gasPrice: this.selectedGasPrice || tx.gasPrice
            });

            if (!txResponse)
            {
                this.error = {message: 'TELEPORT.ERRORS.FAILED-TX'};
                return this.processing = false;
            }

            this.step = 'performing';

            await this.blockchainConnector.waitTxConfirmation(txResponse);

            this.step = 'checking';

            await this.teleport.goToNextStep();
        }
        catch(e)
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

            this.error = {message: 'TELEPORT.ERRORS.FAILED-TX'};
        }

        this.processing = false;
    }

    public gasChanged(_gasOracle: FeeOracle)
    {
        this.selectedGasPrice = _gasOracle.gasPrice;
    }

    public close()
    {
        this.router.navigate(['/teleport'], {queryParamsHandling: 'merge'});
    }

    public getTitle(): string
    {   
        let steps = "";
        if (this.teleportState.stepsCount > 1)
        {
            steps = this.translate.instant("TELEPORT.STEPS", {current_step: this.teleportState.currentStepNumber, steps: this.teleportState.stepsCount});
            steps += " ";
        }

        let title = this.translate.instant("TELEPORT.APPROVAL.TITLE");

        return steps + title;
    }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { TeleportState, TeleportService, FormTxErrors } from '../../services/teleport/teleport.service';
import { sleep } from '../../shared/utils';
import { FeeOracle } from '../../shared/gas-price-selector/gas-price-selector.component';

@Component({
    selector: 'app-teleport-step-designate',
    templateUrl: './teleport-step-designate.component.html',
    styleUrls: ['./teleport-step-designate.component.scss']
})
export class TeleportStepDesignateComponent implements OnInit
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

    public async designate()
    {
        this.processing = true;
        this.error = null;
        this.step = 'preparing';

        try
        {
            const tx = this.teleportState.contractCreationTx || await this.teleport.getContractCreateTx();

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

            await this.blockchainConnector.waitTxConfirmation(txResponse, 4);

            this.step = 'checking';

            let contractDesignated = false;
            let attemps = 0;

            while(!contractDesignated)
            {
                let address = await this.teleport.checkAddress(this.teleportState.token.contractAddress, this.teleportState.token.platform, this.teleportState.token.wrapped);
                
                contractDesignated = Boolean(address);
                attemps++;

                if (attemps > 10) contractDesignated = true;

                if (!contractDesignated)
                {
                    await sleep(3000);
                }
                else
                {
                    this.teleport.updateState({contractAddressTo: address});
                }
            }

            await this.teleport.goToNextStep();
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

        let title = this.translate.instant("TELEPORT.DESIGNATE.TITLE");

        return steps + title;
    }
}

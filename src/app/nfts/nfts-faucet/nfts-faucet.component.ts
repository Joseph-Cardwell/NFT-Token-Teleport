import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { FaucetService } from '../../services/faucet/faucet.service';
import { Platform } from '../../services/nft-observer/nft-observer.service';
import { FormTxErrors, TxFromApi } from '../../services/teleport/teleport.service';
import { FeeOracle } from '../../shared/gas-price-selector/gas-price-selector.component';

@Component({
    selector: 'app-nfts-faucet',
    templateUrl: './nfts-faucet.component.html',
    styleUrls: ['./nfts-faucet.component.scss']
})
export class NftsFaucetComponent implements OnInit
{

    @Input('platform')
    public platform: Platform;

    @Input('faucet-tx')
    public faucetTx: TxFromApi;

    @Output('close')
    public close: EventEmitter<boolean> = new EventEmitter();

    public processing = false;

    public error: { message: string, params?: Record<string, string | number> };

    public step: 'preparing' | 'performing' | 'confirmation' | 'checking' = 'preparing';

    public complete: boolean = false;

    public title: string = 'NFTS.FAUCET.TITLE';

    private selectedGasPrice: string;

    constructor(
        private faucetService: FaucetService,
        private blockchainConnector: BlockchainConnectorService
    ) { }

    ngOnInit(): void
    {
        this.processing = false;
    }

    public hide(_event?)
    {
        if (Boolean(this.processing)) return;

        this.close.emit(this.complete);
    }

    public gasChanged(_gasOracle: FeeOracle)
    {
        this.selectedGasPrice = _gasOracle.gasPrice;
    }

    public async approve()
    {
        this.processing = true;
        this.error = null;
        this.step = 'preparing';

        try
        {
            this.step = 'confirmation';

            const txResponse = await this.blockchainConnector.sendTransation({
                ...this.faucetTx,
                gasPrice: this.selectedGasPrice || this.faucetTx.gasPrice
            });

            if (!txResponse)
            {
                this.error = {message: 'TELEPORT.ERRORS.FAILED-TX'};
                return this.processing = false;
            }

            this.step = 'performing';

            await this.blockchainConnector.waitTxConfirmation(txResponse, 3);

            this.step = 'checking';

            this.complete = true;

            this.title = 'NFTS.FAUCET.SUCCESS.TITLE';
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
}

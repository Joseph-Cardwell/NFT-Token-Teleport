import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BigNumber, utils } from 'ethers';
import { BlockchainConnectorService } from '../../services/blockchain-connector/blockchain-connector.service';
import { TxFromApi } from '../../services/teleport/teleport.service';
import { getPlatformByChainId } from '../utils';

export type FeeOracle = {
    gasPrice: string,
    baseCurrencyValue: string
}

type FeeOracles = {
    slow: FeeOracle,
    normal: FeeOracle,
    fast: FeeOracle
}

@Component({
    selector: 'app-gas-price-selector',
    templateUrl: './gas-price-selector.component.html',
    styleUrls: ['./gas-price-selector.component.scss']
})
export class GasPriceSelectorComponent implements OnInit
{

    @Input('tx-data')
    public txData: TxFromApi;

    @Output('gas-change')
    public change: EventEmitter<FeeOracle> = new EventEmitter();

    public baseToken: 'BNB' | 'ETH' = 'ETH';

    public feeOracles: FeeOracles;

    public currentOracle: string = 'normal';

    constructor(
        private blockchainConnector: BlockchainConnectorService
    ) { }

    ngOnInit(): void
    {
        const platfrom = getPlatformByChainId(this.blockchainConnector.network.chainId);

        this.baseToken = platfrom === 'ethereum' ? 'ETH' : 'BNB';

        const defaultGasPriceBN = utils.parseUnits(Number(this.txData.gasPrice).toString(), 'wei');
        const defaultGasLimitBN = utils.parseUnits(Number(this.txData.gasLimit).toString(), 'wei');

        const fastGasPriceBN = defaultGasPriceBN.add(defaultGasPriceBN.div(5));
        const slowGasPriceBN = defaultGasPriceBN.sub(defaultGasPriceBN.div(6));

        this.feeOracles = {
            slow: {
                gasPrice: utils.formatUnits(slowGasPriceBN, 'wei'),
                baseCurrencyValue: utils.formatUnits(slowGasPriceBN.mul(defaultGasLimitBN))
            },
            normal: {
                gasPrice: utils.formatUnits(defaultGasPriceBN, 'wei'),
                baseCurrencyValue: utils.formatUnits(defaultGasPriceBN.mul(defaultGasLimitBN))
            },
            fast: {
                gasPrice: utils.formatUnits(fastGasPriceBN, 'wei'),
                baseCurrencyValue: utils.formatUnits(fastGasPriceBN.mul(defaultGasLimitBN))
            }
        };

        this.selectFeeOracle('normal');
    }

    public selectFeeOracle(_name: string)
    {
        this.currentOracle = _name;

        this.change.emit(this.feeOracles[_name]);
    }
}

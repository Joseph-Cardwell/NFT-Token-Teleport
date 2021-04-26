import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BlockchainConnectorService } from '../blockchain-connector/blockchain-connector.service';
import { AccountToken, Platform } from '../nft-observer/nft-observer.service';

export type ApiResponse<T = Record<string, any>> = {
    result: number,
    data: T
}

type Steps = 'compose' | 'contract-creating' | 'approval' | 'approve-cancel' | 'swap' | 'success';

export enum FormTxErrors {
    INVALID_REQUEST      = 'INVALID-REQUEST',
    FAILED_BY_BLOCKCHAIN = 'FAILED-BY-BLOCKCHAIN'
}

export type TxFromApi = {
    from:       string,
    to:         string,
    data:       string,
    gasLimit:   string,
    gasPrice:   string,
    value:      string,
    nonce:      number,
    chainId:    number,
}

export type ApiTxResponse = ApiResponse<{tx: TxFromApi}>;

type GetTxBody = {
    wallet_address: string, 
    bridge_from: string, 
    nftoken_address: string, 
    nftoken_id: string
}

export type TeleportState = {
    token: AccountToken,
    platformTo: Platform,
    contractAddressTo: string,
    stepsCount: number;
    currentStepNumber: number;
    step: Steps,
    contractCreationTx?: TxFromApi,
    approvalTx?: TxFromApi,
    swapTx?: TxFromApi
}

@Injectable({
    providedIn: 'root'
})
export class TeleportService
{
    private state: TeleportState = null;

    constructor(
        private http: HttpClient,
        private router: Router,
        private blockchainConnector: BlockchainConnectorService
    ) { }

    public async checkAddress(_contractAddress: string, _platform: Platform, _wrapped: boolean): Promise<string>
    {
        const bridgeName = this.getBridgeNameByPlatform(_platform);
        const body = {
            bridge_from: bridgeName,
            nftoken_address: _contractAddress.toLowerCase(),
            is_token_wrapped: Number(_wrapped).toString()
        };

        const response = <ApiResponse>await this.http.post('/api/bridge/check-nftoken-address', body).toPromise();

        if (response.result !== 0) return null;

        if (_platform === 'ethereum')
            return response.data.token_address_bsc;
        else
            return response.data.token_address_eth;
    }

    public setNewTeleportState(_token: AccountToken, _platformTo: Platform, _contractTo: string)
    {
        let steps = 3;

        if (_contractTo) steps--;
        if (_token.wrapped) steps--;

        this.state = {
            token: _token,
            platformTo: _platformTo,
            contractAddressTo: _contractTo,
            step: 'compose',
            stepsCount: steps,
            currentStepNumber: 1
        };
    }

    public updateState(_state: Partial<TeleportState>)
    {
        this.state = {...this.state, ..._state};
    }

    public async goToNextStep(_step?: Steps)
    {
        const routerParams: NavigationExtras = { queryParamsHandling: 'merge' };

        if (!_step) this.defineNextStep();

        switch (_step || this.state.step)
        {
            case 'compose':
                return this.router.navigate(['/teleport'], routerParams);
            case 'contract-creating':
                if (!!this.state.contractCreationTx) return this.goToNextStep('approval');

                this.state.contractCreationTx = await this.getContractCreateTx();
                return this.router.navigate(['/teleport/designate'], routerParams);
            case 'approval':
                if (this.state.token.wrapped) return this.goToNextStep('swap');
                this.state.approvalTx = await this.getApprovalTx();
                
                if (this.state.stepsCount !== 2) this.state.currentStepNumber++;
                return this.router.navigate(['/teleport/approval'], routerParams);
            case 'swap':
                this.state.swapTx = await this.getSwapTx();
                if (this.state.stepsCount !== 1) this.state.currentStepNumber++;
                return this.router.navigate(['/teleport/swap'], routerParams);
            case 'success':
                return this.router.navigate(['/teleport/success'], routerParams);
        }
    }

    public getState()
    {
        return this.state;
    }

    public async checkIsApproved(): Promise<boolean>
    {
        const body = this.composeBodyForTxGet()

        const response = <ApiResponse>await this.http.post('/api/bridge/get-allowance', body).toPromise();

        if (response.result !== 0) return false;

        return response.data.is_approved;
    }

    public async getCancelApprovalTx(): Promise<TxFromApi>
    {
        const body = this.composeBodyForTxGet()

        const response = <ApiTxResponse>await this.http.post('/api/bridge/get-tx-approve-cancel', body).toPromise();

        return this.parseGetTxResponses(response);
    }

    public async getApprovalTx(): Promise<TxFromApi> 
    {
        const body = this.composeBodyForTxGet()

        const response = <ApiTxResponse>await this.http.post('/api/bridge/get-tx-approve', body).toPromise();

        return this.parseGetTxResponses(response);
    }

    public async getSwapTx(): Promise<TxFromApi> 
    {
        const body = this.composeBodyForTxGet()

        const response = <ApiTxResponse>await this.http.post('/api/bridge/get-tx-swap', body).toPromise();

        return this.parseGetTxResponses(response);
    }

    public async getContractCreateTx(): Promise<TxFromApi> 
    {
        const body = this.composeBodyForTxGet()

        const response = <ApiTxResponse>await this.http.post('/api/bridge/get-tx-register-pair', body).toPromise();

        return this.parseGetTxResponses(response);
    }

    private composeBodyForTxGet(): GetTxBody
    {
        return {
            wallet_address:     this.blockchainConnector.walletAddress, 
            bridge_from:        this.getBridgeNameByPlatform(this.state.token.platform), 
            nftoken_address:    this.state.token.contractAddress.toLowerCase(), 
            nftoken_id:         this.state.token.tokenId
        };
    }

    private parseGetTxResponses(_response: ApiTxResponse): TxFromApi
    {
        if (_response.result !== 0) throw new Error(this.parseResponseResult(_response.result));

        this.state.contractCreationTx = _response.data.tx;

        return _response.data.tx;
    }

    private defineNextStep(): Steps
    {
        if (this.state.step === 'compose' && (this.state.contractAddressTo || this.state.token.wrapped)) return this.state.step = 'approval';
        if (this.state.step === 'compose' && (!this.state.contractAddressTo || !this.state.token.wrapped)) return this.state.step = 'contract-creating';

        if (this.state.step === 'contract-creating') return this.state.step = 'approval';

        if (this.state.step === 'approval') return this.state.step = 'swap';
    }

    private getBridgeNameByPlatform(_platform: Platform): 'ETH' | 'BSC'
    {
        switch (_platform)
        {
            case 'ethereum':
                return 'ETH';
            case 'bsc':
                return 'BSC';
        }
    }

    private parseResponseResult(_result: number): FormTxErrors
    {
        switch(Number(_result))
        {
            case -1:
                return FormTxErrors.INVALID_REQUEST;
            case -2:
                return FormTxErrors.FAILED_BY_BLOCKCHAIN;
            default:
                return null;
        }
    }
}

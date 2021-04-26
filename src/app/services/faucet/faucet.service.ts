import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlockchainConnectorService } from '../blockchain-connector/blockchain-connector.service';
import { Platform } from '../nft-observer/nft-observer.service';
import { ApiResponse, ApiTxResponse, FormTxErrors, TxFromApi } from '../teleport/teleport.service';

export type AllowedTokensFaucet = {
    bsc: boolean;
    ethereum: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FaucetService
{

    private allowedTokens: AllowedTokensFaucet;

    constructor(
        private http: HttpClient,
        private blockchainConnector: BlockchainConnectorService
    )
    {
        this.blockchainConnector.state.subscribe(_state => 
        {
            if (!_state) this.allowedTokens = null;
            else 
            {
                this.canGetTokens();
            }
        })
    }

    public async canGetTokens(_force: boolean = false): Promise<AllowedTokensFaucet>
    {
        if (this.allowedTokens && !_force) return this.allowedTokens;

        const response = <ApiResponse<any>>await this.http.post(
            '/api/bridge/get-check-free-nft', 
            {
                wallet_address: this.blockchainConnector.walletAddress
            }).toPromise();

        this.allowedTokens = {
            bsc: response.data.bsc,
            ethereum: response.data.eth
        };

        return this.allowedTokens;
    }

    public async faucetTokens(_platform: Platform): Promise<TxFromApi>
    {
        const response = <ApiTxResponse>await this.http.post(
            '/api/bridge/get-tx-mint-nft', 
            {
                wallet_address: this.blockchainConnector.walletAddress,
                bridge_from: this.getBridgeNameByPlatform(_platform)
            }).toPromise();

        return this.parseGetTxResponses(response);
    }

    private parseGetTxResponses(_response: ApiTxResponse): TxFromApi
    {
        if (_response.result !== 0) throw new Error(this.parseResponseResult(_response.result));

        return _response.data.tx;
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
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { providers } from 'ethers';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BlockchainApiService
{

    constructor(
        private http: HttpClient
    ) { }

    public async getEtherNFTTokensTransactions(_walletAddress: string, _networkName: string): Promise<Record<string, string[]>>
    {
        const url = `${this.getEtherApiByNetwork(_networkName)}?module=account&action=tokennfttx&address=${_walletAddress}&startblock=0&endblock=999999999&sort=asc&apikey=${environment.providers.etherscan}`;
        const response = <Record<string, any>>await this.http.get(url).toPromise();
        
        if (response.status !== "1") return {};

        const result = {};

        response.result.forEach(_item => 
            {
                if (!result[_item.contractAddress]) result[_item.contractAddress] = [];

                if (!result[_item.contractAddress].includes(_item.tokenID)) result[_item.contractAddress].push(_item.tokenID);
            });

        return result;
    }

    public async getBscNFTTokensTransactions(_walletAddress: string, _networkName: string): Promise<Record<string, string[]>>
    {
        const url = `${this.getBscApiByNetwork(_networkName)}?module=account&action=tokennfttx&address=${_walletAddress}&startblock=0&endblock=999999999&sort=asc&apikey=${environment.providers.etherscan}`;
        const response = <Record<string, any>>await this.http.get(url).toPromise();
        
        if (response.status !== "1") return {};

        const result = {};

        response.result.forEach(_item => 
            {
                if (!result[_item.contractAddress]) result[_item.contractAddress] = [];

                if (!result[_item.contractAddress].includes(_item.tokenID)) result[_item.contractAddress].push(_item.tokenID);
            });

        return result;
    }

    public getNetworks(_network: providers.Network): {ethereum: providers.Network, bsc: providers.Network}
    {
        if (_network.chainId === 1)
        {
            return {ethereum: _network, bsc: {chainId: 56, name: 'mainnet'}};
        }

        if (_network.chainId === 42)
        {
            return {ethereum: _network, bsc: {chainId: 97, name: 'bsc-testnet'}};
        }

        if (_network.chainId === 56)
        {
            return {ethereum: {chainId: 1, name: 'mainnet'}, bsc: _network};
        }

        if (_network.chainId === 97)
        {
            return {ethereum: {chainId: 42, name: 'kovan'}, bsc: _network};
        }
    }

    private getEtherApiByNetwork(_networkName: string)
    {
        return environment.api.etherscan[_networkName];
    }

    private getBscApiByNetwork(_networkName: string)
    {
        return environment.api.bscscan[_networkName];
    }
}

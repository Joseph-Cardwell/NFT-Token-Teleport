import { Platform } from "../services/nft-observer/nft-observer.service";

export async function sleep(ms: number)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseImgSrc(value: string): string
{
    return value.replace(/\d+$/, "");
}

export function getPlatformByChainId(_chainId: number): Platform
{
    if ([56, 97].includes(_chainId)) return 'bsc';

    return 'ethereum';
}
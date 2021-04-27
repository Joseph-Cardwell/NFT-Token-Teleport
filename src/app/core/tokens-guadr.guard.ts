import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { NftObserverService } from '../services/nft-observer/nft-observer.service';

@Injectable({
    providedIn: 'root'
})
export class TokensGuadrGuard implements CanActivate
{
    constructor(
        private nftObserver: NftObserverService,
        private router: Router
    )
    {

    }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean>
    {
        const count = await this.nftObserver.accountTokensCount.pipe(take(1)).toPromise();

        if (count === 0)
        {
            this.router.navigate(['/wallet']);
        }

        return count > 0;
    }

}

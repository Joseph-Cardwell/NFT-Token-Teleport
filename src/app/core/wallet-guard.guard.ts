import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { BlockchainConnectorService } from '../services/blockchain-connector/blockchain-connector.service';

@Injectable({
    providedIn: 'root'
})
export class WalletGuardGuard implements CanActivate
{

    constructor(
        private blockchainConnector: BlockchainConnectorService,
        private router: Router
    )
    {

    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean>
    {
        return this.blockchainConnector.state.pipe(
            map(_state => 
            {
                if (!_state)
                {
                    this.router.navigate(['/wallet']);
                }

                return _state;
            })
        )


    }

}

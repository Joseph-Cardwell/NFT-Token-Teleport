import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletGuardGuard } from './core/wallet-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: '/wallet', pathMatch: 'full' },
  { path: 'wallet', loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletModule) },
  { path: 'nfts', canActivate: [WalletGuardGuard], loadChildren: () => import('./nfts/nfts.module').then(m => m.NftsModule) },
  { path: 'teleport', canActivate: [WalletGuardGuard], loadChildren: () => import('./teleport/teleport.module').then(m => m.TeleportModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
  })],
  providers: [WalletGuardGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftsPageComponent } from './nfts-page/nfts-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NftsFaucetComponent } from './nfts-faucet/nfts-faucet.component';

const routes: Routes = [
  {path: '', component: NftsPageComponent}
]

@NgModule({
  declarations: [
    NftsPageComponent,
    NftsFaucetComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class NftsModule { }

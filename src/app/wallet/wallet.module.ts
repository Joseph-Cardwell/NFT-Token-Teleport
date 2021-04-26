import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletPageComponent } from './wallet-page/wallet-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {path: '', component: WalletPageComponent}
]

@NgModule({
  declarations: [WalletPageComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class WalletModule { }

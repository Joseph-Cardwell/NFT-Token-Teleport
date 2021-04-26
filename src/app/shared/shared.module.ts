import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TextDialogComponent } from './text-dialog/text-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { AddressShorterPipe } from './pipes/address-shortender.pipe';
import { NumberParserPipe } from './pipes/number-parser.pipe';
import { GasPriceSelectorComponent } from './gas-price-selector/gas-price-selector.component';

@NgModule({
  declarations: [
    TextDialogComponent, 
    ModalDialogComponent,
    AddressShorterPipe,
    NumberParserPipe,
    GasPriceSelectorComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    HttpClientModule,
    TranslateModule,
    TextDialogComponent,
    ModalDialogComponent,
    AddressShorterPipe,
    NumberParserPipe,
    GasPriceSelectorComponent
  ]
})
export class SharedModule { }

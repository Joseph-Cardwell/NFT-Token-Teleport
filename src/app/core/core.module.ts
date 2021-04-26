import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './alert/alert/alert.component';
import { SharedModule } from '../shared/shared.module';
import { NetworkAlertComponent } from './alert/network-alert/network-alert.component';

class CustomLoader implements TranslateLoader {
  constructor(
    private http: HttpClient
  ) { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json?${Date.now()}`);
  }
}

@NgModule({
  declarations: [HeaderComponent, MainMenuComponent, AlertComponent, NetworkAlertComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useClass: (CustomLoader),
            deps: [HttpClient]
        }
    }),
    RouterModule,
    SharedModule
  ],
  exports: [
    HeaderComponent,
    MainMenuComponent,
    AlertComponent,
    NetworkAlertComponent
  ]
})
export class CoreModule { }

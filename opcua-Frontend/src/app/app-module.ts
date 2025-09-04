import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import {Temperature} from './pages/temperature/temperature';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import { MainNavbar } from './components/main-navbar/main-navbar';
import { Historical } from './pages/historical/historical';
import {DigitaltwinComponent} from './pages/digitaltwin/digitaltwin.component';
import {MainFooterComponent} from './components/main-footer/main-footer.component';

@NgModule({
  declarations: [
    App,
    Temperature,
    MainNavbar,
    Historical,
    DigitaltwinComponent,
    MainFooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, HttpClientModule, FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }

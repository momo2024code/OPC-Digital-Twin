import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Temperature} from './pages/temperature/temperature';
import {Historical} from './pages/historical/historical';
import {DigitaltwinComponent} from './pages/digitaltwin/digitaltwin.component';

const routes: Routes = [



  { path: '', component: Temperature },
  { path: 'history', component: Historical },
  { path: 'digitaltwin', component: DigitaltwinComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

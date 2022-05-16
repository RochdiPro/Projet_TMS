import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DonneesComponent } from './donnees.component';

const routes: Routes = [{ path: '', component: DonneesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonneesRoutingModule { }

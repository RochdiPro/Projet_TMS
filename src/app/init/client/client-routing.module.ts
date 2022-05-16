import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjoutClientComponent } from './ajout-client/ajout-client.component';

import { ClientComponent } from './client.component';
import { ListerClientComponent } from './lister-client/lister-client.component';
import { ModifierClientComponent } from './modifier-client/modifier-client.component';
import { VisualiserClientComponent } from './visualiser-client/visualiser-client.component';

const routes: Routes = [
  { path: '', component: ClientComponent , children: [
  { path: 'Ajouter-client', component: AjoutClientComponent },
  { path: 'Modifer-client/:id', component: ModifierClientComponent },
  { path: 'Lister-client', component: ListerClientComponent },
  { path: 'Visualiser-client/:id', component: VisualiserClientComponent }]}];


 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }

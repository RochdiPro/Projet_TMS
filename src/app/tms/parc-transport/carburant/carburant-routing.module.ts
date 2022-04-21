import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouterCarburantComponent } from './ajouter-carburant/ajouter-carburant.component';
import { ListerCarburantComponent } from './lister-carburant/lister-carburant.component';

const routes: Routes = [
  {path: "lister-carburants", component: ListerCarburantComponent},
  {path: "ajouter-carburant", component: AjouterCarburantComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarburantRoutingModule { }

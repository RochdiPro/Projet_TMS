import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjoutEmployeComponent } from './ajout-employe/ajout-employe.component';

import { EmployeComponent } from './employe.component';
import { ListerEmployeComponent } from './lister-employe/lister-employe.component';
import { ModifierEmployeComponent } from './modifier-employe/modifier-employe.component';
import { VisualiserEmployeComponent } from './visualiser-employe/visualiser-employe.component';

const routes: Routes = [{ path: '', component: EmployeComponent , children: [
  { path: 'Ajouter-employee', component: AjoutEmployeComponent },
  { path: 'Modifer-employee/:id', component: ModifierEmployeComponent },
  { path: 'Lister-employee', component: ListerEmployeComponent },
  { path: 'Visualiser-employee/:id', component: VisualiserEmployeComponent }]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeRoutingModule { }

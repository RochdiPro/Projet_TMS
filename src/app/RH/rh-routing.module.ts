import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RhComponent } from './rh.component';

const routes: Routes = [{ path: '', component: RhComponent },
{ path: 'Menu-employee', loadChildren: () => import('./employe/employe.module').then(m => m.EmployeModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RhRoutingModule { }

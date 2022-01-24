import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanChargementComponent } from './plan-chargement.component';

const routes: Routes = [{path: '', component: PlanChargementComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanChargementRoutingModule {}

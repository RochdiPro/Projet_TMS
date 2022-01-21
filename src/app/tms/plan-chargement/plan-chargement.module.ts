import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanChargementRoutingModule } from './plan-chargement-routing.module';
import { PlanChargementComponent } from './plan-chargement.component';


@NgModule({
  declarations: [
    PlanChargementComponent
  ],
  imports: [
    CommonModule,
    PlanChargementRoutingModule
  ]
})
export class PlanChargementModule { }

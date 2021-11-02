import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TMSComponent } from './tms.component';


import { TmsRoutingModule } from './tms-routing.module';


@NgModule({
  declarations: [
    TMSComponent
  ],
  imports: [
    CommonModule,
    TmsRoutingModule
  ]
})
export class TmsModule { }

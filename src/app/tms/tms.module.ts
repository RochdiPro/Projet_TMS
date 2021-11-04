import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TMSComponent } from './tms.component';


import { TmsRoutingModule } from './tms-routing.module';
import { MenuTmsComponent } from './menu-tms/menu-tms.component';


@NgModule({
  declarations: [
    TMSComponent,
    MenuTmsComponent
  ],
  imports: [
    CommonModule,
    TmsRoutingModule
  ]
})
export class TmsModule { }

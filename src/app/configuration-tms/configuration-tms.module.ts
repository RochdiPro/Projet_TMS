import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationTmsRoutingModule } from './configuration-tms-routing.module';
import { ConfigurationTmsComponent } from './configuration-tms.component';


@NgModule({
  declarations: [
    ConfigurationTmsComponent
  ],
  imports: [
    CommonModule,
    ConfigurationTmsRoutingModule
  ]
})
export class ConfigurationTmsModule { }

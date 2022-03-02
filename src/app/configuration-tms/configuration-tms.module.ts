import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationTmsRoutingModule } from './configuration-tms-routing.module';
import { ConfigurationTmsComponent } from './configuration-tms.component';
import { ConfigurationGeneraleComponent } from './configuration-generale/configuration-generale.component';


@NgModule({
  declarations: [
    ConfigurationTmsComponent,
    ConfigurationGeneraleComponent
  ],
  imports: [
    CommonModule,
    ConfigurationTmsRoutingModule
  ]
})
export class ConfigurationTmsModule { }

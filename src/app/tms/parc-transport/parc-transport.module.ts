import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcTransportComponent } from './parc-transport.component';

import { ParcTransportRoutingModule } from './parc-transport-routing.module';


@NgModule({
  declarations: [
    ParcTransportComponent
  ],
  imports: [
    CommonModule,
    ParcTransportRoutingModule
  ]
})
export class ParcTransportModule { }

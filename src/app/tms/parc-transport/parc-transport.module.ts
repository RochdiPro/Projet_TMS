import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcTransportComponent } from './parc-transport.component';

import { ParcTransportRoutingModule } from './parc-transport-routing.module';
import { MenuComponent } from './menu/menu.component';


@NgModule({
  declarations: [
    ParcTransportComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    ParcTransportRoutingModule
  ]
})
export class ParcTransportModule { }

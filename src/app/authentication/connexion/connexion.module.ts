import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConnexionRoutingModule } from './connexion-routing.module';
import { ConnexionComponent } from './connexion.component';


@NgModule({
  declarations: [ConnexionComponent],
  imports: [
    CommonModule,
    ConnexionRoutingModule
  ]
})
export class ConnexionModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationTmsRoutingModule } from './configuration-tms-routing.module';
import { ConfigurationTmsComponent } from './configuration-tms.component';
import { ConfigurationGeneraleComponent } from './configuration-generale/configuration-generale.component';
import { ConfigurationPositionComponent } from './configuration-position/configuration-position.component';
import {MatButtonModule} from '@angular/material/button';
import { AgmCoreModule } from '@agm/core';
import { ConfigurationCommandeComponent } from './configuration-commande/configuration-commande.component';
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { ConfigurationServeurComponent } from './configuration-serveur/configuration-serveur.component';


@NgModule({
  declarations: [
    ConfigurationTmsComponent,
    ConfigurationGeneraleComponent,
    ConfigurationPositionComponent,
    ConfigurationCommandeComponent,
    ConfigurationServeurComponent
  ],
  imports: [
    CommonModule,
    ConfigurationTmsRoutingModule,
    MatButtonModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8'
    }),
    ReactiveFormsModule,
    MatInputModule
  ]
})
export class ConfigurationTmsModule { }

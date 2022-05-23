import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarburantRoutingModule } from './carburant-routing.module';
import { CarburantComponent } from './carburant.component';
import { ListerCarburantComponent } from './lister-carburant/lister-carburant.component';
import { AjouterCarburantComponent } from './ajouter-carburant/ajouter-carburant.component';
import { ModifierPrixComponent } from './modifier-prix/modifier-prix.component';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    CarburantComponent,
    ListerCarburantComponent,
    AjouterCarburantComponent,
    ModifierPrixComponent
  ],
  imports: [
    CommonModule,
    CarburantRoutingModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ]
})
export class CarburantModule { }

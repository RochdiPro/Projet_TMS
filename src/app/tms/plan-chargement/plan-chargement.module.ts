import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PlanChargementRoutingModule } from './plan-chargement-routing.module';
import { PlanChargementComponent } from './plan-chargement.component';
import { SafePipeModule } from 'safe-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    PlanChargementComponent
  ],
  imports: [
    SafePipeModule,
    CommonModule,
    PlanChargementRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatNativeDateModule,
    MatButtonModule,
    DragDropModule
  ],
  providers: [MatDatepickerModule, DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
})
export class PlanChargementModule { }

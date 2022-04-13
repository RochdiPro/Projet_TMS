import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { AjoutClientComponent } from './ajout-client/ajout-client.component';
import { ModifierClientComponent } from './modifier-client/modifier-client.component';
import { VisualiserClientComponent } from './visualiser-client/visualiser-client.component';
import { ListerClientComponent } from './lister-client/lister-client.component';
 import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
 import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableFilterModule } from 'mat-table-filter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
 import { MatFormFieldModule } from '@angular/material/form-field';
 import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [ClientComponent,AjoutClientComponent,ModifierClientComponent,VisualiserClientComponent,ListerClientComponent],
  imports: [
    CommonModule,
    ClientRoutingModule,
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatStepperModule,
    MatIconModule,
    MatInputModule,
    MatTableFilterModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
     MatPaginatorModule,
     MatSortModule,
    MatSnackBarModule, 
    FormsModule, ReactiveFormsModule,    
    MatCardModule,   
    NgxMatFileInputModule,
    MatTabsModule
  ]
})
export class ClientModule { }

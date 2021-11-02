import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

import { ChauffeursComponent } from './chauffeurs.component';

import { ChauffeursRoutingModule } from './chauffeurs-routing.module';
registerLocaleData(localeFr, 'fr');


@NgModule({
  declarations: [
    ChauffeursComponent
  ],
  imports: [
    CommonModule,
    ChauffeursRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ],
  providers: [ DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
})
export class ChauffeursModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';

import { VehiculeComponent } from './vehicule.component';
import {
  DetailVehiculeComponent,
  MajVehiculeComponent,
  MiseAJourConsommationComponent,
  NotificationComponent,
  ReclamationComponent,
  BoiteDialogueEntretien,
  DetailVehiculeLoueComponent,
  HistoriqueConsommation
} from './dialogs/dialogs.component';
import { MesVehiculesComponent } from './mes-vehicules/mes-vehicules.component';
import { VehiculeLoueComponent } from './vehicule-loue/vehicule-loue.component';
import { AjouterVehiculeLoueComponent } from './vehicule-loue/ajouter-vehicule-loue/ajouter-vehicule-loue.component';
import { AjouterVehiculeComponent } from './mes-vehicules/ajouter-vehicule/ajouter-vehicule.component';
import { ListerVehiculesComponent } from './mes-vehicules/lister-vehicules/lister-vehicules.component';
import { ListerVehiculesLoueComponent } from './vehicule-loue/lister-vehicules-loue/lister-vehicules-loue.component';
import { MatSliderModule } from '@angular/material/slider';

import localeFr from '@angular/common/locales/fr';

import { VehiculeRoutingModule } from './vehicule-routing.module';
import { ModifierVehiculeComponent } from './mes-vehicules/modifier-vehicule/modifier-vehicule.component';
import { ModifierVehiculeLoueComponent } from './vehicule-loue/modifier-vehicule-loue/modifier-vehicule-loue.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    VehiculeComponent,
    MesVehiculesComponent,
    DetailVehiculeComponent,
    MajVehiculeComponent,
    BoiteDialogueEntretien,
    ReclamationComponent,
    VehiculeLoueComponent,
    NotificationComponent,
    MiseAJourConsommationComponent,
    AjouterVehiculeLoueComponent,
    DetailVehiculeLoueComponent,
    VehiculeLoueComponent,
    AjouterVehiculeComponent,
    ListerVehiculesComponent,
    ListerVehiculesLoueComponent,
    HistoriqueConsommation,
    ModifierVehiculeComponent,
    ModifierVehiculeLoueComponent
  ],
  imports: [
    CommonModule,
    VehiculeRoutingModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatGridListModule,
    MatTabsModule,
    DragDropModule,
    MatTooltipModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatStepperModule,
    MatSliderModule,
    MatProgressBarModule
  ],
  providers: [
    MatDatepickerModule,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
})
export class VehiculeModule {}

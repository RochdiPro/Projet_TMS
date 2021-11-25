import { AgmCoreModule } from '@agm/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QRCodeModule } from 'angular2-qrcode';
import { SafePipeModule } from 'safe-pipe';
import { DirectionsMapDirective } from '../../../directions-map.directive';
import { AjoutMissionComponent } from './ajout-mission/ajout-mission.component';
import { MissionsRoutingModule } from './missions-routing.module';
import { AffecterCommande, DetailComponent, ListerMissionsComponent, MapsComponent, MissionsComponent, QrCodeComponent } from './missions.component';
import { AffecterChauffeur } from './dialogs/dialogs.component';







@NgModule({
  declarations: [
    MissionsComponent,
    ListerMissionsComponent,
    DetailComponent,
    MapsComponent,
    AffecterCommande,
    QrCodeComponent,
    DirectionsMapDirective,
    AjoutMissionComponent,
    AffecterChauffeur

  ],
  imports: [
    SafePipeModule,
    CommonModule,
    MissionsRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8'
    }),
    QRCodeModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule
  ],
  providers: [MatDatepickerModule, DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],

})
export class MissionsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { DirectionsMapDirective } from '../../../directions-map.directive';
import { SafePipeModule } from 'safe-pipe';
import { QRCodeModule } from 'angular2-qrcode';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';




import { MissionsComponent, ListerMissionsComponent, DetailComponent,MapsComponent, AffecterCommande, QrCodeComponent } from './missions.component';
import { AjoutMissionComponent} from './ajout-mission/ajout-mission.component';


import { MissionsRoutingModule } from './missions-routing.module';


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

import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { CommonModule, DatePipe } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
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
import { AjoutMissionComponent } from './ajout-mission/ajout-mission.component';
import { MissionsRoutingModule } from './missions-routing.module';
import { MissionsComponent } from './missions.component';
import {
  AffecterMultiChauffeur,
  AffecterChauffeur,
  DetailComponent,
  PositionComponent,
  DetailCommande,
  ConfirmerLivraison,
  ModifierMission,
  ConfirmationAnnulationMission,
  Trajet,
  PlanChargement,
} from './dialogs/dialogs.component';
import { ListerMissionsComponent } from './lister-missions/lister-missions.component';
import { MissionsChauffeurComponent } from './missions-chauffeur/missions-chauffeur.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { AppInitService } from './services/app-init.service';

@NgModule({
  declarations: [
    MissionsComponent,
    ListerMissionsComponent,
    DetailComponent,
    PositionComponent,
    AjoutMissionComponent,
    AffecterMultiChauffeur,
    AffecterChauffeur,
    MissionsChauffeurComponent,
    DetailCommande,
    ConfirmerLivraison,
    ModifierMission,
    ConfirmationAnnulationMission,
    Trajet,
    PlanChargement,
  ],
  imports: [
    SafePipeModule,
    CommonModule,
    MissionsRoutingModule,
    AgmCoreModule.forRoot(),
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
    MatListModule,
    MatNativeDateModule,
    DragDropModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    MatDatepickerModule,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    {
      provide: APP_INITIALIZER,
      useFactory: (http: HttpClient) => () => AppInitService.loadApiKey(http),
      deps: [HttpClient],
      multi: true,
    },
    {
      provide: LAZY_MAPS_API_CONFIG,
      useFactory: (init: AppInitService) => ({ apiKey: init.apiKey }),
      deps: [AppInitService],
    },
  ],
})
export class MissionsModule {}

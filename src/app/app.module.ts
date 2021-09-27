import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { ChildComponent } from './child/child.component';
import { SubChildComponent } from './sub-child/sub-child.component';
import { HttpClientModule } from '@angular/common/http';
import { MenuTMSComponent } from './TMS/menu-tms/menu-tms.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VehiculeComponent, MesVehiculesComponent, AjouterCarburantComponent, DetailVehiculeComponent, MiseAJourComponent, ReclamationComponent, AjoutComponent, NotificationComponent, MiseAJourConsommationComponent, VehiculesLoueComponent, AjouterVehiculeLoueComponent, DetailVehiculeLoueComponent } from './TMS/parc/vehicule/vehicule.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MatBadgeModule } from '@angular/material/badge';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { DatePipe } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MenuParcComponent } from './TMS/parc/menu-parc/menu-parc.component';
import { ChauffeursComponent } from './TMS/parc/chauffeurs/chauffeurs.component';
import { MissionsComponent, ListerMissionsComponent, DetailComponent,MapsComponent, AjouterMissionComponent, AffecterCommande, QrCodeComponent } from './TMS/parc/missions/missions.component';
import { AgmCoreModule } from '@agm/core';
import { DirectionsMapDirective } from './directions-map.directive';
import { SafePipeModule } from 'safe-pipe';
import { QRCodeModule } from 'angular2-qrcode';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectAutocompleteModule } from 'mat-select-autocomplete';
import { ListeColisageComponent, AjouterProduitComponent, MenuAjouterComponent, AjouterPackComponent } from './colisage/liste-colisage/liste-colisage.component';
import { ColisageComponent } from './colisage/colisage.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

registerLocaleData(localeFr, 'fr');


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ChildComponent,
    SubChildComponent,
    MenuTMSComponent,
    VehiculeComponent,
    MesVehiculesComponent,
    AjouterCarburantComponent,
    DetailVehiculeComponent,
    MiseAJourComponent,
    ReclamationComponent,
    VehiculesLoueComponent,
    AjoutComponent,
    NotificationComponent,
    MiseAJourConsommationComponent,
    MenuParcComponent,
    ChauffeursComponent,
    MissionsComponent,
    ListerMissionsComponent,
    DetailComponent,
    AjouterMissionComponent,
    DirectionsMapDirective,
    MapsComponent,
    AffecterCommande,
    QrCodeComponent,
    ListeColisageComponent,
    ColisageComponent,
    AjouterProduitComponent,
    MenuAjouterComponent,
    AjouterPackComponent,
    AjouterVehiculeLoueComponent,
    DetailVehiculeLoueComponent
   
  ],
  imports: [
    SafePipeModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatExpansionModule,
    MatTabsModule,
    DragDropModule,
    MatTooltipModule,
    FormsModule,  
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8'
    }),
    
    QRCodeModule,
    SelectAutocompleteModule,
    MatStepperModule,
    MatRadioModule,
    MatSlideToggleModule
    
    ],
  providers: [MatDatepickerModule,DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],

  bootstrap: [AppComponent]
})
export class AppModule { }

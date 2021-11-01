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
import { VehiculeComponent } from './TMS/parc/vehicule/vehicule.component';
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
import { MissionsComponent, ListerMissionsComponent, DetailComponent,MapsComponent, AffecterCommande, QrCodeComponent } from './TMS/parc/missions/missions.component';
import { AgmCoreModule } from '@agm/core';
import { DirectionsMapDirective } from './directions-map.directive';
import { SafePipeModule } from 'safe-pipe';
import { QRCodeModule } from 'angular2-qrcode';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectAutocompleteModule } from 'mat-select-autocomplete';
import { ListeEmballageComponent, AjouterProduitComponent, MenuAjouterComponent, AjouterPackComponent, ListerEmballageComponent } from './colisage/liste-emballage/liste-emballage.component';
import { ColisageComponent } from './colisage/colisage.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatListModule} from '@angular/material/list';
import { SupportsComponent } from './colisage/supports/supports.component';
import { AjouterSupportComponent } from './colisage/supports/ajouter-support/ajouter-support.component'
import { ListerSupportsComponent } from './colisage/supports/lister-supports/lister-supports.component';
import { ModifierSupportComponent } from './colisage/supports/modifier-support/modifier-support.component'
import { AjouterVehiculeComponent, AjouterCarburantComponent, DetailVehiculeComponent, MesVehiculesComponent, MajVehiculeComponent, MiseAJourConsommationComponent, NotificationComponent, ReclamationComponent, BoiteDialogueEntretien } from './TMS/parc/vehicule/mes-vehicules/mes-vehicules.component';import { AjouterVehiculeLoueComponent, DetailVehiculeLoueComponent, VehiculeLoueComponent } from './TMS/parc/vehicule/vehicule-loue/vehicule-loue.component';
import { AjoutMissionComponent} from './TMS/parc/missions/ajout-mission/ajout-mission.component';
import { CommandeComponent } from './colisage/commande/commande.component';
import { AjouterCommandeComponent, BoiteDialogueInfo, BoiteDialogueCreerCommande, BoiteDialogueEmballer, BoiteDialogueDetailProduit } from './colisage/commande/ajouter-commande/ajouter-commande.component';
import { ListerCommandeComponent, ModifierCommande } from './colisage/commande/lister-commande/lister-commande.component'
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
    MajVehiculeComponent,
    BoiteDialogueEntretien,
    ReclamationComponent,
    VehiculeLoueComponent,
    AjouterVehiculeComponent,
    NotificationComponent,
    MiseAJourConsommationComponent,
    MenuParcComponent,
    ChauffeursComponent,
    MissionsComponent,
    ListerMissionsComponent,
    DetailComponent,
    DirectionsMapDirective,
    MapsComponent,
    AffecterCommande,
    QrCodeComponent,
    ListeEmballageComponent,
    ColisageComponent,
    AjouterProduitComponent,
    MenuAjouterComponent,
    AjouterPackComponent,
    AjouterVehiculeLoueComponent,
    DetailVehiculeLoueComponent,
    SupportsComponent,
    ListerEmballageComponent,
    ListerSupportsComponent, 
    AjouterSupportComponent, ModifierSupportComponent, VehiculeLoueComponent,
    AjoutMissionComponent,
    CommandeComponent,
    AjouterCommandeComponent,
    BoiteDialogueInfo,
    BoiteDialogueCreerCommande,
    BoiteDialogueEmballer,
    BoiteDialogueDetailProduit,
    ListerCommandeComponent,
    ModifierCommande
   
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
    MatSlideToggleModule,
    MatListModule
    
    ],
  providers: [MatDatepickerModule,DatePipe,{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],

  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AgmCoreModule } from '@agm/core';



import { ColisageComponent } from './colisage.component';
import { ListeEmballageComponent } from './liste-emballage/liste-emballage.component';
import { SupportsComponent } from './supports/supports.component';
import { AjouterSupportComponent } from './supports/ajouter-support/ajouter-support.component'
import { ListerSupportsComponent } from './supports/lister-supports/lister-supports.component';
import { ModifierSupportComponent } from './supports/modifier-support/modifier-support.component'
import { CommandeComponent } from './commande/commande.component';
import { AjouterCommandeComponent } from './commande/ajouter-commande/ajouter-commande.component';
import { BoiteDialogueInfo, BoiteDialogueCreerCommande, BoiteDialogueEmballer, BoiteDialogueDetailProduit, BoiteDialogueModifierPositionComponent } from './commande/dialogs/dialogs.component';
import { ListerCommandeComponent } from './commande/lister-commande/lister-commande.component';


import { ColisageRoutingModule } from './colisage-routing.module';
import { AjouterPackComponent } from './liste-emballage/ajouter-pack/ajouter-pack.component';
import { AjouterProduitComponent } from './liste-emballage/ajouter-produit/ajouter-produit.component';
import { ListerEmballageComponent } from './liste-emballage/lister-emballage/lister-emballage.component';
import { MenuAjouterEmballageComponent } from './liste-emballage/menu-ajouter-emballage/menu-ajouter-emballage.component';


@NgModule({
  declarations: [
    ColisageComponent,
    ListeEmballageComponent,
    SupportsComponent,
    ListerSupportsComponent,
    AjouterSupportComponent, ModifierSupportComponent,
    CommandeComponent,
    AjouterCommandeComponent,
    BoiteDialogueInfo,
    BoiteDialogueCreerCommande,
    BoiteDialogueEmballer,
    BoiteDialogueDetailProduit,
    ListerCommandeComponent,
    MenuAjouterEmballageComponent,
    AjouterPackComponent,
    AjouterProduitComponent,
    ListerEmballageComponent,
    BoiteDialogueModifierPositionComponent
  ],
  imports: [
    CommonModule,
    ColisageRoutingModule,
    MatStepperModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatListModule,
    MatNativeDateModule,
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
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8'
    }),
  ],
  providers: [MatDatepickerModule, DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],

})
export class ColisageModule { }

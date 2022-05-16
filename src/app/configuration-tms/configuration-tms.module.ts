import { APP_INITIALIZER, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationTmsRoutingModule } from './configuration-tms-routing.module';
import { ConfigurationTmsComponent } from './configuration-tms.component';
import { ConfigurationGeneraleComponent } from './configuration-generale/configuration-generale.component';
import { ConfigurationPositionComponent } from './configuration-position/configuration-position.component';
import { MatButtonModule } from '@angular/material/button';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { ConfigurationCommandeComponent } from './configuration-commande/configuration-commande.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ConfigurationServeurComponent } from './configuration-application/configuration-application.component';
import { HttpClient } from '@angular/common/http';
import { AppInitService } from './services/app-init.service';
import { ConfigurationProduitComponent } from './configuration-produit/configuration-produit.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ImporterExporterComponent } from './importer-exporter/importer-exporter.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    ConfigurationTmsComponent,
    ConfigurationGeneraleComponent,
    ConfigurationPositionComponent,
    ConfigurationCommandeComponent,
    ConfigurationServeurComponent,
    ConfigurationProduitComponent,
    ImporterExporterComponent,
  ],
  imports: [
    CommonModule,
    ConfigurationTmsRoutingModule,
    MatButtonModule,
    AgmCoreModule.forRoot(),
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  providers: [
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
export class ConfigurationTmsModule {}

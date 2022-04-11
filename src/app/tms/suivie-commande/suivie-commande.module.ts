import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SuivieCommandeRoutingModule } from './suivie-commande-routing.module';
import { SuivieCommandeComponent } from './suivie-commande.component';


@NgModule({
  declarations: [
    SuivieCommandeComponent
  ],
  imports: [
    CommonModule,
    SuivieCommandeRoutingModule,
    FormsModule
  ]
})
export class SuivieCommandeModule { }

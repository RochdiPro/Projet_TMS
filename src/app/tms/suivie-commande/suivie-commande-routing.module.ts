import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuivieCommandeComponent } from './suivie-commande.component';

const routes: Routes = [{path: '', component: SuivieCommandeComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuivieCommandeRoutingModule { }

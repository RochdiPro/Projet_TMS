import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouterCommandeComponent } from './commande/ajouter-commande/ajouter-commande.component';
import { CommandeComponent } from './commande/commande.component';
import { ListerCommandeComponent } from './commande/lister-commande/lister-commande.component';
import { AjouterPackComponent } from './liste-emballage/ajouter-pack/ajouter-pack.component';
import { AjouterProduitComponent } from './liste-emballage/ajouter-produit/ajouter-produit.component';
import { ListeEmballageComponent } from './liste-emballage/liste-emballage.component';
import { ListerEmballageComponent } from './liste-emballage/lister-emballage/lister-emballage.component';
import { MenuAjouterEmballageComponent } from './liste-emballage/menu-ajouter-emballage/menu-ajouter-emballage.component';
import { AjouterProduitsComponent } from './produits/ajouter-produit/ajouter-produits.component';
import { ListerProduitComponent } from './produits/lister-produit/lister-produit.component';
import { ProduitsComponent } from './produits/produits.component';
import { AjouterSupportComponent } from './supports/ajouter-support/ajouter-support.component';
import { ListerSupportsComponent } from './supports/lister-supports/lister-supports.component';
import { ModifierSupportComponent } from './supports/modifier-support/modifier-support.component';
import { SupportsComponent } from './supports/supports.component';

const routes: Routes = [
  {
    path: 'Packaging',
    component: ListeEmballageComponent,
    children: [
      { path: 'Liste_Pack', component: ListerEmballageComponent },
      { path: 'Menu_Ajouter', component: MenuAjouterEmballageComponent },
      { path: 'Ajouter_Produit', component: AjouterProduitComponent },
      { path: 'Ajouter_Pack', component: AjouterPackComponent },
    ],
  },
  {
    path: 'Supports',
    component: SupportsComponent,
    children: [
      { path: 'Liste_Support', component: ListerSupportsComponent },
      { path: 'Ajouter_Support', component: AjouterSupportComponent },
      { path: 'Modifier_Support', component: ModifierSupportComponent },
    ],
  },
  {
    path: 'commandes',
    component: CommandeComponent,
    children: [
      { path: 'ajout-commande', component: AjouterCommandeComponent },
      { path: 'liste-commande', component: ListerCommandeComponent },
    ],
  },
  {
    path: 'Produits',
    component: ProduitsComponent,
    children: [
      { path: 'ajout-produit', component: AjouterProduitsComponent },
      { path: 'liste-produits', component: ListerProduitComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColisageRoutingModule {}

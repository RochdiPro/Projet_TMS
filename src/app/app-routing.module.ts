import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChildComponent } from './child/child.component';
import { MenuComponent } from './menu/menu.component';
import { SubChildComponent } from './sub-child/sub-child.component';
import { MenuTMSComponent } from './TMS/menu-tms/menu-tms.component'
import { MenuParcComponent } from './TMS/parc/menu-parc/menu-parc.component';
import { VehiculeComponent, MesVehiculesComponent, VehiculesLoueComponent } from './TMS/parc/vehicule/vehicule.component';
import { ChauffeursComponent } from './TMS/parc/chauffeurs/chauffeurs.component';
import { AjouterMissionComponent, ListerMissionsComponent, MissionsComponent } from './TMS/parc/missions/missions.component';
import { ColisageComponent } from './colisage/colisage.component';
import { ListeColisageComponent, AjouterProduitComponent, MenuAjouterComponent, AjouterPackComponent, ListerColisageComponent } from './colisage/liste-colisage/liste-colisage.component';
import { AjouterSupportComponent, ListerSupportsComponent, SupportsComponent } from './colisage/supports/supports.component';


const routes: Routes =
  [
    { path: '', redirectTo: 'Menu', pathMatch: 'full' },

    {
      path: 'Menu', component: MenuComponent, children: [

        {
          path: 'child', component: ChildComponent, children: [

            { path: 'Sub_child', component: SubChildComponent },

          ]
        },
        {
          path: 'Menu_Colisage', component: ColisageComponent, children: [
            {
              path: 'Packaging', component: ListeColisageComponent, children: [
                { path: 'Liste_Pack', component: ListerColisageComponent },
                { path: 'Menu_Ajouter', component: MenuAjouterComponent },
                { path: 'Ajouter_Produit', component: AjouterProduitComponent },
                { path: 'Ajouter_Pack', component: AjouterPackComponent }
              ]
            },
            {
              path: 'Supports', component: SupportsComponent, children: [
                { path: 'Liste_Support', component: ListerSupportsComponent },
                { path: 'Ajouter_Support', component: AjouterSupportComponent },
              ]
            },


          ]
        },
        {
          path: 'TMS', component: MenuTMSComponent, children: [

            { path: 'Parc', component: MenuParcComponent },
            {
              path: 'Vehicules', component: VehiculeComponent, children: [
                { path: 'Mes-Vehicules', component: MesVehiculesComponent },
                { path: 'Vehicules-Loues', component: VehiculesLoueComponent },
              ]
            },
            { path: 'Chauffeurs', component: ChauffeursComponent },
            {
              path: 'Missions', component: MissionsComponent, children: [
                { path: 'Liste_Missions', component: ListerMissionsComponent },
                { path: 'Ajouter_Missions', component: AjouterMissionComponent },
              ]
            },

          ]
        },



      ]
    }]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarburantComponent } from './carburant/carburant.component';
import { MenuComponent } from './menu/menu.component';
import { MissionsComponent } from './missions/missions.component';
import { VehiculeComponent } from './vehicule/vehicule.component';

const routes: Routes = [
  { path: 'Menu', component: MenuComponent },
  { path: 'Vehicules', component: VehiculeComponent, loadChildren: () => import('./vehicule/vehicule.module').then(m => m.VehiculeModule) },
  { path: 'Chauffeurs', loadChildren: () => import('./chauffeurs/chauffeurs.module').then(m => m.ChauffeursModule) },
  { path: 'Missions', component: MissionsComponent, loadChildren: () => import('./missions/missions.module').then(m => m.MissionsModule) },
  { path: 'Carburants', component: CarburantComponent, loadChildren: () => import('./carburant/carburant.module').then(m => m.CarburantModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParcTransportRoutingModule { }

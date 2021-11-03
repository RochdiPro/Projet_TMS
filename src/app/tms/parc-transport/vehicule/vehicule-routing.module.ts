import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjouterVehiculeComponent } from './mes-vehicules/ajouter-vehicule/ajouter-vehicule.component';
import { ListerVehiculesComponent } from './mes-vehicules/lister-vehicules/lister-vehicules.component';
import { MesVehiculesComponent } from './mes-vehicules/mes-vehicules.component';
import { AjouterVehiculeLoueComponent } from './vehicule-loue/ajouter-vehicule-loue/ajouter-vehicule-loue.component';
import { ListerVehiculesLoueComponent } from './vehicule-loue/lister-vehicules-loue/lister-vehicules-loue.component';
import { VehiculeLoueComponent } from './vehicule-loue/vehicule-loue.component';

const routes: Routes = [
  {
    path: 'Mes-Vehicules',
    component: MesVehiculesComponent,
    children: [
      { path: 'ajouter-vehicule', component: AjouterVehiculeComponent },
      { path: 'lister-vehicules', component: ListerVehiculesComponent },
    ],
  },
  {
    path: 'Vehicules-Loues',
    component: VehiculeLoueComponent,
    children: [
      { path: 'ajouter-vehicule', component: AjouterVehiculeLoueComponent },
      { path: 'lister-vehicules', component:  ListerVehiculesLoueComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiculeRoutingModule {}

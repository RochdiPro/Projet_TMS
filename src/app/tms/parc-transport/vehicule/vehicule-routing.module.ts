import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesVehiculesComponent } from './mes-vehicules/mes-vehicules.component';
import { VehiculeLoueComponent } from './vehicule-loue/vehicule-loue.component';

const routes: Routes = [
  { path: 'Mes-Vehicules', component: MesVehiculesComponent },
  { path: 'Vehicules-Loues', component: VehiculeLoueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeRoutingModule { }

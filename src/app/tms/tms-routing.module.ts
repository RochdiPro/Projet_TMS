import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParcTransportComponent } from './parc-transport/parc-transport.component';

const routes: Routes = [
  { path: 'Parc', component: ParcTransportComponent, loadChildren: () => import('./parc-transport/parc-transport.module').then(m => m.ParcTransportModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TmsRoutingModule { }

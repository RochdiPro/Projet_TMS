import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChildComponent } from './child/child.component';
import { MenuComponent } from './menu/menu.component';
import { SubChildComponent } from './sub-child/sub-child.component';
import { MenuTMSComponent } from './TMS/menu-tms/menu-tms.component'
import { MenuParcComponent } from './TMS/parc/menu-parc/menu-parc.component'
import { VehiculeComponent } from './TMS/parc/vehicule/vehicule.component'
 
const routes: Routes =
  [
    { path: '', redirectTo: 'Menu', pathMatch: 'full' },

    {
      path: 'Menu', component: MenuComponent, children: [
         
        {
          path: 'child', component: ChildComponent, children: [
          
            { path: 'Sub_child', component: SubChildComponent},
   
          ]
        },
        { path: 'Parc', component: MenuParcComponent },
        { path: 'Vehicules', component: VehiculeComponent }

    ]}]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

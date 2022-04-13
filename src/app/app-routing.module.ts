import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  { path: '', redirectTo: 'Menu', pathMatch: 'full' },

  {
    path: 'Menu',
    component: MenuComponent,
    children: [
      {
        path: 'Menu_Colisage',
        loadChildren: () =>
          import('./colisage/colisage.module').then((m) => m.ColisageModule),
      },
      {
        path: 'TMS',
        loadChildren: () => import('./tms/tms.module').then((m) => m.TmsModule),
      },
      {
        path: 'Configuration',
        loadChildren: () =>
          import('./configuration-tms/configuration-tms.module').then(
            (m) => m.ConfigurationTmsModule
          ),
      },
      {
        path: 'Menu-RH',
        loadChildren: () =>
          import('./RH/rh.module').then(
            (m) => m.RhModule
          ),
      },
      {
        path: 'Menu-init/Menu-client',
        loadChildren: () =>
          import('./init/client/client.module').then(
            (m) => m.ClientModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

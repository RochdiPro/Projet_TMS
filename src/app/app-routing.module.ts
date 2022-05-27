import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnexionComponent } from './authentication/connexion/connexion.component';
import { AuthGaurdService } from './authentication/services/auth-gaurd.service';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  { path: '', redirectTo: 'Login', pathMatch: 'full' },
  {
    path: 'Login',
    loadChildren: () =>
      import('./authentication/connexion/connexion.module').then((m) => m.ConnexionModule),
  },
  {
    path: 'Menu',
    component: MenuComponent,
    canActivate:[AuthGaurdService],
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
        loadChildren: () => import('./RH/rh.module').then((m) => m.RhModule),
      },
      {
        path: 'Menu-init/Menu-client',
        loadChildren: () =>
          import('./init/client/client.module').then((m) => m.ClientModule),
      },
      {
        path: 'Menu-init/Menu-donnees',
        loadChildren: () =>
          import('./init/donnees/donnees.module').then((m) => m.DonneesModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationTmsComponent } from './configuration-tms.component';

const routes: Routes = [{ path: '', component: ConfigurationTmsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationTmsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjoutMissionComponent } from './ajout-mission/ajout-mission.component';
import { ListerMissionsComponent } from './missions.component';

const routes: Routes = [
  { path: 'Liste_Missions', component: ListerMissionsComponent },
  { path: 'Ajouter_Missions', component: AjoutMissionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule { }

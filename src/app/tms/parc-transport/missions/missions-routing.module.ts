import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjoutMissionComponent } from './ajout-mission/ajout-mission.component';
import { ListerMissionsComponent } from './lister-missions/lister-missions.component';

const routes: Routes = [
  { path: 'liste-missions', component: ListerMissionsComponent },
  { path: 'ajouter-missions', component: AjoutMissionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChauffeursComponent } from './chauffeurs.component';

const routes: Routes = [
  {path: 'liste-chauffeur', component: ChauffeursComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChauffeursRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RhRoutingModule } from './rh-routing.module';
import { RhComponent } from './rh.component';


@NgModule({
  declarations: [RhComponent],
  imports: [
    CommonModule,
    RhRoutingModule
  ]
})
export class RhModule { }

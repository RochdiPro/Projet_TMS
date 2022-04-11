import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurationTmsModule } from './configuration-tms/configuration-tms.module';
import { MissionsModule } from './tms/parc-transport/missions/missions.module';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ConfigurationTmsModule,
    MissionsModule,
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

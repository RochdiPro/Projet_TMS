
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vehicule',
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.scss']
})
export class VehiculeComponent implements OnInit {
  //Declaration des variables
  mesVehicules = false; //pour l'activation du tab mes vehicules
  vehiculesLoues = false; //pour l'activation du tab vehicules loues

  constructor(public router: Router) { }
  ngOnInit(): void {
    let routerSplit = this.router.url.split('/')
    if (routerSplit[5] === 'Mes-Vehicules') this.activerMesVehicules();
    if (routerSplit[5] === 'Vehicules-Loues') this.activerVehiculesLoues();

  }

  activerMesVehicules() {
    this.mesVehicules = true;
    this.vehiculesLoues = false;
  }

  activerVehiculesLoues() {
    this.mesVehicules = false;
    this.vehiculesLoues = true;
  }

}
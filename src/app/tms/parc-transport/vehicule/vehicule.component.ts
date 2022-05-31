
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

   // variables de droits d'accés
   nom: any;
   acces: any;
   tms: any;
   role: any;

  constructor(public router: Router) { 
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');
    this.role = sessionStorage.getItem('Role');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }
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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carburant',
  templateUrl: './carburant.component.html',
  styleUrls: ['./carburant.component.scss'],
})
export class CarburantComponent implements OnInit {
  listerEstActive = false;
  ajouterEstActive = false;

   // variables de droits d'accés
   nom: any;
   acces: any;
   tms: any;
  constructor(public router: Router) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  ngOnInit(): void {
    if (this.router.url === '/Menu/TMS/Parc/Carburants/lister-carburants')
      this.activerLister();
    if (this.router.url === '/Menu/TMS/Parc/Carburants/ajouter-carburant')
      this.activerAjouter();
  }

  activerLister() {
    this.listerEstActive = true;
    this.ajouterEstActive = false;
  }

  activerAjouter() {
    this.listerEstActive = false;
    this.ajouterEstActive = true;
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-emballage',
  templateUrl: './menu-ajouter-emballage.component.html',
  styleUrls: ['./menu-ajouter-emballage.component.scss']
})
export class MenuAjouterEmballageComponent implements OnInit {
   // variables de droits d'accés
   nom: any;
   acces: any;
   wms: any;
  constructor() {
    sessionStorage.setItem('Utilisateur', '' + "tms2");
    sessionStorage.setItem('Acces', "1000200");

    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.wms = Number( arrayOfDigits[4])
   }

  ngOnInit(): void {
  }

}

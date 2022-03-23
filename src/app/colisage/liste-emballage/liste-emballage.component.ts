import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-liste-emballage',
  templateUrl: './liste-emballage.component.html',
  styleUrls: ['./liste-emballage.component.scss']
})
export class ListeEmballageComponent implements OnInit {
   // variables de droits d'accés
   nom: any;
   acces: any;
   wms: any;
  constructor() {
    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.wms = Number( arrayOfDigits[4])
   }

  ngOnInit(): void { }

}


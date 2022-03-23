import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// ******************************************************************************************
// ************************************* Interface Supports *********************************
// ******************************************************************************************
@Component({
  selector: 'app-supports',
  templateUrl: './supports.component.html',
  styleUrls: ['./supports.component.scss'],
})
export class SupportsComponent implements OnInit {
  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  listerEstActive = false;
  ajouterEstActive = false;
  constructor(public router: Router) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Liste_Support')
      this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Ajouter_Support')
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

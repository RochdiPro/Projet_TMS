import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.scss']
})
export class ProduitsComponent implements OnInit {
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
    if (this.router.url === '/Menu/Menu_Colisage/Produits/liste-produits')
      this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/Produits/ajout-produit')
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

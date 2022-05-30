import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
})
export class CommandeComponent implements OnInit {
  listerEstActive: boolean;
  ajouterEstActive: boolean;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  constructor(public router: Router) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    if (this.router.url === '/Menu/Menu_Colisage/commandes/liste-commande')
      this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/commandes/ajout-commande')
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

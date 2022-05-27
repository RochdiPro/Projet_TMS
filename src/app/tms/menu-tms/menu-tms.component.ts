import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-tms',
  templateUrl: './menu-tms.component.html',
  styleUrls: ['./menu-tms.component.scss'],
})
export class MenuTmsComponent implements OnInit {
  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;
  constructor() {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  ngOnInit(): void {}
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rh',
  templateUrl: './rh.component.html',
  styleUrls: ['./rh.component.scss'],
})
export class RhComponent implements OnInit {
  nom: any;
  acces: any;
  tms: any;
  wms: any;
  constructor() {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {}
}

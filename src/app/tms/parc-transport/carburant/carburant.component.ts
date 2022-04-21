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
  constructor(public router: Router) {}

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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss']
})
export class CommandeComponent implements OnInit {
  listerEstActive: boolean;
  ajouterEstActive: boolean;

  constructor(public router: Router) { }

  ngOnInit(): void {
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Liste_Support') this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/commandes/ajouter-commande') this.activerAjouter();
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

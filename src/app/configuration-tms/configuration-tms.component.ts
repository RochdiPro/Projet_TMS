/**
 * Constructeur: get droit d'accées depuis sessionStorage.
 Liste des méthodes:
 * changerCategorieConfig: fonction qui permet de changer la catégorie de configuration en cliquant sur la catégorie désirée .
 */
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration-tms',
  templateUrl: './configuration-tms.component.html',
  styleUrls: ['./configuration-tms.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ConfigurationTmsComponent implements OnInit {
  serveurEstActive = true;
  generalEstActive = false;
  positionEstActive = false;
  commandeEstActive = false;
  produitEstActive = false;
  importerExporterEstActive = false;

  chargementTermine = true;


  nom: any;
  acces: any;
  tms: any;
  wms: any;
  constructor() {
    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.tms = Number( arrayOfDigits[3])
    this.wms = Number( arrayOfDigits[4])
     
  }

  ngOnInit(): void {}

  // fonction qui permet de changer la catégorie de configuration en cliquant sur la catégorie désirée 
  changerCategorieConfig(categorie: string) {
    if (!this.chargementTermine) return;
    this.chargementTermine = false
    
    switch (categorie) {
      case 'general':
        this.positionEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        this.produitEstActive = false;
        this.importerExporterEstActive = false;
        setTimeout(() => {
          this.generalEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      case 'position':
        this.generalEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        this.produitEstActive = false;
        this.importerExporterEstActive = false;
        setTimeout(() => {
          this.positionEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      case 'commande':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.serveurEstActive = false;
        this.produitEstActive = false;
        this.importerExporterEstActive = false;
        setTimeout(() => {
          this.commandeEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      case 'serveur':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.commandeEstActive = false;
        this.produitEstActive = false;
        this.importerExporterEstActive = false;
        setTimeout(() => {
          this.serveurEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      case 'produit':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        this.importerExporterEstActive = false;
        setTimeout(() => {
          this.produitEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      case 'importer/exporter':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        this.produitEstActive = false;
        setTimeout(() => {
          this.importerExporterEstActive = true;
          this.chargementTermine = true;
        }, 550);
        break;

      default:
        break;
    }
  }
}

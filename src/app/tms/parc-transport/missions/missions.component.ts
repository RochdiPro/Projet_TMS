/**
 * Constructeur: get droit d'accées depuis sessionStorage
 Liste des méthodes:
 * activerListerMissions: afficher bouton lister en etat activé et bouton ajouter en etat desactivé.
 * activerAjouterMissions: afficher bouton lister en etat désactivé et bouton ajouter en etat activé.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})

export class MissionsComponent implements OnInit {
  listerMissionEstActive = false;
  ajouterMissionEstActive = false;

  estChauffeur = false;
  
  nom: any;
  acces: any;
  tms: any;


  constructor(public router: Router) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
    if (this.tms == 1) {
      this.estChauffeur = true;
    } else if (this.tms >= 1) {
      this.estChauffeur = false
    } 
  }

  ngOnInit() {
    if (this.router.url === '/Menu/TMS/Parc/Missions/liste-missions') this.activerListerMissions();
    if (this.router.url === '/Menu/TMS/Parc/Missions/ajouter-missions') this.activerAjouterMissions();
  }

  // afficher bouton lister en etat activé et bouton ajouter en etat desactivé
  activerListerMissions() {
    this.listerMissionEstActive = true;
    this.ajouterMissionEstActive = false;
  }
  // afficher bouton lister en etat désactivé et bouton ajouter en etat activé
  activerAjouterMissions() {
    this.listerMissionEstActive = false;
    this.ajouterMissionEstActive = true;
  }
}
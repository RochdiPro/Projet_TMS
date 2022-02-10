
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


//les interfaces necessaires pour le chargement des tableau

export interface tableMissions { //inteface pour charger le table mission
  id: number;
  nom: string;
  matricule: String;
  dateLivraison: String;
  etatMission: String;
  idE: number;
}

export interface Commandes { //interface pour charger la liste des commandes
  reference: number;
  id_expediteur: number;
  expediteur: String;
  adresse_expediteur: String;
  contact_expediteur: String;
  telephone_expediteur: number;
  id_destinataire: number;
  destinataire: String;
  adresse_destinataire: String;
  contact_destinataire: String;
  telephone_destinataire: number;
  date_commande: String;
  type: String;
  nbr_obj: number;
  description: String;
  articles: String;
}

export interface tableCommandes {
  id: number;
  idMission: number;
  referenceCommande: number;
  destinataire: string;
  destination: String;
  etat: String;
}

export interface tableFactures { //interface pour charger liste des factures
  id_Facture: number;
  id_Clt: number;
}

export interface tableBL { //interface pour charger liste des bls
  id_Bl: number;
  id_Clt: number;
}

//--------------------------------------------------------------------------------------------------------------
//----------------------------------------------- MISSIONS Component -------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})

export class MissionsComponent implements OnInit {
  listerMissionEstActive = false;
  ajouterMissionEstActive = false;

  estChauffeur = false;


  constructor(public router: Router) { }

  ngOnInit() {
    if (this.router.url === '/Menu/TMS/Missions/Liste_Missions') this.activerListerMissions();
    if (this.router.url === '/Menu/TMS/Missions/Ajouter_Missions') this.activerAjouterMissions();
  }

  activerListerMissions() {
    this.listerMissionEstActive = true;
    this.ajouterMissionEstActive = false;
  }
  activerAjouterMissions() {
    this.listerMissionEstActive = false;
    this.ajouterMissionEstActive = true;
  }
}
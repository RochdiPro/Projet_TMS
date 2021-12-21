import { Component, OnInit } from '@angular/core';
import { MissionsService } from '../services/missions.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmerLivraison,
  DetailCommande,
} from '../dialogs/dialogs.component';

@Component({
  selector: 'app-missions-chauffeur',
  templateUrl: './missions-chauffeur.component.html',
  styleUrls: ['./missions-chauffeur.component.scss'],
  animations: [
    trigger('statusTableMissions', [
      state(
        'showTable',
        style({
          opacity: 1,
        })
      ),
      state(
        'hideTable',
        style({
          opacity: 0,
        })
      ),
      transition('showTable <=> hideTable', animate('300ms')),
    ]),
    trigger('statusDetailMission', [
      state(
        'show',
        style({
          top: '70px',
        })
      ),
      state(
        'hide',
        style({
          top: '100vh',
        })
      ),
      transition('show => hide', animate('300ms ease-out')),
      transition('hide => show', animate('500ms ease-out')),
    ]),
    trigger('statusAfficherCommandes', [
      state(
        'showCommandes',
        style({
          top: '0',
        })
      ),
      state(
        'hideCommandes',
        style({
          top: 'calc(100% - 200px)',
        })
      ),
      transition('showCommandes => hideCommandes', animate('300ms ease-out')),
      transition('hideCommandes => showCommandes', animate('500ms ease-out')),
    ]),
  ],
})
export class MissionsChauffeurComponent implements OnInit {
  enCoursEstClique = false;
  enAttenteEstClique = false;
  enTermineEstClique = false;
  tableMissionsEstAffiche = true;
  detailMissionEstAffiche = false;
  commandesAffiche = false;

  idChauffeur = 20;
  missions: any;
  missionsFiltree: any;
  missionSelectionnee: any;

  commandes: any;
  commandesNonLivrees: any;
  commandesLivrees: any;

  lat = 0;
  lng = 0;
  zoom = 15;
  constructor(
    private serviceMission: MissionsService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.getMissionsParIdChauffeur();
    this.etatInitiale === 'En cours'
      ? ((this.missionsFiltree = this.filtrerMissionsParEtat('En cours')),
        (this.enCoursEstClique = true))
      : ((this.missionsFiltree = this.filtrerMissionsParEtat('En attente')),
        (this.enAttenteEstClique = true));
  }

  // get liste des missions
  async getMissionsParIdChauffeur() {
    this.missions = await this.serviceMission
      .getMissionsChauffeur(this.idChauffeur)
      .toPromise();
  }

  // filtrer la liste des missions par leurs Etat
  filtrerMissionsParEtat(etat: string) {
    return this.missions.filter((mission: any) => mission.etat === etat);
  }

  // pour avoir l'etat initiale. On verifie si on a une mission en cours pour donner un etat initiale = En cours si non l'etatInitiale = En attente
  get etatInitiale() {
    let etat;
    this.filtrerMissionsParEtat('En cours').length > 0
      ? (etat = 'En cours')
      : (etat = 'En attente');
    return etat;
  }

  // verifier si il y'a une mission en cours
  get missionEnCoursExiste () {
    let existe
    this.filtrerMissionsParEtat('En cours').length > 0 ? existe = true : existe = false;
    return existe
  }

  //si on clique sur le bouton de filtrage par etat En cours on active se bouton et on affiche la liste des missions En cours
  cliquerEnCours() {
    if (this.enCoursEstClique) return
    this.enCoursEstClique = true;
    this.enAttenteEstClique = false;
    this.enTermineEstClique = false;
    this.toggleTableMissions();
    setTimeout(() => {
      this.missionsFiltree = this.filtrerMissionsParEtat('En cours');
    }, 300);
    setTimeout(() => {
      this.toggleTableMissions();
    }, 400);
  }

  //si on clique sur le bouton de filtrage par etat En attente on active se bouton et on affiche la liste des missions En cours
  cliquerEnAttente() {
    if (this.enAttenteEstClique) return
    this.enCoursEstClique = false;
    this.enAttenteEstClique = true;
    this.enTermineEstClique = false;
    this.toggleTableMissions();
    setTimeout(() => {
      this.missionsFiltree = this.filtrerMissionsParEtat('En attente');
    }, 300);
    setTimeout(() => {
      this.toggleTableMissions();
    }, 400);
  }

  //si on clique sur le bouton de filtrage par etat Terminées on active se bouton et on affiche la liste des missions En cours
  cliquerTerminee() {
    if (this.enTermineEstClique) return
    this.enCoursEstClique = false;
    this.enAttenteEstClique = false;
    this.enTermineEstClique = true;
    this.toggleTableMissions();
    setTimeout(() => {
      this.missionsFiltree = this.filtrerMissionsParEtat('Terminée');
    }, 300);
    setTimeout(() => {
      this.toggleTableMissions();
    }, 400);
  }

  // retourne le nombre de commandes dans une mission
  nbrCommandes(mission: any) {
    return mission.idCommandes.split('/').length;
  }

  // retourne le poids d'une mission
  poidsMission(mission: any) {
    return mission.poids;
  }

  // retourne le volume d'une mission
  volumeMission(mission: any) {
    return mission.volume;
  }

  async getCommandesMission(mission: any) {
    this.missionSelectionnee = mission;
    this.commandes = await this.serviceMission.getCommandesParIdMission(mission.id).toPromise();
    this.commandesLivrees = this.commandes.filter((commande: any) => commande.etat === "Livrée");
    this.commandesNonLivrees = this.commandes.filter((commande: any) => commande.etat !== "Livrée");
    this.toggleDetailMission();
  }

  async lancerMission(id: number) {
    await this.serviceMission.modifierEtatMission(id, 'En cours').toPromise();
    await this.getMissionsParIdChauffeur();
    this.missionSelectionnee = this.filtrerMissionsParEtat('En cours')[0];
    this.cliquerEnCours();
  }

  // le status et le toggle sont utilisée pour les animation lors de ouverture et la fermeture du volet details mission et details commande
  // etat du table missions "show" pour afficher, "hide" pour cacher
  get statusTableMissions() {
    return this.tableMissionsEstAffiche ? 'showTable' : 'hideTable';
  }

  // la fonction qui permet de lancer le changement d'etat
  toggleTableMissions() {
    this.tableMissionsEstAffiche = !this.tableMissionsEstAffiche;
  }

  // etat du volet detail "show" pour afficher, "hide" pour cacher
  get statusDetailMission() {
    return this.detailMissionEstAffiche ? 'show' : 'hide';
  }

  // la fonction qui permet de lancer le changement d'etat
  toggleDetailMission() {
    this.commandesAffiche = false;
    this.detailMissionEstAffiche = !this.detailMissionEstAffiche;
  }

  // etat du volet detail commande "showCommandes" pour afficher, "hideCommandes" pour cacher
  get statusAfficherCommandes() {
    return this.commandesAffiche ? 'showCommandes' : 'hideCommandes';
  }

  // la fonction qui permet de lancer le changement d'etat
  toggleAfficherCommandes() {
    this.commandesAffiche = !this.commandesAffiche;
  }

  // ouvrir la boite dialogue details commande
  ouvrirDetailCommande(id: any) {
    const dialogRef = this.dialog.open(DetailCommande, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail',
      data: {idCommande: id}
    });
  }

  // ouvrir boite dialogue confirmation livraison
  ouvrirConfirmationLivraison() {
    const dialogRef = this.dialog.open(ConfirmerLivraison, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-livraison',
    });
  }
}

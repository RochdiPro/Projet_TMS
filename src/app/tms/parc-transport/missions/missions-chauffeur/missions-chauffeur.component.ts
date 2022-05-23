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
  PlanChargement,
} from '../dialogs/dialogs.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehiculeService } from '../../vehicule/services/vehicule.service';

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
  // boutons de filtrage par etat (en cours, en attente, terminée)
  enCoursEstClique = false;
  enAttenteEstClique = false;
  termineEstClique = false;

  tableMissionsEstAffiche = true;
  detailMissionEstAffiche = false;
  commandesAffiche = false;

  // cette valeur va se changer statiquement selon le profile connéctée
  idChauffeur = 1;
  missions: any;
  missionsFiltreeParEtat: any;
  missionsAffiche: any;
  missionSelectionnee: any;

  commandes: any = [];
  commandesNonLivrees: any;
  commandesLivrees: any;

  lat = 0;
  lng = 0;
  zoom = 15;

  // les coordonnées actuelles prise depuis le navigateur
  latDepart: any;
  longDepart: any;

  // lien map
  lien: any;

  //from des controles utilisées pour choisir la date du mission
  formDate: FormGroup;

  //date d'aujourd'hui
  aujoudhui: Date = new Date();

  // afficher le filtre date ou non
  filtreDateAffiche = false;

  // point de depart
  origine: any;

  // point finale
  finChemin: any;

  // les points de stops
  pointStop: any;

  nom: any;
  acces: any;
  tms: any;

  constructor(
    private fb: FormBuilder,
    private serviceMission: MissionsService,
    private dialog: MatDialog,
    private serviceVehicule: VehiculeService
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  async ngOnInit() {
    this.formDate = this.fb.group({
      date: [this.aujoudhui, [Validators.required]],
    });
    await this.getPositionDepart();
    await this.getMissionsParIdChauffeur();
    // selon la valeur de l'état initiale on affiche initialement la tab convenable
    if (this.etatInitiale === 'En cours') {
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('En cours');
      this.missionsAffiche = this.missionsFiltreeParEtat;
      this.enCoursEstClique = true;
    } else if (this.etatInitiale === 'En attente') {
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('En attente');
      this.missionsAffiche = this.missionsFiltreeParEtat;
      this.enAttenteEstClique = true;
      this.filtreDateAffiche = true;
      this.filtrerMissionsParDate();
    } else {
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('Terminée');
      this.missionsAffiche = this.missionsFiltreeParEtat;
      this.termineEstClique = true;
    }

    this.lien =
      'https://www.google.com/maps/embed/v1/directions?key=AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8&origin=' +
      this.latDepart +
      '/' +
      this.longDepart +
      '&destination=' +
      this.latDepart +
      '/' +
      this.longDepart;
  }

  // get liste des missions
  async getMissionsParIdChauffeur() {
    this.missions = await this.serviceMission
      .getMissionsChauffeur(this.idChauffeur)
      .toPromise();
    this.missions = this.missions.filter(
      (mission: any) => mission.canvasTop !== ''
    );
  }

  // filtrer la liste des missions par leurs Etat
  filtrerMissionsParEtat(etat: string) {
    return this.missions.filter((mission: any) => mission.etat === etat);
  }
  // filtrer la liste des missions par date
  filtrerMissionsParDate() {
    this.missionsAffiche = this.missionsFiltreeParEtat.filter(
      (f: any) =>
        new Date(f.date).getDate() === this.formDate.get('date').value.getDate()
    );
  }

  // diminuer la date dans le date picker par un jour
  datePrecedente() {
    let dateChoisi = this.formDate.get('date').value;
    dateChoisi.setDate(dateChoisi.getDate() - 1);
    this.formDate.get('date').setValue(dateChoisi);
    this.filtrerMissionsParDate();
  }

  // augmenter le date dans le date picker par un jour
  dateSuivante() {
    let dateChoisi = this.formDate.get('date').value;
    dateChoisi.setDate(dateChoisi.getDate() + 1);
    this.formDate.get('date').setValue(dateChoisi);
    this.filtrerMissionsParDate();
  }

  // pour avoir l'etat initiale. On verifie si on a une mission en cours pour donner un etat initiale = En cours si non l'etatInitiale = En attente
  get etatInitiale() {
    let etat;
    if (this.filtrerMissionsParEtat('En cours').length > 0) {
      etat = 'En cours';
    } else if (this.filtrerMissionsParEtat('En attente').length > 0) {
      etat = 'En attente';
    } else {
      etat = 'Terminée';
    }
    return etat;
  }

  // verifier si il y'a une mission en cours
  get missionEnCoursExiste() {
    let existe;
    this.filtrerMissionsParEtat('En cours').length > 0
      ? (existe = true)
      : (existe = false);
    return existe;
  }

  get tousCommandesLivrees() {
    let tousLivrees;
    this.commandesNonLivrees.length == 0 
    ? (tousLivrees = true)
    : (tousLivrees = false);
    return tousLivrees;
  }

  //si on clique sur le bouton de filtrage par etat En cours on active se bouton et on affiche la liste des missions En cours
  cliquerEnCours() {
    if (this.filtrerMissionsParEtat('En cours').length === 0) return;
    if (this.enCoursEstClique) return;
    this.formDate.get('date').setValue(new Date());
    this.enCoursEstClique = true;
    this.enAttenteEstClique = false;
    this.termineEstClique = false;
    this.toggleTableMissions();
    setTimeout(() => {
      this.filtreDateAffiche = false;
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('En cours');
      this.missionsAffiche = this.missionsFiltreeParEtat;
    }, 300);
    setTimeout(() => {
      this.toggleTableMissions();
    }, 400);
  }

  //si on clique sur le bouton de filtrage par etat En attente on active se bouton et on affiche la liste des missions En cours
  cliquerEnAttente() {
    if (this.filtrerMissionsParEtat('En attente').length === 0) return;
    if (this.enAttenteEstClique) return;
    this.formDate.get('date').setValue(new Date());
    this.enCoursEstClique = false;
    this.enAttenteEstClique = true;
    this.termineEstClique = false;
    this.toggleTableMissions();
    setTimeout(() => {
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('En attente');
      this.filtreDateAffiche = true;
      this.filtrerMissionsParDate();
    }, 300);
    setTimeout(() => {
      this.toggleTableMissions();
    }, 400);
  }

  //si on clique sur le bouton de filtrage par etat Terminées on active se bouton et on affiche la liste des missions En cours
  cliquerTerminee() {
    if (this.filtrerMissionsParEtat('Terminée').length === 0) return;
    if (this.termineEstClique) return;
    this.formDate.get('date').setValue(new Date());
    this.enCoursEstClique = false;
    this.enAttenteEstClique = false;
    this.termineEstClique = true;
    this.toggleTableMissions();
    setTimeout(() => {
      this.filtreDateAffiche = false;
      this.missionsFiltreeParEtat = this.filtrerMissionsParEtat('Terminée');
      this.missionsAffiche = this.missionsFiltreeParEtat;
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

  // get liste des commande dans une mission puis on les divises par commandes livrées et commandes non livrées
  async getCommandesMission(mission: any) {
    this.commandes = [];
    this.missionSelectionnee = mission;
    let idCommandes = mission.idCommandes.split('/');
    for (let i = 0; i < idCommandes.length; i++) {
      const idCommande = Number(idCommandes[i]);
      this.commandes.push(
        await this.serviceMission.commande(idCommande).toPromise()
      );
    }
    this.commandesLivrees = this.commandes.filter(
      (commande: any) => commande.etat === 'Livrée'
    );
    this.commandesNonLivrees = this.commandes.filter(
      (commande: any) => commande.etat !== 'Livrée'
    );
    this.afficherTrajet();
  }

  // fonction qui permet de commancer une mission
  async lancerMission(mission: any) {
    await this.serviceMission
      .lancerMission(mission.id)
      .toPromise();
    await this.getMissionsParIdChauffeur();
    // pour refraichir la mission selectionnée aprés qu'on a modifié l'etat du mission
    this.missionSelectionnee = this.filtrerMissionsParEtat('En cours')[0];
    // on change la tab active vers celle en cours
    this.cliquerEnCours();
    this.serviceMission
      .envoyerNotificationProchaineLivraison(mission.idCommandes)
      .subscribe();
    if (mission.typeVehicule === 'prive') {
      this.serviceVehicule
        .changerEtatVehicule(mission.matricule, 'En mission')
        .subscribe();
    } else {
      this.serviceVehicule
        .changerEtatVehiculeLoue(mission.matricule, 'En mission')
        .subscribe();
    }
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
      panelClass: 'custom-dialog-detail-commande-chauffeur',
      data: {
        idMission: this.missionSelectionnee.id,
        idCommande: id,
        mode: 'chauffeur',
      },
    });
  }

  // ouvrir boite dialogue confirmation livraison
  ouvrirConfirmationLivraison(mission: any) {
    const dialogRef = this.dialog.open(ConfirmerLivraison, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-livraison',
      data: { mission: mission },
    });
  }

  // avoir la position de début depuis le navigateur
  async getPositionDepart() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latDepart = position.coords.latitude;
        this.longDepart = position.coords.longitude;
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  // retourne la position de destination d'une commande
  async getPosition(idPosition: any) {
    let position = await this.serviceMission
      .getPositionById(idPosition)
      .toPromise();
    return position;
  }

  // créer le meilleur trajet possible
  async createTrajet() {
    await this.getPositionDepart();
    let positions: any = [];
    let idCommandes = this.missionSelectionnee.idCommandes.split('/');
    for (let i = 0; i < idCommandes.length; i++) {
      const idCommande = Number(idCommandes[i]);
      const commande = await this.serviceMission
        .commande(idCommande)
        .toPromise();
      commande.etat !== 'Livrée'
        ? positions.push(await this.getPosition(commande.idPosition))
        : '';
    }
    var debutChemin = {
      latitude: this.latDepart,
      longitude: this.longDepart,
    };
    var finChemin = positions[positions.length - 1];
    let pointStop = [];
    for (let i = 0; i < positions.length - 1; i++) {
      pointStop.push(positions[i]);
    }
    return {
      debutChemin: debutChemin,
      finChemin: finChemin,
      pointStop: pointStop,
    };
  }

  //afficher le trajet
  async afficherTrajet() {
    let trajet = await this.createTrajet();
    this.origine =
      trajet.debutChemin.latitude + '/' + trajet.debutChemin.longitude;
    if (!trajet.finChemin) {
      this.lien =
      'https://www.google.com/maps/embed/v1/directions?key=AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8&origin=' +
      this.latDepart +
      '/' +
      this.longDepart +
      '&destination=' +
      this.latDepart +
      '/' +
      this.longDepart;
      return;
    }
    this.finChemin =
      trajet.finChemin.latitude + '/' + trajet.finChemin.longitude;
    this.pointStop = '';
    for (let i = 0; i < trajet.pointStop.length; i++) {
      this.pointStop +=
        trajet.pointStop[i].latitude +
        '/' +
        trajet.pointStop[i].longitude +
        '%7C';
    }
    this.pointStop = this.pointStop.slice(0, -3); //définir les points de stop
    if (this.pointStop === '') {
      //afficher le map avec le trajet
      this.lien =
        'https://www.google.com/maps/embed/v1/directions?key=AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8&origin=' +
        this.origine +
        '&destination=' +
        this.finChemin;
    } else {
      this.lien =
        'https://www.google.com/maps/embed/v1/directions?key=AIzaSyCwmKoPqb0RLbWgBxRRu20Uz9HVPZF-PJ8&origin=' +
        this.origine +
        '&destination=' +
        this.finChemin +
        '&waypoints=' +
        this.pointStop;
    }
  }

  ouvrirMap() {
    //ouvrir le trajet dans google maps
    window.open(
      'https://www.google.com/maps/dir/?api=1&origin=' +
        this.origine +
        '&destination=' +
        this.finChemin +
        '&travelmode=driving&waypoints=' +
        this.pointStop
    );
  }

  // ouvrir la boite dialogue plan chargement
  ouvrirPlanChargement() {
    const dialogRef = this.dialog.open(PlanChargement, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'custom-dialog-plan-chargement',
      data: {
        mission: this.missionSelectionnee,
      },
    });
  }
}

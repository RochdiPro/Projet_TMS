import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommandeService } from 'src/app/colisage/commande/services/commande.service';
import Swal from 'sweetalert2';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';
import { VehiculeService } from '../../vehicule/services/vehicule.service';
import {
  AffecterChauffeur,
  AffecterMultiChauffeur,
} from '../dialogs/dialogs.component';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-ajout-mission',
  templateUrl: './ajout-mission.component.html',
  styleUrls: ['./ajout-mission.component.scss'],
})
export class AjoutMissionComponent implements OnInit {
  // liste des regions avec leurs villes
  regions: any = [
    {
      nom: 'Nord-Est',
      ville: [
        'Bizerte',
        'Tunis',
        'Ariana',
        'Manouba',
        'Ben_Arous',
        'Zaghouan',
        'Nabeul',
      ],
    },
    { nom: 'Nord-Ouest', ville: ['Jendouba', 'Beja', 'Kef', 'Siliana'] },
    { nom: 'Centre-Est', ville: ['Sousse', 'Monastir', 'Mahdia'] },
    { nom: 'Centre-Ouest', ville: ['Kairouan', 'Kasserine', 'Sidi_Bouzid'] },
    { nom: 'Sud-Est', ville: ['Sfax', 'Gabes', 'Mednine', 'Tataouine'] },
    { nom: 'Sud-Ouest', ville: ['Gafsa', 'Tozeur', 'Kebili'] },
  ];
  commandes: any = [];
  commandesNordEst: any = [];
  commandesNordOuest: any = [];
  commandesCentreEst: any = [];
  commandesCentreOuest: any = [];
  commandesSudEst: any = [];
  commandesSudOuest: any = [];
  formVehicule: FormGroup; //from des controles utilisées pour choisir une vehicule
  formDate: FormGroup; //from des controles utilisées pour choisir la date du mission
  listeVehiculesAffiches: any = []; //liste des vehicules prive a afficher (etat dispo)
  listeVehiculesLoues: any = [];
  mission: any[] = [];
  checkBoxVehicules: any[] = []; //liste valeur des chackBoxes vehicules prives
  checkBoxVehiculesLoues: any[] = []; //liste valeur des chackBoxes vehicules loues
  vehiculesSelectionnes: any[] = []; //liste des vehicules Selectionnés
  vehiculeEstSelectionne = false;
  vehiculesPriveSelectionnes: any = []; //liste vehicules prives selectionnés avec la liste des chauffeurs compatibles pour chage vehicule
  vehiculesLoueSelectionnes: any = [];
  copieVehiculesPrive: any = [];
  copieVehiculesLoue: any = [];
  fileAttente: any = []; //liste des mission affectées dans la file d'attente
  vehiculesMemeChauffeursSelectionne: any = []; //liste des vehicules selectionnées qui on le meme chauffeur
  minDate = new Date(); //utilisé pour la desactivation des dates passées dans le datePicker
  aujoudhui: Date = new Date(); //date d'aujourd'hui
  listeFilesAttentes: any = []; //contient la liste des files d'attente crée
  boutonEnregistrerEstActive = true;

  // coordonnées de la position actuelle
  currentLat: any;
  currentLong: any;

  constructor(
    private fb: FormBuilder,
    private serviceMission: MissionsService,
    private serviceVehicule: VehiculeService,
    private dialog: MatDialog,
    private serviceChauffeur: ChauffeurService,
    private serviceCommande: CommandeService
  ) {}

  async ngOnInit() {
    this.chercherMoi();
    this.creerForm();
    await this.getListeCommande();
    this.affecterCommandeAuRegion(); //specifier a quelle region appartienne une commande
    // creation des listes des commandes divisées par region
    this.setCommandesNordEst();
    this.setCommandesNordOuest();
    this.setCommandesCentreEst();
    this.setCommandesCentreOuest();
    this.setCommandesSudEst();
    this.setCommandesSudOuest();
    await this.getVehiculesChauffeurs(); // recuperation de la liste des vehicules et leurs chauffeurs
    await this.getVehiculeLoueDisponibles();
    this.creerCheckBoxsVehicules();
    this.creerCheckBoxsVehiculesLoues();
  }

  // creation des formControls
  creerForm() {
    this.formDate = this.fb.group({
      date: [this.aujoudhui, [Validators.required]],
    });
    this.formVehicule = this.fb.group({
      nombreVoyages: 1,
      multiVehicule: false,
    });
  }

  // diminuer la date dans le date picker par un jour
  datePrecedente() {
    let dateChoisi = this.formDate.get('date').value;
    dateChoisi.setDate(dateChoisi.getDate() - 1);
    this.formDate.get('date').setValue(dateChoisi);
    let fileAttente = this.listeFilesAttentes.filter(
      (f: any) => f.date.getTime() === this.formDate.get('date').value.getTime()
    )[0];
    if (fileAttente === undefined) {
      this.fileAttente = [];
    } else {
      this.fileAttente = fileAttente.fileAttente;
    }
  }

  // augmenter le date dans le date picker par un jour
  dateSuivante() {
    let dateChoisi = this.formDate.get('date').value;
    dateChoisi.setDate(dateChoisi.getDate() + 1);
    this.formDate.get('date').setValue(dateChoisi);
    let fileAttente = this.listeFilesAttentes.filter(
      (f: any) => f.date.getTime() === this.formDate.get('date').value.getTime()
    )[0];
    if (fileAttente === undefined) {
      this.fileAttente = [];
    } else {
      this.fileAttente = fileAttente.fileAttente;
    }
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehicules
  async creerCheckBoxsVehicules() {
    this.listeVehiculesAffiches.forEach(() => {
      this.checkBoxVehicules.push({ value: false, disable: true });
    });
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehiculesLoues
  async creerCheckBoxsVehiculesLoues() {
    this.listeVehiculesLoues.forEach(() => {
      this.checkBoxVehiculesLoues.push({ value: false, disable: true });
    });
  }

  // fonction qui s'appelle quand on change l'etat du checkbox des vehicules
  selectionnerDeselectionnerVehicule(i: number, type: string, vehicule: any) {
    switch (type) {
      case 'privé':
        if (this.checkBoxVehicules[i].value) {
          this.selectionnerVehiculePrive(vehicule);
        } else {
          this.deselectionnerVehiculePrive(vehicule);
          this.disableCheckBoxsVehiculePoidsVolumeInferieur();
        }
        break;

      case 'loue':
        if (this.checkBoxVehiculesLoues[i].value) {
          this.selectionnerVehiculeLoue(vehicule);
        } else {
          this.deselectionnerVehiculeloue(vehicule);
          this.disableCheckBoxsVehiculePoidsVolumeInferieur();
        }
        break;

      default:
        break;
    }
  }

  // ajouter vehicule privé a la liste vehiculeSelectionne
  selectionnerVehiculePrive(vehicule: any) {
    this.vehiculesSelectionnes.push(vehicule.vehicule);
    this.vehiculesPriveSelectionnes.push(vehicule);
    if (!this.formVehicule.get('multiVehicule').value) {
      this.checkBoxVehicules.forEach((checkBox) => {
        if (!checkBox.value) {
          checkBox.disable = true;
        }
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        if (!checkBox.value) {
          checkBox.disable = true;
        }
      });
    }
  }

  // supprimer vehicule privé de la liste vehiculesSelectionne
  deselectionnerVehiculePrive(vehicule: any) {
    let index = this.vehiculesSelectionnes.findIndex(
      (v) => v.id === vehicule.vehicule.id
    );
    this.vehiculesSelectionnes.splice(index, 1);
    let i = this.vehiculesPriveSelectionnes.findIndex(
      (v: any) => v.vehicule.id === vehicule.id
    );
    this.vehiculesPriveSelectionnes.splice(i, 1);
    this.checkBoxVehicules.forEach((checkBox) => {
      checkBox.disable = false;
    });
    this.checkBoxVehiculesLoues.forEach((checkBox) => {
      checkBox.disable = false;
    });
    this.rajouterChauffeurAuVehicule(vehicule);
  }
  // ajouter vehicule loué a la liste vehiculeSelectionne
  selectionnerVehiculeLoue(vehicule: any) {
    this.vehiculesSelectionnes.push(vehicule.vehicule);
    this.vehiculesLoueSelectionnes.push(vehicule);
    if (!this.formVehicule.get('multiVehicule').value) {
      this.checkBoxVehicules.forEach((checkBox) => {
        if (!checkBox.value) {
          checkBox.disable = true;
        }
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        if (!checkBox.value) {
          checkBox.disable = true;
        }
      });
    }
  }

  // supprimer vehicule loué de la liste vehiculesSelectionne
  deselectionnerVehiculeloue(vehicule: any) {
    let index = this.vehiculesSelectionnes.findIndex(
      (v) => v.id_Vehicule_Loue === vehicule.vehicule.id_Vehicule_Loue
    );
    this.vehiculesSelectionnes.splice(index, 1);
    let i = this.vehiculesLoueSelectionnes.findIndex(
      (v: any) => v.id_Vehicule_Loue === vehicule.id_Vehicule_Loue
    );
    this.vehiculesLoueSelectionnes.splice(i, 1);
    this.checkBoxVehicules.forEach((checkBox) => {
      checkBox.disable = false;
    });
    this.checkBoxVehiculesLoues.forEach((checkBox) => {
      checkBox.disable = false;
    });
    this.rajouterChauffeurAuVehicule(vehicule);
  }

  // teste si il ya aucune vehicule selectionné
  get pasDeVehiculeSelectionne() {
    this.vehiculesSelectionnes.length > 0
      ? (this.vehiculeEstSelectionne = true)
      : (this.vehiculeEstSelectionne = false);
    return !this.vehiculeEstSelectionne;
  }

  // teste si il'y a acune commande selectionnée
  get missionVide() {
    let vide = false;
    this.mission.length > 0 ? (vide = false) : (vide = true);
    return vide;
  }

  // teste si le poids de vehicule inferieur a poids des commandes selectionnées
  get poidsVehiculeInferieurPoidsCommande() {
    return this.chargeUtileVehiculesSelectionnes < this.calculerPoidsMission();
  }

  // tester si le volume de vehicule inferieur a volume commandes selectionnées
  get volumeVehiculeInferieurVolumeCommande() {
    return this.volumeUtileVehiculesSelectionnes < this.calculerVolumeMission();
  }

  // retourne type de la commande
  getReference(commande: any) {
    let type = commande.type.split('/');
    let referenceCommandes = commande.referenceDocument.split('/');
    let referances = '';
    for (let i = 0; i < type.length; i++) {
      const typ = type[i];
      typ === 'Facture'
        ? (referances += 'F ' + referenceCommandes[i] + '/')
        : (referances += 'BL ' + referenceCommandes[i] + '/');
    }
    referances = referances.slice(0, -1);
    return referances;
  }

  // fonction qui s'execute on changeant l'etat du checkbox multiVehicules
  clickerMultiVehiculesCheckBox() {
    if (this.formVehicule.get('multiVehicule').value) {
      // si multiVehicule is checked on active tous les checkboxs
      this.checkBoxVehicules.forEach((checkBox) => {
        checkBox.disable = false;
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        checkBox.disable = false;
      });
    } else {
      // si multiVehicule is unchecked on uncheck tous les checkboxs et on supprime touts les vehicules de la liste vehiculesSelectionnes
      this.checkBoxVehicules.forEach((checkBox) => {
        checkBox.value = false;
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        checkBox.value = false;
      });
      this.vehiculesSelectionnes = [];
      this.vehiculesPriveSelectionnes = [];
      this.vehiculesLoueSelectionnes = [];
      this.disableCheckBoxsVehiculePoidsVolumeInferieur();
    }
    this.mission.length === 0 ? this.disableChaeckBoxTouteVehicules() : '';
  }

  // retourne la charge utile des vehicules selectionnées
  get chargeUtileVehiculesSelectionnes() {
    let chargeUtile = 0;
    this.vehiculesSelectionnes.forEach((vehicule) => {
      chargeUtile += vehicule.charge_utile;
    });
    chargeUtile *= this.formVehicule.get('nombreVoyages').value;
    return chargeUtile;
  }

  // retourne le volume utile des vehicules selectionnés
  get volumeUtileVehiculesSelectionnes() {
    let volumeUtile = 0;
    this.vehiculesSelectionnes.forEach((vehicule) => {
      volumeUtile += vehicule.longueur * vehicule.largeur * vehicule.hauteur;
    });
    volumeUtile *= this.formVehicule.get('nombreVoyages').value;
    // convertir de cm³ vers m³
    volumeUtile *= 0.000001;
    return Number(volumeUtile.toFixed(3));
  }

  // charger la liste des commandes
  async getListeCommande() {
    let commandes = await this.serviceMission
      .getCommandesParEtat('En cours de traitement')
      .toPromise();
    while (commandes.length > 0) {
      let adresse;
      let categorieClient;
      let contact;
      let dateCreation;
      let email;
      let etat;
      let id = '';
      let idClient;
      let idMission;
      let idPosition;
      let nomClient;
      let nomFichier;
      let numPieceIdentite;
      let poids = 0;
      let referenceDocument = '';
      let score = 0;
      let telephone;
      let trackingNumber = '';
      let type = '';
      let typePieceIdentite;
      let ville;
      let volume = 0;
      let commandesAvecMemePosition = commandes.filter(
        (cmd: any) => cmd.idPosition === commandes[0].idPosition
      );
      commandesAvecMemePosition.forEach((cmdPos: any) => {
        let i = commandes.findIndex((c: any) => c.id === cmdPos.id);
        commandes.splice(i, 1);
        adresse = cmdPos.adresse;
        categorieClient = cmdPos.categorieClient;
        contact = cmdPos.contact;
        dateCreation = cmdPos.dateCreation;
        email = cmdPos.email;
        etat = cmdPos.etat;
        id += cmdPos.id + '/';
        idClient = cmdPos.idClient;
        idMission = cmdPos.idMission;
        idPosition = cmdPos.idPosition;
        nomClient = cmdPos.nomClient;
        nomFichier = cmdPos.nomFichier;
        numPieceIdentite = cmdPos.numPieceIdentite;
        poids += cmdPos.poids;
        referenceDocument += cmdPos.referenceDocument + '/';
        score += cmdPos.score;
        telephone = cmdPos.telephone;
        trackingNumber += cmdPos.trackingNumber + '/';
        type += cmdPos.type + '/';
        typePieceIdentite = cmdPos.typePieceIdentite;
        ville = cmdPos.ville;
        volume += cmdPos.volume;
      });
      id = id.slice(0, -1);
      referenceDocument = referenceDocument.slice(0, -1);
      trackingNumber = trackingNumber.slice(0, -1);
      type = type.slice(0, -1);
      let commande = {
        adresse: adresse,
        categorieClient: categorieClient,
        contact: contact,
        dateCreation: dateCreation,
        email: email,
        etat: etat,
        id: id,
        idClient: idClient,
        idMission: idMission,
        idPosition: idPosition,
        nomClient: nomClient,
        nomFichier: nomFichier,
        numPieceIdentite: numPieceIdentite,
        poids: poids,
        referenceDocument: referenceDocument,
        score: score,
        telephone: telephone,
        trackingNumber: trackingNumber,
        type: type,
        typePieceIdentite: typePieceIdentite,
        ville: ville,
        volume: volume,
      };
      this.commandes.push(commande);
    }
  }

  // get tous les vehicules avec l'état disponible
  async getVehiculeDisponibles() {
    let listeVehiculesPrives = await this.serviceVehicule
      .filtrerVehicule('etat_vehicule', 'Disponible')
      .toPromise();
    return listeVehiculesPrives;
  }

  // get la liste des vehicules loués
  async getVehiculeLoueDisponibles() {
    let listeVehiculesLoues = await this.serviceVehicule
      .filtrerVehiculeLoues('etat_vehicule', 'Disponible')
      .toPromise();
    return listeVehiculesLoues;
  }

  // get liste des chauffeurs
  async getChauffeurs() {
    let listeChauffeurs = await this.serviceChauffeur
      .getChauffeurs()
      .toPromise();
    return listeChauffeurs;
  }

  // get les vehicules qui ont au moins un chauffeur qui peut la conduire
  async getVehiculesChauffeurs() {
    let listeVehiculesPrives = await this.getVehiculeDisponibles();
    let listeVehiculesLoues = await this.getVehiculeLoueDisponibles();
    let listeChauffeurs = await this.getChauffeurs();
    listeVehiculesPrives.forEach((vehicule: any) => {
      var chauffeurs: any = [];
      var categories = vehicule.categories.split('/');
      categories.forEach((categorie: any) => {
        listeChauffeurs.forEach((chauffeur: any) => {
          if (categorie == chauffeur.categorie_Permis) {
            chauffeurs.push(chauffeur);
          }
        });
      });
      chauffeurs.length > 0
        ? this.listeVehiculesAffiches.push({
            vehicule: vehicule,
            chauffeurs: chauffeurs,
          })
        : '';
    });
    listeVehiculesLoues.forEach((vehicule: any) => {
      var chauffeurs: any = [];
      var categories = vehicule.categories.split('/');
      categories.forEach((categorie: any) => {
        listeChauffeurs.forEach((chauffeur: any) => {
          if (categorie == chauffeur.categorie_Permis) {
            chauffeurs.push(chauffeur);
          }
        });
      });
      chauffeurs.length > 0
        ? this.listeVehiculesLoues.push({
            vehicule: vehicule,
            chauffeurs: chauffeurs,
          })
        : '';
    });
    this.copieVehiculesPrive = [];
    this.copieVehiculesLoue = [];
    for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
      this.copieVehiculesPrive.push({
        vehicule: this.listeVehiculesAffiches[i].vehicule,
        chauffeurs: [...this.listeVehiculesAffiches[i].chauffeurs],
      });
    }
    for (let i = 0; i < this.listeVehiculesLoues.length; i++) {
      this.copieVehiculesLoue.push({
        vehicule: this.listeVehiculesLoues[i].vehicule,
        chauffeurs: [...this.listeVehiculesLoues[i].chauffeurs],
      });
    }
  }

  // disable le checkBpx des vehicules privés qu'on ne peut pas affecter leurs chauffeurs qui peuvent la conduire
  disableVehiculePrive(copieVehiculesPrive: any) {
    for (let i = 0; i < copieVehiculesPrive.length; i++) {
      if (copieVehiculesPrive[i].chauffeurs.length === 0) {
        this.checkBoxVehicules[i].disable = true;
      }
    }
  }

  // disable le checkBpx des vehicules loues qu'on ne peut pas affecter leurs chauffeurs qui peuvent la conduire
  disableVehiculeLoue(copieVehiculesLoue: any) {
    for (let i = 0; i < copieVehiculesLoue.length; i++) {
      if (copieVehiculesLoue[i].chauffeurs.length === 0) {
        this.checkBoxVehiculesLoues[i].disable = true;
      }
    }
  }

  // rajouter le chauffeur du vehicule deselectionné dans las vehicules convenables
  rajouterChauffeurAuVehicule(vehiculeDeselec: any) {
    let vehicule: any;
    if (vehiculeDeselec.vehicule.id_Vehicule_Loue === undefined) {
      vehicule = this.copieVehiculesPrive.filter(
        (veh: any) => veh.vehicule.id === vehiculeDeselec.vehicule.id
      )[0];
    } else {
      vehicule = this.copieVehiculesLoue.filter(
        (veh: any) =>
          veh.vehicule.id_Vehicule_Loue ==
          vehiculeDeselec.vehicule.id_Vehicule_Loue
      )[0];
    }
    vehicule.chauffeurs.forEach((ch: object) => {
      for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
        if (
          vehicule.vehicule !== this.listeVehiculesAffiches[i].vehicule &&
          this.listeVehiculesAffiches[i].chauffeurs.includes(ch) &&
          this.copieVehiculesPrive[i].chauffeurs.length <
            this.listeVehiculesAffiches[i].chauffeurs.length
        ) {
          this.copieVehiculesPrive[i].chauffeurs.push(ch);
        }
      }
      for (let i = 0; i < this.listeVehiculesLoues.length; i++) {
        if (
          vehicule.vehicule !== this.listeVehiculesLoues[i].vehicule &&
          this.listeVehiculesLoues[i].chauffeurs.includes(ch) &&
          this.copieVehiculesLoue[i].chauffeurs.length <
            this.listeVehiculesLoues[i].chauffeurs.length
        ) {
          this.copieVehiculesLoue[i].chauffeurs.push(ch);
        }
      }
    });
  }

  // disable checkbox vehicule si le poids ou le volume est inverieur au poids ou volume de la liste des commandes selectionnées
  disableCheckBoxsVehiculePoidsVolumeInferieur() {
    if (this.mission.length === 0) return; // s'il n'ya aucune commande affectée dans mission on annule cette fonction
    if (!this.formVehicule.get('multiVehicule').value) {
      //si multi vehicule n'est pas selectionné on execute le disable des vehicules necessaire si non on active toute les vehicules
      for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
        let volume =
          this.listeVehiculesAffiches[i].vehicule.longueur *
          this.listeVehiculesAffiches[i].vehicule.largeur *
          this.listeVehiculesAffiches[i].vehicule.hauteur;
        if (
          this.listeVehiculesAffiches[i].vehicule.charge_utile *
            this.formVehicule.get('nombreVoyages').value <=
            this.calculerPoidsMission() ||
          volume * this.formVehicule.get('nombreVoyages').value <=
            this.calculerVolumeMission()
        ) {
          this.checkBoxVehicules[i].disable = true;
        } else {
          this.checkBoxVehicules[i].disable = false;
        }
      }
      for (let i = 0; i < this.listeVehiculesLoues.length; i++) {
        let volume =
          this.listeVehiculesLoues[i].vehicule.longueur *
          this.listeVehiculesLoues[i].vehicule.largeur *
          this.listeVehiculesLoues[i].vehicule.hauteur;
        if (
          this.listeVehiculesLoues[i].vehicule.charge_utile *
            this.formVehicule.get('nombreVoyages').value <=
            this.calculerPoidsMission() ||
          volume * this.formVehicule.get('nombreVoyages').value <=
            this.calculerVolumeMission()
        ) {
          this.checkBoxVehiculesLoues[i].disable = true;
        } else {
          this.checkBoxVehiculesLoues[i].disable = false;
        }
      }
    } else {
      for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
        this.checkBoxVehicules[i].disable = false;
      }
      for (let i = 0; i < this.listeVehiculesLoues.length; i++) {
        this.checkBoxVehiculesLoues[i].disable = false;
      }
    }
  }

  //affecter chaque commande a une region selon sa ville
  affecterCommandeAuRegion() {
    this.commandes.forEach((commande: any) => {
      for (const reg of this.regions) {
        if (reg.ville.includes(commande.ville)) {
          commande.region = reg.nom;
        }
      }
    });
  }

  // on affecte les commandes qui on la region Nord-Est dans la liste commandesNordEst
  setCommandesNordEst() {
    this.commandesNordEst = this.commandes.filter(
      (commande: any) => commande.region === 'Nord-Est'
    );
    this.commandesNordEst.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // on affecte les commandes qui on la region Nord-Ouest dans la liste commandesNordOuest
  setCommandesNordOuest() {
    this.commandesNordOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Nord-Ouest'
    );
    this.commandesNordOuest.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // on affecte les commandes qui on la region Centre-Est dans la liste commandesCentreEst
  setCommandesCentreEst() {
    this.commandesCentreEst = this.commandes.filter(
      (commande: any) => commande.region === 'Centre-Est'
    );
    this.commandesCentreEst.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // on affecte les commandes qui on la region centre-Ouest dans la liste commandesCentreOuest
  setCommandesCentreOuest() {
    this.commandesCentreOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Centre-Ouest'
    );
    this.commandesCentreOuest.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // on affecte les commandes qui on la region sud-Est dans la liste commandesSudEst
  setCommandesSudEst() {
    this.commandesSudEst = this.commandes.filter(
      (commande: any) => commande.region === 'Sud-Est'
    );
    this.commandesSudEst.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // on affecte les commandes qui on la region Sud-Ouest dans la liste commandesSudOuest
  setCommandesSudOuest() {
    this.commandesSudOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Sud-Ouest'
    );
    this.commandesSudOuest.sort((a: any, b: any) =>
      a.dateCreation > b.dateCreation ? 1 : -1
    );
  }
  // calculer le poids des commandes dans une region
  calculerPoidsCommandesParRegion(commandesParRegion: any) {
    let poidsTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        poidsTotal += commande.poids;
      });
    }
    return Number(poidsTotal.toFixed(4));
  }
  // calculer le volume des commandes dans uneregion
  calculerVolumeCommandeParRegion(commandesParRegion: any) {
    let volumeTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        volumeTotal += commande.volume;
      });
    }
    return Number(volumeTotal.toFixed(4));
  }
  // calculer le score des commandes dans une region
  calculerScoreCommandeParRegion(commandesParRegion: any) {
    let scoreRegionsTotal = this.calculerScoreTotal();
    let scoreRegion = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        scoreRegion += commande.score;
      });
    }
    let pourcentageScoreRegion = (100 / scoreRegionsTotal) * scoreRegion;
    return Number(pourcentageScoreRegion.toFixed(2));
  }
  // calculer le score des commandes total
  calculerScoreTotal() {
    let scoreTotal = 0;
    this.commandes.forEach((commande: any) => {
      scoreTotal += commande.score;
    });
    return Number(scoreTotal.toFixed(4));
  }
  // permet de calculer le pourcentage score d'une commande par rapport au score total de la region
  convertirScoreEnPourcentageParRapportScoreTotal(scoreCommande: any) {
    let scoreTotal = this.calculerScoreTotal();
    let pourcentageScore = (100 / scoreTotal) * scoreCommande;
    return Number(pourcentageScore.toFixed(3));
  }
  // calculer le poids des commandes selectionnées et affectées dans un mission
  calculerPoidsMission() {
    let poidsTotal = 0;
    this.mission.forEach((commande: any) => {
      poidsTotal += commande.poids;
    });
    return Number(poidsTotal.toFixed(4));
  }
  // calculer le volume des commandes selectionnées et affectées dans un mission
  calculerVolumeMission() {
    let volumeTotal = 0;
    this.mission.forEach((commande: any) => {
      volumeTotal += commande.volume;
    });
    return Number(volumeTotal.toFixed(4));
  }
  // calculer le score des commandes selectionnées et affectées dans un mission
  calculerScoreMission() {
    let scoreTotal = 0;
    this.mission.forEach((commande: any) => {
      scoreTotal += commande.score;
    });
    return Number(scoreTotal.toFixed(3));
  }
  // calculer pourcentage d'une commande par rapport au score total du mission
  convertirScoreEnPourcentageParRapportMission(scoreCommande: any) {
    let scoreMission = this.calculerScoreMission();
    let pourcentageScore = (100 / scoreMission) * scoreCommande;
    return Number(pourcentageScore.toFixed(3));
  }
  // utilisé dans les boutons des commandes
  // si on selectionne une commande on l'ajoute a la lite des commandes dans une mission et on la supprime de la lise des commande par region
  ajouterCommandeDansMission(i: number, commandesParRegion: any) {
    this.mission.push(commandesParRegion.splice(i, 1)[0]);
    this.disableCheckBoxsVehiculePoidsVolumeInferieur();
  }
  // si on clique sur les boutons selectionner-tous on ajoute toutes les commandes dans la region qui contient se bouton dans
  // la liste des commandes dans mission et on vide la liste des commandes par cette region
  ajouterToutesCommandesParRegionDansMission(commandesParRegion: any) {
    Array.prototype.push.apply(
      this.mission,
      commandesParRegion.splice(0, commandesParRegion.length)
    );
    this.disableCheckBoxsVehiculePoidsVolumeInferieur();
  }

  //si on clique sur le bouton enlever-commande en supprime la commande qu'on désire l'enlever de la liste des commandes par mission "mission"
  //et on la rajoute dans la liste des commandes dans la region compatible
  annulerAjoutCommandeDansMission(i: number) {
    switch (this.mission[i].region) {
      case 'Nord-Est':
        this.commandesNordEst.push(this.mission.splice(i, 1)[0]);
        this.commandesNordEst.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;
      case 'Nord-Ouest':
        this.commandesNordOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesNordOuest.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;
      case 'Centre-Est':
        this.commandesCentreEst.push(this.mission.splice(i, 1)[0]);
        this.commandesCentreEst.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;
      case 'Centre-Ouest':
        this.commandesCentreOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesCentreOuest.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;
      case 'Sud-Est':
        this.commandesSudEst.push(this.mission.splice(i, 1)[0]);
        this.commandesSudEst.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;
      case 'Sud-Est':
        this.commandesSudOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesSudOuest.sort((a: any, b: any) =>
          a.dateCreation > b.dateCreation ? 1 : -1
        );
        break;

      default:
        break;
    }
    this.disableCheckBoxsVehiculePoidsVolumeInferieur();
    this.mission.length === 0 ? this.disableChaeckBoxTouteVehicules() : '';
  }

  // si on clique le bouton enlever-tous-commandes en supprime toutes les commandes de la liste des commandes par mission "mission"
  //et on les rajoutes dans la liste des commandes dans les regions compatibles
  annulerAjoutTousCommandeDansMission() {
    for (let i = 0; i < this.mission.length; i++) {
      switch (this.mission[i].region) {
        case 'Nord-Est':
          this.commandesNordEst.push(this.mission[i]);
          this.commandesNordEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Nord-Ouest':
          this.commandesNordOuest.push(this.mission[i]);
          this.commandesNordOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Centre-Est':
          this.commandesCentreEst.push(this.mission[i]);
          this.commandesCentreEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Centre-Ouest':
          this.commandesCentreOuest.push(this.mission[i]);
          this.commandesCentreOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Sud-Est':
          this.commandesSudEst.push(this.mission[i]);
          this.commandesSudEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Sud-Est':
          this.commandesSudOuest.push(this.mission[i]);
          this.commandesSudOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;

        default:
          break;
      }
    }
    this.mission = [];
    this.disableCheckBoxsVehiculePoidsVolumeInferieur();
    this.disableChaeckBoxTouteVehicules();
  }

  // disable toute les checkBoxs des vehicules
  disableChaeckBoxTouteVehicules() {
    this.checkBoxVehicules.forEach((checkBox) => {
      checkBox.disable = true;
    });
    this.checkBoxVehiculesLoues.forEach((checkBox) => {
      checkBox.disable = true;
    });
  }

  // si on clique sur le bouton ajouter-mission on ajoute cette mission a la liste de la file d'attente
  async ajouterMissionFileAttente() {
    let vehicules: any = [];
    let chauffeurs: any = [];
    var vehiculesLoues = [...this.vehiculesSelectionnes];
    let volumeMission: any = [];
    let poidsMission: any = [];
    let commandesAffectees: any = [];
    let mission = [];
    for (let i = 0; i < this.mission.length; i++) {
      const mis = this.mission[i];
      let ids = mis.id.split('/');
      for (let j = 0; j < ids.length; j++) {
        mission.push(
          await this.serviceMission.commande(Number(ids[j])).toPromise()
        );
      }
    }
    // ouvrir boite dialogue d'affectation chauffeur
    let dialogRef;
    // si on selectionne multi vehicules oubin le nombre de voyages > 1 on ouvre la boite dialogue affectar multi chauffeur
    // sinon on ouvre la boite dialogue affecter chauffeur simple
    if (
      this.formVehicule.get('multiVehicule').value ||
      this.formVehicule.get('nombreVoyages').value > 1
    ) {
      dialogRef = this.dialog.open(AffecterMultiChauffeur, {
        width: '2000px',
        minHeight: '500px',
        panelClass: 'affecter-commandes',
        data: {
          vehiculesPrives: this.vehiculesPriveSelectionnes,
          vehiculesLoues: this.vehiculesLoueSelectionnes,
          mission: mission,
          nombreVoyages: this.formVehicule.get('nombreVoyages').value,
        },
        autoFocus: false,
      });
    } else {
      dialogRef = this.dialog.open(AffecterChauffeur, {
        width: '1500px',
        minHeight: '500px',
        panelClass: 'affecter-chauffeur',
        data: {
          vehiculesPrives: this.vehiculesPriveSelectionnes,
          vehiculesLoues: this.vehiculesLoueSelectionnes,
          mission: mission,
        },
        autoFocus: false,
      });
    }
    // aprés la fermeture des des boites dialogues on ajoutes les mission dans la file d'attente
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.result.forEach((element: any) => {
          vehicules.push(element.vehicule);
          chauffeurs.push(element.chauffeur);
          commandesAffectees.push(element.commandes);
          let volumeTotal = 0;
          let poidsTotal = 0;
          element.commandes.forEach((commande: any) => {
            commande.colis.forEach((colis: any) => {
              volumeTotal += colis.volume;
              poidsTotal += colis.poidsBrut;
            });
          });
          volumeMission.push(Number(volumeTotal.toFixed(4)));
          poidsMission.push(Number(poidsTotal.toFixed(4)));
        });
        this.fileAttente.push({
          commandes: this.mission,
          commandesAffectees: commandesAffectees,
          vehicule: vehicules,
          chauffeur: chauffeurs,
          score: this.calculerScoreMission(),
          volume: volumeMission,
          poids: poidsMission,
        });
        this.mission = [];
        this.checkBoxVehicules.forEach((checkBox) => {
          checkBox.value = false;
        });
        this.checkBoxVehiculesLoues.forEach((checkBox) => {
          checkBox.value = false;
        });
        this.vehiculesSelectionnes = [];
        this.vehiculesPriveSelectionnes = [];
        this.vehiculesLoueSelectionnes = [];
        this.formVehicule.get('multiVehicule').setValue(false);
        this.disableCheckBoxsVehiculePoidsVolumeInferieur();
        this.disableChaeckBoxTouteVehicules();
        // si la file d'attente s'agit d'une nouvelle file d'attente on l'ajoute sinon on modifie la valeur de la file d'attente existante
        let dateFileAttente = new Date(
          this.formDate.get('date').value.getTime()
        );
        let fileAttente = this.listeFilesAttentes.filter(
          (f: any) => f.date.getTime() === dateFileAttente.getTime()
        );
        let copieFileAttente: any = [];
        this.fileAttente.forEach((mission: any) => {
          copieFileAttente.push({
            commandes: [...mission.commandes],
            commandesAffectees: [...mission.commandesAffectees],
            vehicule: [...mission.vehicule],
            chauffeur: [...mission.chauffeur],
            score: mission.score,
            volume: mission.volume,
            poids: mission.poids,
          });
        });
        if (fileAttente.length === 0) {
          this.listeFilesAttentes.push({
            date: dateFileAttente,
            fileAttente: copieFileAttente,
          });
        } else {
          let index = this.listeFilesAttentes.findIndex(
            (f: any) => f.date.getTime() === dateFileAttente.getTime()
          );
          this.listeFilesAttentes[index].fileAttente = copieFileAttente;
        }
      }
    });
  }
  //calculer le volume de chaque vehicul dans une misssion
  calculerVolumeVehicule(vehicule: any) {
    let volume =
      vehicule.longueur * vehicule.largeur * vehicule.hauteur * 0.000001;
    return Number(volume.toFixed(4));
  }

  //si on clique sur le bouton enlever-mission en supprime la mission qu'on désire l'enlever de la file d'attente
  //et on rajoute ses commandes dans la liste des commandes dans la region compatible
  annulerAjoutMissionDansFileAttente(i: number) {
    this.fileAttente[i].commandes.forEach((commande: any) => {
      switch (commande.region) {
        case 'Nord-Est':
          this.commandesNordEst.push(commande);
          this.commandesNordEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Nord-Ouest':
          this.commandesNordOuest.push(commande);
          this.commandesNordOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Centre-Est':
          this.commandesCentreEst.push(commande);
          this.commandesCentreEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Centre-Ouest':
          this.commandesCentreOuest.push(commande);
          this.commandesCentreOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Sud-Est':
          this.commandesSudEst.push(commande);
          this.commandesSudEst.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;
        case 'Sud-Est':
          this.commandesSudOuest.push(commande);
          this.commandesSudOuest.sort((a: any, b: any) =>
            a.dateCreation > b.dateCreation ? 1 : -1
          );
          break;

        default:
          break;
      }
      this.disableCheckBoxsVehiculePoidsVolumeInferieur();
    });
    this.fileAttente.splice(i, 1);
    let index = this.listeFilesAttentes.findIndex(
      (f: any) => f.date.getTime() === this.formDate.get('date').value.getTime()
    );
    this.listeFilesAttentes[index].fileAttente.splice(i, 1);
  }

  // si on clique le bouton enlever-tous-missions en supprime toutes les missions de la file d'attente
  //et on rajoute ses commandes dans la liste des commandes dans les regions compatibles
  annulerAjoutTousMissionsDansFileAttente() {
    this.fileAttente.forEach((mission: any) => {
      mission.commandes.forEach((commande: any) => {
        switch (commande.region) {
          case 'Nord-Est':
            this.commandesNordEst.push(commande);
            this.commandesNordEst.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;
          case 'Nord-Ouest':
            this.commandesNordOuest.push(commande);
            this.commandesNordOuest.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;
          case 'Centre-Est':
            this.commandesCentreEst.push(commande);
            this.commandesCentreEst.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;
          case 'Centre-Ouest':
            this.commandesCentreOuest.push(commande);
            this.commandesCentreOuest.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;
          case 'Sud-Est':
            this.commandesSudEst.push(commande);
            this.commandesSudEst.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;
          case 'Sud-Est':
            this.commandesSudOuest.push(commande);
            this.commandesSudOuest.sort((a: any, b: any) =>
              a.dateCreation > b.dateCreation ? 1 : -1
            );
            break;

          default:
            break;
        }
        this.disableCheckBoxsVehiculePoidsVolumeInferieur();
      });
    });
    this.fileAttente = [];
    let index = this.listeFilesAttentes.findIndex(
      (f: any) => f.date.getTime() === this.formDate.get('date').value.getTime()
    );
    this.listeFilesAttentes.splice(index, 1);
  }

  get fileAttenteEstVide() {
    return this.fileAttente.length <= 0;
  }

  // calculer le score des missions dans une file d'attente
  calculerScoreFileAttente() {
    let scoreTotal = 0;
    let index = this.listeFilesAttentes.findIndex(
      (f: any) => f.date.getTime() === this.formDate.get('date').value.getTime()
    );
    this.fileAttente.forEach((mission: any) => {
      scoreTotal += mission.score;
    });
    return Number(scoreTotal.toFixed(3));
  }
  // calculer pourcentage d'une commande par rapport au score total du mission
  convertirScoreEnPourcentageParRapportFileAttente(scoreMission: any) {
    let scoreFileAttente = this.calculerScoreFileAttente();
    let pourcentageScore = (100 / scoreFileAttente) * scoreMission;
    return Number(pourcentageScore.toFixed(3));
  }

  // retourne la position de destination d'une commande
  async getPosition(idPosition: any) {
    let position = await this.serviceMission
      .getPositionById(idPosition)
      .toPromise();
    return position;
  }

  // calculer la distance entre deux points
  getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) {
    var R = 6371; // Rayon de la terre en km
    var dLat = this.deg2rad(lat2 - lat1);
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance en km
    return d;
  }

  deg2rad(deg: any) {
    //changement du deg vers rad
    return deg * (Math.PI / 180);
  }

  // avoir la position de début depuis le navigateur
  chercherMoi() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentLat = position.coords.latitude;
        this.currentLong = position.coords.longitude;
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  // enregistrement des missions
  async enregistrer() {
    if (!this.boutonEnregistrerEstActive) return;
    this.boutonEnregistrerEstActive = false;
    let derniereMission = await this.serviceMission
      .derniereMission()
      .toPromise();
    let idMissionLiees = '';
    for (let i = 0; i < this.listeFilesAttentes.length; i++) {
      for (let j = 0; j < this.listeFilesAttentes[i].fileAttente.length; j++) {
        for (
          let k = 0;
          k < this.listeFilesAttentes[i].fileAttente[j].vehicule.length;
          k++
        ) {
          derniereMission !== null
            ? (idMissionLiees += derniereMission.id + k + 1 + '/')
            : (idMissionLiees += k + 1 + '/');
        }
        idMissionLiees = idMissionLiees.slice(0, -1);
        for (
          let k = 0;
          k < this.listeFilesAttentes[i].fileAttente[j].vehicule.length;
          k++
        ) {
          let mission = this.listeFilesAttentes[i].fileAttente[j];
          let formData = new FormData();
          let idChauffeur = mission.chauffeur[k].id_Employe;
          let nomChauffeur = mission.chauffeur[k].nom;
          let telephoneChauffeur = mission.chauffeur[k].tel;
          let matriculeVehicule = mission.vehicule[k].matricule;
          let idCommandes = '';
          let typeVehicule = '';
          mission.vehicule[k].id_Vehicule_Loue === undefined
            ? (typeVehicule = 'prive')
            : (typeVehicule = 'loue');
          let commandes: any = [];
          let positions: any = [];
          for (let l = 0; l < mission.commandesAffectees[k].length; l++) {
            const commande = mission.commandesAffectees[k][l];
            commandes.push(commande.commande);
            positions.push(
              await this.getPosition(commande.commande.idPosition)
            );
          }

          let commandeOrdonnees: any = [];
          let destinationsOptimise: any = [];
          var origine = {
            latitude: this.currentLat,
            longitude: this.currentLong,
          };
          while (positions.length > 0) {
            var des;
            var distance = 6371;
            var indice = 0;
            for (let i = 0; i < positions.length; i++) {
              var x;
              destinationsOptimise.length === 0
                ? (x = origine)
                : (x = destinationsOptimise[destinationsOptimise.length - 1]);
              var lat1 = Number(x.latitude);
              var long1 = Number(x.longitude);
              var y = positions[i];
              var lat2 = Number(y.latitude);
              var long2 = Number(y.longitude);
              if (
                this.getDistanceFromLatLonInKm(lat1, long1, lat2, long2) <
                distance
              ) {
                distance = this.getDistanceFromLatLonInKm(
                  lat1,
                  long1,
                  lat2,
                  long2
                );
                des = positions[i];
                indice = i;
              }
            }
            commandeOrdonnees.push(commandes[indice]);
            destinationsOptimise.push(des);
            commandes.splice(indice, 1);
            positions.splice(indice, 1);
          }
          for (let i = 0; i < destinationsOptimise.length; i++) {
            idCommandes += commandeOrdonnees[i].id + '/';
          }
          idCommandes = idCommandes.slice(0, -1);
          formData.append('idChauffeur', idChauffeur);
          formData.append('nomChauffeur', nomChauffeur);
          formData.append('telephoneChauffeur', telephoneChauffeur);
          formData.append('matricule', matriculeVehicule);
          formData.append('idCommandes', idCommandes);
          formData.append('volume', mission.volume[k]);
          formData.append('poids', mission.poids[k]);
          formData.append('score', mission.score);
          formData.append('region', '');
          formData.append('etat', 'En attente');
          formData.append('date', this.listeFilesAttentes[i].date);
          formData.append('idMissionsLiees', idMissionLiees);
          formData.append('typeVehicule', typeVehicule);
          let newMission = await this.serviceMission
            .creerMission(formData)
            .toPromise();

          for (let l = 0; l < mission.commandesAffectees[k].length; l++) {
            const colis = mission.commandesAffectees[k][l].colis;
            const commande = mission.commandesAffectees[k][l].commande;
            for (let m = 0; m < colis.length; m++) {
              const col = colis[m];
              let listeColisage: any = new FormData();
              listeColisage.append('idMission', newMission.id);
              listeColisage.append('idCommande', col.idCommande);
              listeColisage.append('idEmballage', col.idEmballage);
              listeColisage.append('emballage', col.emballage);
              listeColisage.append('idProduit', col.idProduit);
              listeColisage.append('produit', col.produit);
              listeColisage.append('quantite', col.quantite);
              listeColisage.append(
                'quantiteDansEmballage',
                col.quantiteDansEmballage
              );
              listeColisage.append('nombrePack', col.nombrePack);
              listeColisage.append('dimensions', col.dimensions);
              listeColisage.append('volume', col.volume);
              listeColisage.append('poidsNet', col.poidsNet);
              listeColisage.append('poidsBrut', col.poidsBrut);
              await this.serviceMission
                .creerListeColisMission(listeColisage)
                .toPromise();
            }
            let formDataCommande = new FormData();
            formDataCommande.append('id', commande.id);
            formDataCommande.append('etat', 'Affectée');
            formDataCommande.append('idMission', newMission.id);
            await this.serviceCommande
              .affecterCommande(formDataCommande)
              .toPromise();
          }
        }
      }
    }
    this.listeFilesAttentes = [];
    this.fileAttente = [];
    Swal.fire({
      icon: 'success',
      title: 'Missions enregistées avec succés!',
      showConfirmButton: false,
      timer: 1500,
    });
    this.boutonEnregistrerEstActive = true;
  }
}

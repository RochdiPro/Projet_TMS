import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommandeService } from 'src/app/colisage/commande/services/commande.service';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';
import { VehiculeService } from '../../vehicule/services/vehicule.service';
import { AffecterChauffeur } from '../dialogs/dialogs.component';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-ajout-mission',
  templateUrl: './ajout-mission.component.html',
  styleUrls: ['./ajout-mission.component.scss'],
})
export class AjoutMissionComponent implements OnInit {
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
  commandesNonAffecteSelectionne: String[];
  listeFactures: any;
  listeBLs: any;
  client: any;
  commandes: any;
  listeCommandes: Object[] = [];
  commandesNordEst: any = [];
  commandesNordOuest: any = [];
  commandesCentreEst: any = [];
  commandesCentreOuest: any = [];
  commandesSudEst: any = [];
  commandesSudOuest: any = [];
  formVehicule: FormGroup; //from des controles utilisées pour choisir une vehicule
  formDate: FormGroup; //from des controles utilisées pour choisir la date du mission
  listeVehiculesAffiches: any = [];
  listeVehiculesLoues: any;
  mission: any[] = [];
  checkBoxVehicules: any[] = [];
  checkBoxVehiculesLoues: any[] = [];
  vehiculesSelectionnes: any[] = [];
  vehiculeEstSelectionne = false;
  vehiculesPriveSelectionnes: any = [];
  vehiculesLoueSelectionnes: any = [];
  copieVehiculesPrive: any = [];
  fileAttente: any = [];
  vehiculesMemeCategorieSelectionne: any = [];
  minDate = new Date(); //utilisé pour la desactivation des dates passées dans le datePicker
  aujoudhui: Date = new Date(); //date d'aujourd'hui
  listeFilesAttentes: any = []; //contient la liste des files d'attente crée

  constructor(
    private fb: FormBuilder,
    private serviceMission: MissionsService,
    private serviceVehicule: VehiculeService,
    private dialog: MatDialog,
    private serviceChauffeur: ChauffeurService,
    private serviceCommande: CommandeService
  ) {}

  async ngOnInit() {
    this.creerForm();
    await this.getListeCommande();
    this.affecterCommandeAuRegion();
    this.setCommandesNordEst();
    this.setCommandesNordOuest();
    this.setCommandesCentreEst();
    this.setCommandesCentreOuest();
    this.setCommandesSudEst();
    this.setCommandesSudOuest();
    await this.getVehiculesChauffeurs();
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
      console.log(fileAttente);
      this.fileAttente = fileAttente.fileAttente;
    }
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehicules
  async creerCheckBoxsVehicules() {
    this.listeVehiculesAffiches.forEach(() => {
      this.checkBoxVehicules.push({ value: false, diasable: false });
    });
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehiculesLoues
  async creerCheckBoxsVehiculesLoues() {
    this.listeVehiculesLoues.forEach(() => {
      this.checkBoxVehiculesLoues.push({ value: false, diasable: false });
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
        }
        break;

      case 'loue':
        if (this.checkBoxVehiculesLoues[i].value) {
          this.selectionnerVehiculeLoue(vehicule);
        } else {
          this.deselectionnerVehiculeloue(vehicule);
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
    this.testerPossibiliteAffectationChauffeur(
      vehicule,
      this.listeVehiculesAffiches
    );
  }

  // supprimer vehicule privé de la liste vehiculesSelectionne
  deselectionnerVehiculePrive(vehicule: any) {
    let index = this.vehiculesSelectionnes.findIndex(
      (v) => v.id === vehicule.id
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
    this.vehiculesSelectionnes.push(vehicule);
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
      (v) => v.id_Vehicule_Loue === vehicule.id_Vehicule_Loue
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
      this.disableCheckBoxsVehiculePoidsVolumeInferieur();
    }
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
    this.commandes = await this.serviceMission
      .getCommandesParEtat('En cours de traitement')
      .toPromise();
  }

  // get tous les vehicules avec l'état disponible
  async getVehiculeDisponibles() {
    let listeVehicules = await this.serviceVehicule
      .filtrerVehicule('etat_vehicule', 'Disponible')
      .toPromise();
    return listeVehicules;
  }

  // get la liste des vehicules loués
  async getVehiculeLoueDisponibles() {
    this.listeVehiculesLoues = await this.serviceVehicule
      .filtrerVehiculeLoues('etat_vehicule', 'Disponible')
      .toPromise();
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
    let listeVehicules = await this.getVehiculeDisponibles();
    let listeChauffeurs = await this.getChauffeurs();
    listeVehicules.forEach((vehicule: any) => {
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
  }

  // tester si on selectionne une vehicule qui a un chauffeur qu'on ne peut pas l'utiliser aprés la selection de cette vehicule
  testerPossibiliteAffectationChauffeur(
    vehicule: any,
    listeVehiculePrive: any
  ) {
    this.copieVehiculesPrive = [];
    for (let i = 0; i < listeVehiculePrive.length; i++) {
      this.copieVehiculesPrive.push({
        vehicule: listeVehiculePrive[i].vehicule,
        chauffeurs: [...listeVehiculePrive[i].chauffeurs],
      });
    }
    if (vehicule.chauffeurs.length === 1) {
      // chercher l'index du vehicule selectionné dans la liste des vehicules privés
      let index = this.copieVehiculesPrive.findIndex(
        (v: any) => v.vehicule.id === vehicule.vehicule.id
      );
      console.log(index);
      // pour chaque vehicule si il s'agit d'un vehicule different du vehicule selectionné en supprime le chauffeur du vehicule
      // selectionné de la liste des chauffeurs de cet vehicule
      for (let i = 0; i < this.copieVehiculesPrive.length; i++) {
        if (i !== index) {
          for (
            let j = 0;
            j < this.copieVehiculesPrive[i].chauffeurs.length;
            j++
          ) {
            if (
              this.copieVehiculesPrive[i].chauffeurs[j] ===
              vehicule.chauffeurs[0]
            ) {
              // enlever le chauffeur de la liste des vehicules non selectionnées
              // let index = this.vehiculesPriveAvecChauffeurSupprime.findIndex(
              //   (v: any) => copieVehiculesPrive[i].vehicule === v.vehicule
              // );
              // if (index >= 0) {
              //   console.log(true)
              //   this.vehiculesPriveAvecChauffeurSupprime[index].chauffeurs.push(
              //     copieVehiculesPrive[i].chauffeurs.splice(j, 1)
              //   );
              // } else {
              //   this.vehiculesPriveAvecChauffeurSupprime.push(
              //     copieVehiculesPrive[i]
              //   );
              // }
              this.copieVehiculesPrive[i].chauffeurs.splice(j, 1);
              console.log(this.copieVehiculesPrive);
              console.log(this.listeVehiculesAffiches);
            }
          }
        }
      }
    } else {
      this.vehiculesPriveSelectionnes.forEach((v: any) => {
        if (vehicule.chauffeurs === v.chauffeurs) {
          this.vehiculesMemeCategorieSelectionne.push(v);
          if (
            this.vehiculesMemeCategorieSelectionne.length >=
            vehicule.chauffeurs.length
          ) {
            vehicule.chauffeurs.forEach((chauffeur: any) => {
              this.copieVehiculesPrive.forEach((ve: any) => {
                if (
                  (this.vehiculesMemeCategorieSelectionne.filter(
                    (v: any) => v.vehicule.id === ve.vehicule.id
                  ).length = 0)
                ) {
                  console.log(ve.chauffeurs);
                  let k = ve.chauffeurs.findIndex(
                    (ch: any) => ch.id_Employe === chauffeur.id_Employe
                  );
                  if (k > -1) {
                    ve.chauffeurs.splice(k, 1);
                  }
                }
              });
            });
          }
        }
      });
    }
    this.disableVehiculePrive(this.copieVehiculesPrive);
  }

  // disable le checkBpx des vehicules privés qu'on ne peut pas affecter leurs chauffeurs qui peuvent la conduire
  disableVehiculePrive(copieVehiculesPrive: any) {
    for (let i = 0; i < copieVehiculesPrive.length; i++) {
      if (copieVehiculesPrive[i].chauffeurs.length === 0) {
        this.checkBoxVehicules[i].disable = true;
      }
    }
  }

  // rajouter le chauffeur du vehicule deselectionné dans las vehicules convenables
  rajouterChauffeurAuVehicule(vehicule: any) {
    vehicule.chauffeurs.forEach((ch: object) => {
      for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
        if (
          vehicule.vehicule !== this.listeVehiculesAffiches[i].vehicule &&
          this.listeVehiculesAffiches[i].chauffeurs.includes(ch)
        ) {
          this.copieVehiculesPrive[i].chauffeurs.push(ch);
        }
      }
      console.log(this.copieVehiculesPrive);
    });
    // this.vehiculesPriveAvecChauffeurSupprime = []
  }

  // disable checkbox vehicule si le poids ou le volume est inverieur au poids ou volume de la liste des commandes selectionnées
  disableCheckBoxsVehiculePoidsVolumeInferieur() {
    if (!this.formVehicule.get('multiVehicule').value) {
      for (let i = 0; i < this.listeVehiculesAffiches.length; i++) {
        let volume =
          this.listeVehiculesAffiches[i].vehicule.longueur *
          this.listeVehiculesAffiches[i].vehicule.largeur *
          this.listeVehiculesAffiches[i].vehicule.hauteur;
        if (
          this.listeVehiculesAffiches[i].vehicule.charge_utile <=
            this.calculerPoidsMission() ||
          volume <= this.calculerVolumeMission()
        ) {
          this.checkBoxVehicules[i].disable = true;
        } else {
          this.checkBoxVehicules[i].disable = false;
        }
      }
      for (let i = 0; i < this.listeVehiculesLoues.length; i++) {
        let volume =
          this.listeVehiculesLoues[i].longueur *
          this.listeVehiculesLoues[i].largeur *
          this.listeVehiculesLoues[i].hauteur;
        if (
          this.listeVehiculesLoues[i].charge_utile <=
            this.calculerPoidsMission() ||
          volume <= this.calculerVolumeMission()
        ) {
          this.checkBoxVehiculesLoues[i].disable = true;
        } else {
          this.checkBoxVehiculesLoues[i].disable = false;
        }
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
    let scoreTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        scoreTotal += commande.score;
      });
    }
    return Number(scoreTotal.toFixed(4));
  }
  // permet de calculer le pourcentage score d'une commande par rapport au score total de la region
  convertirScoreEnPourcentageParRapportScoreRegion(
    scoreCommande: any,
    commandesParRegion: any
  ) {
    let scoreRegion = this.calculerScoreCommandeParRegion(commandesParRegion);
    let pourcentageScore = (100 / scoreRegion) * scoreCommande;
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
  }
  // si on clique sur le bouton ajouter-mission on ajoute cette mission a la liste de la file d'attente
  async ajouterMissionFileAttente() {
    let vehicules: any = [];
    let chauffeurs: any = [];
    var vehiculesLoues = [...this.vehiculesSelectionnes];
    console.log(this.vehiculesSelectionnes);
    // ouvrir boite dialogue affecter-chauffeur
    const dialogRef = this.dialog.open(AffecterChauffeur, {
      width: '400px',
      data: {
        vehiculesPrives: this.vehiculesPriveSelectionnes,
        vehiculesLoues: this.vehiculesLoueSelectionnes,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.prive.forEach((element: any) => {
          vehicules.push(element.vehicule);
          chauffeurs.push(element.chauffeur);
        });
        result.loue.forEach((element: any) => {
          vehicules.push(element.vehicule);
          chauffeurs.push({ nom: element.chauffeur });
        });
        this.fileAttente.push({
          commandes: this.mission,
          vehicule: vehicules,
          chauffeur: chauffeurs,
          score: this.calculerScoreMission(),
          volume: this.calculerVolumeMission(),
          poids: this.calculerPoidsMission(),
        });
        console.log(this.fileAttente);
        this.mission = [];
        console.log(vehiculesLoues);
        console.log(this.vehiculesSelectionnes);

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
        // si la file d'attente s'agit d'une nouvelle file d'attente on l'ajoute sinon on modifie la valeur de la file d'attente existante
        let dateFileAttente = new Date(
          this.formDate.get('date').value.getTime()
        );
        console.log(typeof dateFileAttente);
        let fileAttente = this.listeFilesAttentes.filter(
          (f: any) => f.date.getTime() === dateFileAttente.getTime()
        );
        console.log(this.fileAttente);
        let copieFileAttente: any = [];
        this.fileAttente.forEach((mission: any) => {
          copieFileAttente.push({
            commandes: [...mission.commandes],
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
          console.log(index);
          this.listeFilesAttentes[index].fileAttente = copieFileAttente;
        }
        console.log(this.listeFilesAttentes);
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
    console.log(this.listeFilesAttentes);
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
    console.log(this.listeFilesAttentes);
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

  // enregistrement des missions
  async enregistrer() {
    console.log(this.listeFilesAttentes);
    for (let i = 0; i < this.listeFilesAttentes.length; i++) {
      for (let j = 0; j < this.listeFilesAttentes[i].fileAttente.length; j++) {
        let mission = this.listeFilesAttentes[i].fileAttente[j];
        let formData = new FormData();
        let idChauffeur = '';
        let nomChauffeur = '';
        let matriculeVehicule = '';
        let idCommandes = '';
        mission.chauffeur.forEach((chauffeur: any) => {
          chauffeur.id_Employe === undefined
            ? (idChauffeur += null + '/')
            : (idChauffeur += chauffeur.id_Employe + '/');
          nomChauffeur += chauffeur.nom + '/';
        });
        mission.vehicule.forEach((vehicule: any) => {
          matriculeVehicule += vehicule.matricule + '/';
        });
        mission.commandes.forEach((commande: any) => {
          idCommandes += commande.id + '/';
        });
        idChauffeur = idChauffeur.slice(0, -1);
        nomChauffeur = nomChauffeur.slice(0, -1);
        matriculeVehicule = matriculeVehicule.slice(0, -1);
        idCommandes = idCommandes.slice(0, -1);
        formData.append('idChauffeur', idChauffeur);
        formData.append('nomChauffeur', nomChauffeur);
        formData.append('matricule', matriculeVehicule);
        formData.append('idCommandes', idCommandes);
        formData.append('volume', mission.volume);
        formData.append('poids', mission.poids);
        formData.append('score', mission.score);
        formData.append('region', '');
        formData.append('etat', 'Accordée');
        formData.append('date', this.listeFilesAttentes[i].date);
        console.log(formData.get('date'));
        await this.serviceMission.creerMission(formData).toPromise();
        for (let i = 0; i < mission.commandes.length; i++) {
          let formDataCommande = new FormData();
          formDataCommande.append('id', mission.commandes[i].id);
          formDataCommande.append('etat', 'Affectée');
          await this.serviceCommande
            .modifierEtatCommande(formDataCommande)
            .toPromise();
        }
      }
    }
    this.listeFilesAttentes = [];
    this.fileAttente = [];
  }
}

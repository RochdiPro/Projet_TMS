import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  form: FormGroup;
  listeVehicules: any;
  listeVehiculesLoues: any;
  mission: any[] = [];
  checkBoxVehicules: any[] = [];
  checkBoxVehiculesLoues: any[] = [];
  vehiculesSelectionnes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceMission: MissionsService,
    private serviceVehicule: VehiculeService,
    private datepipe: DatePipe,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.creerForm();
    await this.getListeCommande();
    this.preparerListeCommande();
    this.getCommandesNordEst();
    this.getCommandesNordOuest();
    this.getCommandesCentreEst();
    this.getCommandesCentreOuest();
    this.getCommandesSudEst();
    this.getCommandesSudOuest();
    await this.getVehiculeDisponibles();
    await this.getVehiculeLoueDisponibles();
    this.creerCheckBoxsVehicules();
    this.creerCheckBoxsVehiculesLoues();
  }

  // creation des formControls
  creerForm() {
    this.form = this.fb.group({
      nombreVoyages: 1,
      multiVehicule: false,
    });
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehicules
  async creerCheckBoxsVehicules() {
    this.listeVehicules.forEach(() => {
      this.checkBoxVehicules.push({ value: false, diasable: false });
    });
  }

  // creation de la liste qui contient les valeur des ngModels du checkBoxs vehiculesLoues
  async creerCheckBoxsVehiculesLoues() {
    this.listeVehiculesLoues.forEach(() => {
      this.checkBoxVehiculesLoues.push({ value: false, diasable: false });
    });
  }

  selectionnerVehicule(i: number, type: string, vehicule: any) {
    switch (type) {
      case 'privé':
        if (this.checkBoxVehicules[i].value) {
          this.vehiculesSelectionnes.push(vehicule);
          if (!this.form.get('multiVehicule').value) {
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
        } else {
          let index = this.vehiculesSelectionnes.findIndex(v => v.id === vehicule.id);
          this.vehiculesSelectionnes.splice(index, 1);
          this.checkBoxVehicules.forEach((checkBox) => {
            checkBox.disable = false;
          });
          this.checkBoxVehiculesLoues.forEach((checkBox) => {
            checkBox.disable = false;
          });
        }
        break;

      case 'loue':
        if (this.checkBoxVehiculesLoues[i].value) {
          this.vehiculesSelectionnes.push(vehicule);
          if (!this.form.get('multiVehicule').value) {
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
        } else {
          let index = this.vehiculesSelectionnes.findIndex(v => v.id_Vehicule_Loue === vehicule.id_Vehicule_Loue);
          this.vehiculesSelectionnes.splice(index, 1);
          this.checkBoxVehicules.forEach((checkBox) => {
            checkBox.disable = false;
          });
          this.checkBoxVehiculesLoues.forEach((checkBox) => {
            checkBox.disable = false;
          });
        }
        break;

      default:
        break;
    }
  }

  // fonction qui s'execute on changeant l'etat du checkbox multiVehicules
  clickerMultiVehiculesCheckBox(){
    if (this.form.get("multiVehicule").value) {
      this.checkBoxVehicules.forEach((checkBox) => {
        checkBox.disable = false;
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        checkBox.disable = false;
      });
    } else {
      this.checkBoxVehicules.forEach((checkBox) => {
        checkBox.value = false;
      });
      this.checkBoxVehiculesLoues.forEach((checkBox) => {
        checkBox.value = false;
      });
      this.vehiculesSelectionnes = []
    }
  }

  get chargeUtileVehicule() {
    let chargeUtile = 0
    this.vehiculesSelectionnes.forEach((vehicule) => {
      chargeUtile += vehicule.charge_utile;
    });
    chargeUtile *= this.form.get('nombreVoyages').value;
    return chargeUtile;
  }

  get volumeUtileVehicule() {
    let volumeUtile = 0
    this.vehiculesSelectionnes.forEach((vehicule) => {
      volumeUtile += (vehicule.longueur * vehicule.largeur * vehicule.hauteur);
    });
    volumeUtile *= this.form.get('nombreVoyages').value;
    // convertir de cm³ vers m³
    volumeUtile *= 0.000001;
    return Number(volumeUtile.toFixed(3));
  }

  async getListeCommande() {
    this.commandes = await this.serviceMission
      .getCommandesParEtat('En cours de traitement')
      .toPromise();
  }

  async getVehiculeDisponibles() {
    this.listeVehicules = await this.serviceVehicule
      .filtrerVehicule('etat_vehicule', 'Disponible')
      .toPromise();
  }

  async getVehiculeLoueDisponibles() {
    this.listeVehiculesLoues = await this.serviceVehicule
      .filtrerVehiculeLoues('etat_vehicule', 'Disponible')
      .toPromise();
  }

  preparerListeCommande() {
    this.commandes.forEach((commande: any) => {
      for (const reg of this.regions) {
        if (reg.ville.includes(commande.ville)) {
          commande.region = reg.nom;
        }
      }
    });
  }

  getCommandesNordEst() {
    this.commandesNordEst = this.commandes.filter(
      (commande: any) => commande.region === 'Nord-Est'
    );
    this.commandesNordEst.sort((a: any, b: any) =>
      a.score > b.score ? -1 : 1
    );
  }
  getCommandesNordOuest() {
    this.commandesNordOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Nord-Ouest'
    );
    this.commandesNordOuest.sort((a: any, b: any) =>
      a.score > b.score ? -1 : 1
    );
  }
  getCommandesCentreEst() {
    this.commandesCentreEst = this.commandes.filter(
      (commande: any) => commande.region === 'Centre-Est'
    );
    this.commandesCentreEst.sort((a: any, b: any) =>
      a.score > b.score ? -1 : 1
    );
  }
  getCommandesCentreOuest() {
    this.commandesCentreOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Centre-Ouest'
    );
    this.commandesCentreOuest.sort((a: any, b: any) =>
      a.score > b.score ? -1 : 1
    );
  }
  getCommandesSudEst() {
    this.commandesSudEst = this.commandes.filter(
      (commande: any) => commande.region === 'Sud-Est'
    );
    this.commandesSudEst.sort((a: any, b: any) => (a.score > b.score ? -1 : 1));
  }
  getCommandesSudOuest() {
    this.commandesSudOuest = this.commandes.filter(
      (commande: any) => commande.region === 'Sud-Ouest'
    );
    this.commandesSudOuest.sort((a: any, b: any) =>
      a.score > b.score ? -1 : 1
    );
  }
  calculerPoidsCommandesParRegion(commandesParRegion: any) {
    let poidsTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        poidsTotal += commande.poids;
      });
    }
    return Number(poidsTotal.toFixed(4));
  }
  calculerVolumeCommandeParRegion(commandesParRegion: any) {
    let volumeTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        volumeTotal += commande.volume;
      });
    }
    return Number(volumeTotal.toFixed(4));
  }
  calculerScoreCommandeParRegion(commandesParRegion: any) {
    let scoreTotal = 0;
    if (commandesParRegion) {
      commandesParRegion.forEach((commande: any) => {
        scoreTotal += commande.score;
      });
    }
    return Number(scoreTotal.toFixed(4));
  }
  calculerPoidsMission() {
    let poidsTotal = 0;
    this.mission.forEach((commande: any) => {
      poidsTotal += commande.poids;
    });
    return Number(poidsTotal.toFixed(4));
  }
  calculerVolumeMission() {
    let volumeTotal = 0;
    this.mission.forEach((commande: any) => {
      volumeTotal += commande.volume;
    });
    return Number(volumeTotal.toFixed(4));
  }
  ajouterCommandeDansMission(i: number, commandesParRegion: any) {
    this.mission.push(commandesParRegion.splice(i, 1)[0]);
  }
  ajouterToutesCommandesParRegionDansMission(commandesParRegion: any) {
    Array.prototype.push.apply(
      this.mission,
      commandesParRegion.splice(0, commandesParRegion.length)
    );
  }
  annulerAjoutCommandeDansMission(i: number) {
    switch (this.mission[i].region) {
      case 'Nord-Est':
        this.commandesNordEst.push(this.mission.splice(i, 1)[0]);
        this.commandesNordEst.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;
      case 'Nord-Ouest':
        this.commandesNordOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesNordOuest.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;
      case 'Centre-Est':
        this.commandesCentreEst.push(this.mission.splice(i, 1)[0]);
        this.commandesCentreEst.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;
      case 'Centre-Ouest':
        this.commandesCentreOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesCentreOuest.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;
      case 'Sud-Est':
        this.commandesSudEst.push(this.mission.splice(i, 1)[0]);
        this.commandesSudEst.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;
      case 'Sud-Est':
        this.commandesSudOuest.push(this.mission.splice(i, 1)[0]);
        this.commandesSudOuest.sort((a: any, b: any) =>
          a.score > b.score ? -1 : 1
        );
        break;

      default:
        break;
    }
  }
  annulerAjoutTousCommandeDansMission() {
    for (let i = 0; i < this.mission.length; i++) {
      switch (this.mission[i].region) {
        case 'Nord-Est':
          this.commandesNordEst.push(this.mission[i]);
          this.commandesNordEst.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;
        case 'Nord-Ouest':
          this.commandesNordOuest.push(this.mission[i]);
          this.commandesNordOuest.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;
        case 'Centre-Est':
          this.commandesCentreEst.push(this.mission[i]);
          this.commandesCentreEst.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;
        case 'Centre-Ouest':
          this.commandesCentreOuest.push(this.mission[i]);
          this.commandesCentreOuest.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;
        case 'Sud-Est':
          this.commandesSudEst.push(this.mission[i]);
          this.commandesSudEst.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;
        case 'Sud-Est':
          this.commandesSudOuest.push(this.mission[i]);
          this.commandesSudOuest.sort((a: any, b: any) =>
            a.score > b.score ? -1 : 1
          );
          break;

        default:
          break;
      }
    }
    this.mission = [];
  }

  ouvrierBoiteDialogueAffecterChauffeur() {
    const dialogRef = this.dialog.open(AffecterChauffeur,{
      width: '400px'
    })
  }
}

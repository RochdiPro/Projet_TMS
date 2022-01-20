import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { CommandeService } from 'src/app/colisage/commande/services/commande.service';
import Swal from 'sweetalert2';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';
import { MissionsService } from '../services/missions.service';

// ************************************ Boite dialogue affecter Multi chauffeur ********************************
@Component({
  selector: 'affecter-multi-chauffeur',
  templateUrl: 'affecter-multi-chauffeur.html',
  styleUrls: ['affecter-multi-chauffeur.scss'],
  animations: [
    trigger('statusDetailCommande', [
      state(
        'show',
        style({
          height: '260px',
          opacity: 1,
          overflow: 'auto',
        })
      ),
      state(
        'hide',
        style({
          overflow: 'hidden',
          opacity: 0,
          height: '40px',
        })
      ),
      transition('show <=> hide', animate('300ms')),
    ]),
  ],
})
export class AffecterMultiChauffeur implements OnInit {
  chauffeurs: any;
  //liste des vehicules prive avec leurs chauffeurs compatibles
  couplesVehiculeChauffeursPrives: any = [];
  copieVehiculeChauffeurs: any = [];
  commandeActive: Array<boolean> = [];
  vehiculeActive: Array<boolean> = [];
  vehiculesTot: any = []; //liste de toute les vehicules (prive + loue)
  listeColisTot: any; //liste de toutes les colis
  listeColis: any; //liste des colis pour une commande specifique
  copieListeColisTot: any;
  typeVehicule: any;
  vehiculeChauffeurs: any; //une vehicule avec ses chauffeurs compatibles
  listeCommandes: any = [];
  commandeSelectionne: any;
  listeColisAffiche = false; //liste colis dans commande affectée est affiché ou non
  commandeDansVehiculeSelectionne: any;
  couplesVehiculeChauffeurPrive: any = [];
  couplesVehiculeChauffeurLoue: any = [];
  indexVehiculeSelectionne = 0;

  constructor(
    private dialogRef: MatDialogRef<AffecterMultiChauffeur>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceChauffeur: ChauffeurService,
    private serviceMission: MissionsService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    await this.getListeChauffeurs();
    this.verifierCompatibiliteChauffeur();
    for (let i = 0; i < this.data.nombreVoyages; i++) {
      this.vehicules.forEach((v: any) => {
        v.vehicule.numVoyage = i + 1;
        v.vehicule.type = 'privé';
        this.vehiculesTot.push(Object.assign({}, v.vehicule));
        this.couplesVehiculeChauffeurPrive.push({
          vehicule: v.vehicule,
          chauffeur: {},
          commandes: [],
        });
      });
      this.vehiculesLoues.forEach((vehicule: any) => {
        vehicule.numVoyage = i + 1;
        vehicule.type = 'loué';
        this.vehiculesTot.push(Object.assign({}, vehicule));
        this.couplesVehiculeChauffeurLoue.push({
          vehicule: vehicule,
          chauffeur: { nom: '', tel: '' },
          commandes: [],
        });
      });
    }
    this.commandeActive[0] = true;
    this.vehiculeActive[0] = true;
    await this.chargerCommandes();
    this.choisirCommande(this.data.mission[0]);
    this.choisirVehicule(0);
  }

  // retourne type de la commande
  getTypeCommande(commande: any) {
    let type;
    commande.type === 'Facture' ? (type = 'Facture') : (type = 'BL');
    return type;
  }

  //vehicules prive
  get vehicules() {
    return this.data.vehiculesPrives;
  }

  get vehiculesLoues() {
    let vehiculeLoue: any;
    vehiculeLoue = this.data.vehiculesLoues;
    return vehiculeLoue;
  }

  // etat du div qui contient liste des colis dans voiture "show" pour afficher, "hide" pour cacher
  get statusDetailCommande() {
    return this.listeColisAffiche ? 'show' : 'hide';
  }

  // la fonction qui permet de lancer le changement d'etat
  toggleListeColis() {
    this.listeColisAffiche = !this.listeColisAffiche;
  }

  //afficher liste colis dans une commande affectée dans un vehicule
  afficherListeColis(commande: any) {
    this.commandeDansVehiculeSelectionne = commande;
    if (!this.listeColisAffiche) {
      setTimeout(() => {
        this.listeColisAffiche = true;
      }, 20);
    } else {
      this.listeColisAffiche = false;
      setTimeout(() => {
        this.commandeDansVehiculeSelectionne = commande;
      }, 310);
      setTimeout(() => {
        this.listeColisAffiche = true;
      }, 20);
    }
  }

  //fermer liste colis affectées
  boutonFermerListeColis() {
    this.toggleListeColis();
    setTimeout(() => {
      this.commandeDansVehiculeSelectionne = undefined;
    }, 310);
  }

  async getListeChauffeurs() {
    this.chauffeurs = await this.serviceChauffeur.getChauffeurs().toPromise();
  }

  changerCommandeActive(i: number) {
    this.commandeActive[i] = true;
    for (let j = 0; j < this.commandeActive.length; j++) {
      j === i ? '' : (this.commandeActive[j] = false);
    }
  }

  changerVehiculeActive(i: number) {
    this.vehiculeActive[i] = true;
    for (let j = 0; j < this.vehiculeActive.length; j++) {
      j === i ? '' : (this.vehiculeActive[j] = false);
    }
  }

  async chargerCommandes() {
    let listeColis: any = [];
    for (let i = 0; i < this.data.mission.length; i++) {
      const commande = this.data.mission[i];
      listeColis = listeColis.concat(
        await this.serviceMission
          .getListeColisParIdCommande(commande.id)
          .toPromise()
      );
    }
    this.listeColisTot = listeColis;
    this.copieListeColisTot = JSON.parse(JSON.stringify(this.listeColisTot));
  }

  choisirCommande(commande: any) {
    this.listeColis = this.listeColisTot.filter(
      (colis: any) => Number(colis.idCommande) === commande.id
    );
    this.commandeSelectionne = commande;
    let index = this.data.mission.findIndex(
      (cmd: any) => cmd.id === commande.id
    );
    this.changerCommandeActive(index);
  }

  get indexPrive() {
    let index = this.couplesVehiculeChauffeurPrive.findIndex(
      (couple: any) =>
        couple.vehicule.matricule ===
        this.vehiculesTot[this.indexVehiculeSelectionne].matricule
    );
    return index;
  }

  get indexLoue() {
    let index = this.couplesVehiculeChauffeurLoue.findIndex(
      (couple: any) =>
        couple.vehicule.matricule ===
        this.vehiculesTot[this.indexVehiculeSelectionne].matricule
    );
    return index;
  }

  choisirVehicule(i: number) {
    this.indexVehiculeSelectionne = i;
    if (this.vehiculesTot[i].type === 'privé') {
      this.typeVehicule = 'prive';
      this.vehiculeChauffeurs =
        this.couplesVehiculeChauffeursPrives[
          this.indexPrive +
            this.vehicules.length * (this.vehiculesTot[i].numVoyage - 1)
        ];
      this.listeCommandes =
        this.couplesVehiculeChauffeurPrive[
          this.indexPrive +
            this.vehicules.length * (this.vehiculesTot[i].numVoyage - 1)
        ].commandes;
    } else {
      this.typeVehicule = 'loue';
      this.listeCommandes =
        this.couplesVehiculeChauffeurLoue[
          this.indexLoue +
            this.vehiculesLoues.length * (this.vehiculesTot[i].numVoyage - 1)
        ].commandes;
    }
  }

  //si le volume ou le poids d'une commande va exceder celles du vehicule cette fonction n'aura aucun effet
  ajouterCommandeAuVehicule(col: any) {
    let volumeVehicule =
      this.vehiculesTot[this.indexVehiculeSelectionne].longueur *
      this.vehiculesTot[this.indexVehiculeSelectionne].largeur *
      this.vehiculesTot[this.indexVehiculeSelectionne].hauteur;
    if (
      this.poidsCommandes + col.poidsBrut / col.nombrePack >
        this.vehiculesTot[this.indexVehiculeSelectionne].charge_utile ||
      this.volumeCommandes + col.volume / col.nombrePack > volumeVehicule
    )
      return;
    let colis = Object.assign({}, col); //copie du colis desirée
    let commandeExiste =
      this.listeCommandes.filter(
        (commande: any) => Number(colis.idCommande) === commande.commande.id
      ).length > 0;
    if (col.nombrePack > 0) {
      if (!commandeExiste) {
        colis.nombrePack = 1;
        colis.poidsBrut = col.poidsBrut / col.nombrePack;
        colis.poidsNet = col.poidsNet / col.nombrePack;
        colis.volume = col.volume / col.nombrePack;
        col.volume -= colis.volume;
        col.poidsBrut -= colis.poidsBrut;
        col.poidsNet -= colis.poidsNet;
        col.nombrePack -= 1;
        this.listeCommandes.push({
          commande: this.commandeSelectionne,
          colis: [colis],
        });
        this.afficherListeColis(this.commandeSelectionne);
      } else {
        let index = this.listeCommandes.findIndex(
          (commande: any) => Number(colis.idCommande) === commande.commande.id
        );

        let colisExiste =
          this.listeCommandes[index].colis.filter(
            (col: any) => Number(colis.id) === col.id
          ).length > 0;
        if (!colisExiste) {
          colis.nombrePack = 1;
          colis.poidsBrut = col.poidsBrut / col.nombrePack;
          colis.poidsNet = col.poidsNet / col.nombrePack;
          colis.volume = col.volume / col.nombrePack;
          col.volume -= colis.volume;
          col.poidsBrut -= colis.poidsBrut;
          col.poidsNet -= colis.poidsNet;
          col.nombrePack -= 1;
          this.listeCommandes[index].colis.push(colis);
          this.afficherListeColis(this.commandeSelectionne);
        } else {
          this.augmenterQte(
            this.listeCommandes[index].colis.filter(
              (col: any) => Number(colis.id) === col.id
            )[0]
          );
        }
      }
    }
  }

  //augmenter nobrePacks affectées
  augmenterQte(colis: any) {
    let index = this.listeColisTot.findIndex((col: any) => colis.id === col.id);
    if (this.listeColisTot[index].nombrePack === 0) return;
    colis.nombrePack += 1;
    this.changerQteNonAffectee(colis);
  }

  //diminuer nombrePacks affectées
  diminuerQte(colis: any) {
    if (colis.nombrePack === 1) return;
    colis.nombrePack -= 1;
    this.changerQteNonAffectee(colis);
  }

  // changer la quantité des colis ne sont pas encore affactée ( en changeant la quantité en  change aussi le poids et le volume)
  changerQteNonAffectee(col: any) {
    // chercher l'index du colis desiré dans la liste des colis totale
    let index = this.listeColisTot.findIndex(
      (colis: any) => colis.id === col.id
    );
    // nombre de pack d'un colis affectée dans tou les vehicules
    let nbrPack = 0;
    // nombre des pack affectées dans une vehicule specifique
    let nbrPackAffecte = 0;
    let i = 0;
    let listeVehicule = this.couplesVehiculeChauffeurPrive.concat(
      this.couplesVehiculeChauffeurLoue
    );
    listeVehicule.forEach((element: any) => {
      element.commandes.forEach((commande: any) => {
        let commandeFiltre = commande.colis.filter(
          (coli: any) => coli.id === col.id
        );
        if (commandeFiltre.length > 0) {
          nbrPack += commandeFiltre[0].nombrePack;
          if (i !== this.indexPrive) {
            nbrPackAffecte += commandeFiltre[0].nombrePack;
          }
        }
      });
      i++;
    });
    // nombre de pack non affectées
    this.listeColisTot[index].nombrePack =
      this.copieListeColisTot[index].nombrePack - nbrPack;
    col.poidsBrut =
      (this.copieListeColisTot[index].poidsBrut /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    col.poidsNet =
      (this.copieListeColisTot[index].poidsNet /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    // poids des pack non affectées
    this.listeColisTot[index].poidsBrut =
      (this.copieListeColisTot[index].poidsBrut /
        this.copieListeColisTot[index].nombrePack) *
      this.listeColisTot[index].nombrePack;
    this.listeColisTot[index].poidsNet =
      (this.copieListeColisTot[index].poidsNet /
        this.copieListeColisTot[index].nombrePack) *
      this.listeColisTot[index].nombrePack;
    col.volume =
      (this.copieListeColisTot[index].volume /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    // volume des pack non affectées
    this.listeColisTot[index].volume =
      (this.copieListeColisTot[index].volume /
        this.copieListeColisTot[index].nombrePack) *
      this.listeColisTot[index].nombrePack;
    if (this.listeColisTot[index].nombrePack < 0) {
      this.listeColisTot[index].nombrePack = 0;

      col.nombrePack =
        this.copieListeColisTot[index].nombrePack - nbrPackAffecte;

      col.poidsBrut =
        (this.copieListeColisTot[index].poidsBrut /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      col.poidsNet =
        (this.copieListeColisTot[index].poidsNet /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // poids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
      this.listeColisTot[index].poidsNet =
        this.copieListeColisTot[index].poidsNet - col.poidsNet;

      col.volume =
        (this.copieListeColisTot[index].volume /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // volume des pack non affectées
      this.listeColisTot[index].volume =
        this.copieListeColisTot[index].volume - col.volume;

      return false;
    } else if (
      this.listeColisTot[index].nombrePack >=
      this.copieListeColisTot[index].nombrePack - 1
    ) {
      this.listeColisTot[index].nombrePack =
        this.copieListeColisTot[index].nombrePack - nbrPackAffecte - 1;

      col.nombrePack = 1;

      col.poidsBrut =
        (this.copieListeColisTot[index].poidsBrut /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;
      col.poidsNet =
        (this.copieListeColisTot[index].poidsNet /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // poids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
      this.listeColisTot[index].poidsNet =
        this.copieListeColisTot[index].poidsNet - col.poidsNet;

      col.volume =
        (this.copieListeColisTot[index].volume /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // volume des pack non affectées
      this.listeColisTot[index].volume =
        this.copieListeColisTot[index].volume - col.volume;
      return false;
    }
    return true;
  }

  //ajoute a chaque vehicule la liste des chauffeurs compatibles
  verifierCompatibiliteChauffeur() {
    for (let i = 0; i < this.data.nombreVoyages; i++) {
      this.vehicules.forEach((vehicule: any) => {
        let categorie = vehicule.vehicule.categories.split('/');
        let chauffeurs: any = [];
        categorie.forEach((value: any) => {
          this.chauffeurs.forEach((chauffeur: any) => {
            if (value === chauffeur.categorie_Permis) {
              chauffeurs.push(chauffeur);
            }
          });
        });
        this.couplesVehiculeChauffeursPrives.push({
          vehicule: vehicule.vehicule,
          chauffeurs: chauffeurs,
        });
      });
    }
    for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
      this.copieVehiculeChauffeurs.push({
        vehicule: this.couplesVehiculeChauffeursPrives[i].vehicule,
        chauffeurs: [...this.couplesVehiculeChauffeursPrives[i].chauffeurs],
      });
    }
  }

  // si un chauffeur est disponible pour plusieurs vehicules et on selectionne se chauffeur dans un vehicule on l'enleve pour les autres
  rafraichirListeChauffeur() {
    for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
      this.couplesVehiculeChauffeursPrives[i].chauffeurs = [
        ...this.copieVehiculeChauffeurs[i].chauffeurs,
      ];
    }
    for (
      let i = 0;
      i < this.couplesVehiculeChauffeurPrive.length / this.data.nombreVoyages;
      i++
    ) {
      for (
        let j = 0;
        j <
        this.couplesVehiculeChauffeursPrives.length / this.data.nombreVoyages;
        j++
      ) {
        this.couplesVehiculeChauffeursPrives[j].chauffeurs.forEach(
          (chauffeurLoop: any) => {
            if (
              j !== i &&
              this.couplesVehiculeChauffeurPrive[i].chauffeur.id_Employe ===
                chauffeurLoop.id_Employe
            ) {
              let index = this.couplesVehiculeChauffeursPrives[
                j
              ].chauffeurs.findIndex(
                (chauffeur: any) =>
                  this.couplesVehiculeChauffeurPrive[i].chauffeur.id_Employe ===
                  chauffeur.id_Employe
              );
              this.couplesVehiculeChauffeursPrives[j].chauffeurs.splice(
                index,
                1
              );
            }
          }
        );
      }
    }
    //si on a plusieurs nombres de voyages on selectionne le chauffeur seulement pour le premier voyages et les autres sont les meme comme selectionnées
    for (
      let i =
        this.couplesVehiculeChauffeurPrive.length / this.data.nombreVoyages;
      i < this.couplesVehiculeChauffeurPrive.length;
      i++
    ) {
      this.couplesVehiculeChauffeursPrives[i].chauffeurs = [];
      this.couplesVehiculeChauffeurPrive[i].chauffeur =
        this.couplesVehiculeChauffeurPrive[
          i -
            this.couplesVehiculeChauffeursPrives.length /
              this.data.nombreVoyages
        ].chauffeur;
      this.couplesVehiculeChauffeursPrives[i].chauffeurs.push(
        this.couplesVehiculeChauffeurPrive[
          i -
            this.couplesVehiculeChauffeursPrives.length /
              this.data.nombreVoyages
        ].chauffeur
      );
    }
  }

  // verifier si toute les colis d'une commande peut etre affectée
  get commandePeutEtreTotalementAffectee() {
    let poidsListeColisRestante = 0;
    let volumeListeColisRestante = 0;
    let volumeVehicule =
      this.vehiculesTot[this.indexVehiculeSelectionne].longueur *
      this.vehiculesTot[this.indexVehiculeSelectionne].largeur *
      this.vehiculesTot[this.indexVehiculeSelectionne].hauteur;
    this.listeColis.forEach((colis: any) => {
      poidsListeColisRestante += colis.poidsBrut;
      volumeListeColisRestante += colis.volume;
    });
    if (
      this.poidsCommandes + poidsListeColisRestante >
        this.vehiculesTot[this.indexVehiculeSelectionne].charge_utile ||
      this.volumeCommandes + volumeListeColisRestante > volumeVehicule
    )
      return false;
    else return true;
  }

  // fonction pour selectionner tous les colis dans une commande
  selectionnerTouteLaCommande() {
    this.listeColis.forEach((colis: any) => {
      let copieColie = JSON.parse(JSON.stringify(colis));
      for (let i = 0; i < copieColie.nombrePack; i++) {
        this.ajouterCommandeAuVehicule(colis);
      }
    });
    this.afficherListeColis(this.commandeSelectionne);
  }

  // annuler affectation colis dans voiture
  annulerAffectationColis(col: any) {
    col.nombrePack = 0;
    // chercher l'index du colis desiré dans la liste des colis totale
    let index = this.listeColisTot.findIndex(
      (colis: any) => colis.id === col.id
    );

    // index commande dans liste commande d'une vehicule
    let indexCommande = this.listeCommandes.findIndex(
      (commande: any) => commande.commande.id === Number(col.idCommande)
    );

    // index colis dans liste colis d'une commande
    let indexColis = this.listeCommandes[indexCommande].colis.findIndex(
      (colis: any) => colis.id === col.id
    );

    // nombre de pack d'un colis affectée dans tou les vehicules
    let nbrPack = 0;
    // nombre des pack affectées dans une vehicule specifique
    let i = 0;
    let listeVehicule = this.couplesVehiculeChauffeurPrive.concat(
      this.couplesVehiculeChauffeurLoue
    );
    listeVehicule.forEach((element: any) => {
      element.commandes.forEach((commande: any) => {
        let commandeFiltre = commande.colis.filter(
          (coli: any) => coli.id === col.id
        );
        if (commandeFiltre.length > 0) {
          nbrPack += commandeFiltre[0].nombrePack;
        }
      });
      i++;
    });
    // nombre de pack non affectées
    this.listeColisTot[index].nombrePack =
      this.copieListeColisTot[index].nombrePack - nbrPack;
    col.poidsBrut =
      (this.copieListeColisTot[index].poidsBrut /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    col.poidsNet =
      (this.copieListeColisTot[index].poidsNet /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    // poids des pack non affectées
    this.listeColisTot[index].poidsBrut =
      this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
    this.listeColisTot[index].poidsNet =
      this.copieListeColisTot[index].poidsNet - col.poidsNet;
    col.volume =
      (this.copieListeColisTot[index].volume /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    // volume des pack non affectées
    this.listeColisTot[index].volume =
      this.copieListeColisTot[index].volume - col.volume;

    this.listeCommandes[indexCommande].colis.splice(indexColis, 1);
    if (this.listeCommandes[indexCommande].colis.length === 0) {
      this.listeCommandes.splice(indexCommande, 1);
      this.boutonFermerListeColis();
    }
  }

  // annuler toute la commande affectée dans une vehicule (si une commande affectée dans plusieurs vehicule elle s'annule que de la vehicule selectionée)
  async annulerAffectationCommande(commande: any) {
    commande.colis.forEach((col: any) => {
      col.nombrePack = 0;
      // chercher l'index du colis desiré dans la liste des colis totale
      let index = this.listeColisTot.findIndex(
        (colis: any) => colis.id === col.id
      );

      // nombre de pack d'un colis affectée dans tou les vehicules
      let nbrPack = 0;
      // nombre des pack affectées dans une vehicule specifique
      let i = 0;
      let listeVehicule = this.couplesVehiculeChauffeurPrive.concat(
        this.couplesVehiculeChauffeurLoue
      );
      listeVehicule.forEach((element: any) => {
        element.commandes.forEach((commande: any) => {
          let commandeFiltre = commande.colis.filter(
            (coli: any) => coli.id === col.id
          );
          if (commandeFiltre.length > 0) {
            nbrPack += commandeFiltre[0].nombrePack;
          }
        });
        i++;
      });
      // nombre de pack non affectées
      this.listeColisTot[index].nombrePack =
        this.copieListeColisTot[index].nombrePack - nbrPack;
      col.poidsBrut =
        (this.copieListeColisTot[index].poidsBrut /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;
      col.poidsNet =
        (this.copieListeColisTot[index].poidsNet /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;
      // poids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
      this.listeColisTot[index].poidsNet =
        this.copieListeColisTot[index].poidsNet - col.poidsNet;
      col.volume =
        (this.copieListeColisTot[index].volume /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;
      // volume des pack non affectées
      this.listeColisTot[index].volume =
        this.copieListeColisTot[index].volume - col.volume;
    });

    // index commande dans liste commande d'une vehicule
    let indexCommande = this.listeCommandes.findIndex(
      (commande: any) => commande.commande.id === commande.id
    );

    this.listeCommandes.splice(indexCommande, 1);
  }

  // retourne le poids de la vehicule
  get poidsVehicule() {
    let poids = 0;
    if (this.typeVehicule) {
      this.typeVehicule === 'prive'
        ? (poids =
            this.couplesVehiculeChauffeurPrive[this.indexPrive].vehicule
              .charge_utile)
        : (poids =
            this.couplesVehiculeChauffeurLoue[this.indexLoue].vehicule
              .charge_utile);
    }
    return Number(poids.toFixed(4));
  }

  // retourne le volume de la vehicule
  get volumeVehicule() {
    let volume = 0;
    if (this.typeVehicule) {
      this.typeVehicule === 'prive'
        ? (volume =
            this.couplesVehiculeChauffeurPrive[this.indexPrive].vehicule
              .longueur *
            this.couplesVehiculeChauffeurPrive[this.indexPrive].vehicule
              .largeur *
            this.couplesVehiculeChauffeurPrive[this.indexPrive].vehicule
              .hauteur)
        : (volume =
            this.couplesVehiculeChauffeurLoue[this.indexLoue].vehicule
              .longueur *
            this.couplesVehiculeChauffeurLoue[this.indexLoue].vehicule.largeur *
            this.couplesVehiculeChauffeurLoue[this.indexLoue].vehicule.hauteur);
    }
    return Number((volume / 1000000).toFixed(4));
  }

  // retourne le poids des commandes dans vehicule
  get poidsCommandes() {
    let poids = 0;
    if (this.typeVehicule) {
      this.typeVehicule === 'prive'
        ? this.couplesVehiculeChauffeurPrive[this.indexPrive].commandes.forEach(
            (commande: any) => {
              commande.colis.forEach((colis: any) => {
                poids += colis.poidsBrut;
              });
            }
          )
        : this.couplesVehiculeChauffeurLoue[this.indexLoue].commandes.forEach(
            (commande: any) => {
              commande.colis.forEach((colis: any) => {
                poids += colis.poidsBrut;
              });
            }
          );
    }
    return Number(poids.toFixed(4));
  }

  // retourne volume commandes
  get volumeCommandes() {
    let volume = 0;
    if (this.typeVehicule) {
      this.typeVehicule === 'prive'
        ? this.couplesVehiculeChauffeurPrive[this.indexPrive].commandes.forEach(
            (commande: any) => {
              commande.colis.forEach((colis: any) => {
                volume += colis.volume;
              });
            }
          )
        : this.couplesVehiculeChauffeurLoue[this.indexLoue].commandes.forEach(
            (commande: any) => {
              commande.colis.forEach((colis: any) => {
                volume += colis.volume;
              });
            }
          );
    }
    return Number(volume.toFixed(4));
  }

  // retourne le poids de la commande affichée
  get poidsCommandeSelectionne() {
    let poids = 0;
    this.listeColis.forEach((colis: any) => {
      poids += colis.poidsBrut;
    });
    return Number(poids.toFixed(4));
  }

  // retourne le volume de la commande affichée
  get volumeCommandeSelectionne() {
    let volume = 0;
    this.listeColis.forEach((colis: any) => {
      volume += colis.volume;
    });
    return Number(volume.toFixed(4));
  }

  // verifier si toutes les commandes sont affectées dans des vehicules
  get toutValide() {
    let estValide = true;
    this.listeColisTot.forEach((colis: any) => {
      colis.nombrePack !== 0 ? (estValide = false) : '';
    });
    this.couplesVehiculeChauffeurPrive.forEach((element: any) => {
      element.commandes.length === 0 ? (estValide = false) : '';
      Object.keys(element.chauffeur).length === 0 ? (estValide = false) : '';
    });
    this.couplesVehiculeChauffeurLoue.forEach((element: any) => {
      element.commandes.length === 0 ? (estValide = false) : '';
      element.chauffeur.nom === '' || element.chauffeur.tel === ''
        ? (estValide = false)
        : '';
    });
    return estValide;
  }

  //   bouton ok
  valider() {
    if (!this.toutValide) return;
    let couplesVehiculeChauffeurPrive = this.couplesVehiculeChauffeurPrive;
    let couplesVehiculeChauffeurLoue = this.couplesVehiculeChauffeurLoue;
    this.dialogRef.close({
      prive: couplesVehiculeChauffeurPrive,
      loue: couplesVehiculeChauffeurLoue,
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------
//------------------------------------------Affecter Chauffeur--------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'affecter-chauffeur',
  templateUrl: 'affecter-chauffeur.html',
  styleUrls: ['affecter-chauffeur.scss'],
})
export class AffecterChauffeur implements OnInit {
  chauffeurs: any;
  chauffeurSelectionne = { nom: '', tel: '' };
  typeVehicule: string;
  commandeActive: Array<boolean> = []; //liste des valeurs boolean pour avoir quel commande est active
  listeColis: any;
  vehicule: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceChauffeur: ChauffeurService,
    private serviceMission: MissionsService,
    private dialogRef: MatDialogRef<AffecterChauffeur>
  ) {}

  async ngOnInit() {
    //tester si le vehicule s'agit d'un vehicule prive ou vehicule loue
    if (
      this.data.vehiculesPrives.length === 1 &&
      this.data.vehiculesLoues.length === 0
    ) {
      this.typeVehicule = 'prive';
      this.vehicule = this.data.vehiculesPrives[0].vehicule;
      await this.getListeChauffeurs();
      this.verifierCompatibiliteChauffeur();
    } else if (
      this.data.vehiculesPrives.length === 0 &&
      this.data.vehiculesLoues.length === 1
    ) {
      this.typeVehicule = 'loue';
      this.vehicule = this.data.vehiculesLoues[0];
    }
    //activer la premiere commande par defaut
    this.commandeActive[0] = true;
    this.choisirCommande(this.data.mission[0]);
  }

  async getListeChauffeurs() {
    this.chauffeurs = await this.serviceChauffeur.getChauffeurs().toPromise();
  }

  // permet d'avoir les chauffeurs compatibles ave le vehicule
  verifierCompatibiliteChauffeur() {
    let categorie = this.data.vehiculesPrives[0].vehicule.categories.split('/');
    let chauffeurs: any = [];
    categorie.forEach((value: any) => {
      this.chauffeurs.forEach((chauffeur: any) => {
        if (value === chauffeur.categorie_Permis) {
          chauffeurs.push(chauffeur);
        }
      });
    });
    this.chauffeurs = chauffeurs;
  }

  async getListeColis(idCommande: any) {
    this.listeColis = await this.serviceMission
      .getListeColisParIdCommande(idCommande)
      .toPromise();
  }
  // retourne le nombre d'emballages total
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeColis.forEach((colis: any) => {
      nombrePack += colis.nombrePack;
    });
    return nombrePack;
  }

  // retourne le volume total d'une commande
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeColis.forEach((colis: any) => {
      volumeTotal += colis.volume;
    });
    return volumeTotal.toFixed(3);
  }

  // retourne le poids total net d'une commande
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(3);
  }

  // retourne le poids total brut d'une commande
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(3);
  }

  async choisirCommande(commande: any) {
    this.listeColis = undefined;
    await this.getListeColis(commande.id);
  }

  // permet de changer la commande active lors du selection d'une commande
  changerCommandeActive(i: number) {
    this.commandeActive[i] = true;
    for (let j = 0; j < this.commandeActive.length; j++) {
      j === i ? '' : (this.commandeActive[j] = false);
    }
  }

  //tester si toutes les conditions sont valides pour activer le bouton valider
  get toutValide() {
    let estValide = true;
    this.chauffeurSelectionne.nom === '' || this.chauffeurSelectionne.tel === ''
      ? (estValide = false)
      : (estValide = true);
    return estValide;
  }

  async valider() {
    let couplesVehiculeChauffeurPrive: any;
    let couplesVehiculeChauffeurLoue: any;
    let commandes: any = [];
    for (let i = 0; i < this.data.mission.length; i++) {
      const commande = this.data.mission[i];
      await this.getListeColis(commande.id);
      commandes.push({
        commande: commande,
        colis: this.listeColis,
      });
    }
    if (this.typeVehicule === 'prive') {
      couplesVehiculeChauffeurPrive = [
        {
          vehicule: this.vehicule,
          chauffeur: this.chauffeurSelectionne,
          commandes: commandes,
        },
      ];
      couplesVehiculeChauffeurLoue = [];
    } else {
      couplesVehiculeChauffeurPrive = [];
      couplesVehiculeChauffeurLoue = [
        {
          vehicule: this.vehicule,
          chauffeur: this.chauffeurSelectionne,
          commandes: commandes,
        },
      ];
    }
    this.dialogRef.close({
      prive: couplesVehiculeChauffeurPrive,
      loue: couplesVehiculeChauffeurLoue,
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------Detail Component------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-detail-mission',
  templateUrl: './detail-mission.html',
  styleUrls: ['./detail-mission.scss'],
})
export class DetailComponent implements OnInit {
  chauffeur: any = [];
  matricule: any;
  commandes: any = [];

  displayedColumns: string[] = [
    'referenceDocument',
    'nomClient',
    'contact',
    'telephone',
    'ville',
    'adresse',
    'trackingNumber',
    'etat',
    'action',
  ];
  dataSource = new MatTableDataSource();
  date_creation: any;
  constructor(
    public serviceMission: MissionsService,
    private serviceChauffeur: ChauffeurService,
    public _DomSanitizationService: DomSanitizer,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.refresh();
  }

  // get chauffeur et matricule vehicule
  async refresh() {
    let idChauffeur = this.data.mission.idChauffeur;
    this.matricule = this.data.mission.matricule;
    if (idChauffeur === 'null') {
      this.chauffeur = {
        nom: this.data.mission.nomChauffeur,
        tel: this.data.mission.telephoneChauffeur,
      };
      console.log(this.data.mission);
    } else {
      this.chauffeur = await this.serviceChauffeur
        .employe(Number(idChauffeur))
        .toPromise();
    }
    await this.getListeCommandes();
  }

  get nbrCommandes() {
    return this.data.mission.idCommandes.split('/').length;
  }

  // poids total des commande dans une mission
  get poidsMission() {
    return this.data.mission.poids;
  }

  // volume total des commandes dans une mission
  get volumeMission() {
    return this.data.mission.volume;
  }

  async getListeCommandes() {
    console.log(this.data.mission.idCommandes);
    let idCommandes = this.data.mission.idCommandes.split('/');
    for (let i = 0; i < idCommandes.length; i++) {
      const idCommande = Number(idCommandes[i]);
      this.commandes.push(
        await this.serviceMission.commande(idCommande).toPromise()
      );
    }
  }

  supprimerCommande(id: any) {
    // supprimer une commande
    this.serviceMission.supprimerCommande(id);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }

  // afficher la position de la commande
  ouvrirMap(commande: any) {
    const dialogRef = this.dialog.open(PositionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      height: '50vh',
      autoFocus: false,
      panelClass: 'custom-dialog-position',
      data: { idPosition: commande.idPosition },
    });
  }

  // ouvrir la boite dialogue details commande
  ouvrirDetailCommande(id: any) {
    const dialogRef = this.dialog.open(DetailCommande, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail-commande',
      data: { idMission: this.data.mission.id, idCommande: id, mode: 'admin' },
    });
  }
}

// *********************************************interface table commandes***************************************
export interface tableCommandes {
  id: number;
  idMission: number;
  referenceCommande: number;
  destinataire: string;
  destination: String;
  etat: String;
}

// **************************************** boite dialog position *********************************************

@Component({
  selector: 'position',
  templateUrl: './position.html',
  styleUrls: ['./position.scss'],
})
export class PositionComponent implements OnInit {
  lat: any;
  lng: any;
  zoom = 15;
  adresse: string;

  constructor(
    public serviceCommande: CommandeService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  ngOnInit(): void {
    this.getPosition();
  }

  async getPosition() {
    let position = await this.serviceCommande
      .getPositionById(this.data.idPosition)
      .toPromise();
    this.lat = Number(position.latitude);
    this.lng = Number(position.longitude);
    this.adresse = position.adresse;
  }
}

// **************************************** dialog detail commande *****************************
@Component({
  selector: 'app-detail-commande',
  templateUrl: 'detail-commande.html',
  styleUrls: ['detail-commande.scss'],
})
export class DetailCommande implements OnInit {
  listeColis: any;
  constructor(
    private dialogRef: MatDialogRef<DetailCommande>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceMission: MissionsService
  ) {}

  ngOnInit() {
    this.getListeColis();
  }

  // get la liste des colis dans une mission par l'id de la mission
  async getListeColis() {
    let listeColisParMission = await this.serviceMission
      .getColisParIdMission(this.data.idMission)
      .toPromise();
    this.listeColis = listeColisParMission.filter(
      (colis: any) => colis.idCommande == this.data.idCommande
    );
  }
  // retourne le nombre d'emballages total
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeColis.forEach((colis: any) => {
      nombrePack += colis.nombrePack;
    });
    return nombrePack;
  }

  // retourne le volume total d'une commande
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeColis.forEach((colis: any) => {
      volumeTotal += colis.volume;
    });
    return volumeTotal.toFixed(3);
  }

  // retourne le poids total net d'une commande
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(3);
  }

  // retourne le poids total brut d'une commande
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(3);
  }
}

// **************************************** dialog  confirmer livraison *****************************
@Component({
  selector: 'app-confirmer-livraison',
  templateUrl: 'confirmer-livraison.html',
  styleUrls: ['confirmer-livraison.scss'],
})
export class ConfirmerLivraison implements OnInit {
  interval: any; //intervalle entre les keyup ==> on va specifier interval de 20ms pour ne pas autoriser l'ecriture que au scanner du code a barre
  qrCode = '';

  constructor(
    private dialogRef: MatDialogRef<ConfirmerLivraison>,
    private serviceMission: MissionsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  // fonction pour scanner le Qr code de confirmation de livraison avec le scanner
  @HostListener('window:keyup', ['$event'])
  async keyEvent(event: KeyboardEvent) {
    let reponse: any;
    if (this.interval) clearInterval(this.interval);
    if (event.code == 'Enter') {
      if (this.qrCode)
        reponse = await this.serviceMission
          .livrerCommande(this.qrCode, this.data.mission.id)
          .toPromise();
      this.qrCode = '';
      if (reponse[0]) {
        Swal.fire({
          icon: 'success',
          title: 'Commande bien reçue',
          showConfirmButton: false,
          timer: 1500,
        });
        this.dialogRef.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Qr code invalide',
          text: "Ce Qr code n'appartiens à aucune commande pour cette mission!",
        });
      }
      return;
    }
    if (event.key != 'Shift') this.qrCode += event.key;
    this.interval = setInterval(() => (this.qrCode = ''), 20);
  }
}

// *********************************************** dialog modifier mission ******************************
@Component({
  templateUrl: 'modifier-mission.html',
  styleUrls: ['modifier-mission.scss'],
})
export class ModifierMission implements OnInit {
  typeEstPrive = true;
  listeVehicules: any;
  listeChauffeurs: any;
  listeChauffeursCompatibles: any;
  vehiculeSelectionne: any;
  chauffeurSelectionne: any = { nom: '', tel: '' };
  constructor(
    private dialogRef: MatDialogRef<ModifierMission>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceMission: MissionsService
  ) {}

  async ngOnInit() {
    this.getTypeVehicule();
    await this.getListeVehicule();
    this.getVehiculeInitiale();
    this.getChauffeurInitial();
  }

  // specifier le type du vehicule
  getTypeVehicule() {
    this.data.mission.idChauffeur === 'null'
      ? (this.typeEstPrive = false)
      : (this.typeEstPrive = true);
  }

  // permet de charger la liste des vehicules
  async getListeVehicule() {
    this.listeVehicules = [];
    this.listeChauffeursCompatibles = [];
    this.chauffeurSelectionne = { nom: '', tel: '' };
    if (this.typeEstPrive) {
      let vehicules: any = await this.serviceMission.vehicules().toPromise();
      this.listeChauffeurs = await this.serviceMission
        .getChauffeurs()
        .toPromise();
      vehicules.forEach((vehicule: any) => {
        let volumeUtile =
          vehicule.longueur * vehicule.largeur * vehicule.hauteur;
        vehicule.charge_utile > this.data.mission.poids &&
        volumeUtile > this.data.mission.volume
          ? this.listeVehicules.push(vehicule)
          : '';
      });
    } else {
      let vehicules: any = await this.serviceMission
        .filtrerVehiculeLoues('etat_vehicule', 'Disponible')
        .toPromise();
      vehicules.forEach((vehicule: any) => {
        let volumeUtile =
          vehicule.longueur * vehicule.largeur * vehicule.hauteur;
        vehicule.charge_utile > this.data.mission.poids &&
        volumeUtile > this.data.mission.volume
          ? this.listeVehicules.push(vehicule)
          : '';
      });
    }
  }

  // permet d'avoir la liste des chauffeurs compatibles avec le vehicule selectionné
  getChauffeursCompatibles() {
    var chauffeurs: any = [];
    var categories = this.vehiculeSelectionne.categories.split('/');
    categories.forEach((categorie: any) => {
      this.listeChauffeurs.forEach((chauffeur: any) => {
        if (categorie == chauffeur.categorie_Permis) {
          chauffeurs.push(chauffeur);
        }
      });
    });
    this.listeChauffeursCompatibles = chauffeurs;
  }

  // permet d'avoir le vehicule qui est deja enregistré avec la mission initialement
  getVehiculeInitiale() {
    let index = this.listeVehicules.findIndex(
      (v: any) => v.matricule === this.data.mission.matricule
    );
    this.vehiculeSelectionne = this.listeVehicules[index];
  }

  // permet d'avoir le chauffeur qui est deja enregistré avec la mission initialement
  getChauffeurInitial() {
    if (this.typeEstPrive) {
      this.getChauffeursCompatibles();
      let index = this.listeChauffeursCompatibles.findIndex(
        (chauffeur: any) =>
          chauffeur.id_Employe === Number(this.data.mission.idChauffeur)
      );
      this.chauffeurSelectionne = this.listeChauffeursCompatibles[index];
    } else {
      this.chauffeurSelectionne.nom = this.data.mission.nomChauffeur;
      this.chauffeurSelectionne.tel = this.data.mission.telephoneChauffeur;
    }
  }

  get valide() {
    let valide;
    if (
      this.chauffeurSelectionne.nom === '' ||
      this.chauffeurSelectionne.tel === '' ||
      !this.vehiculeSelectionne
    ) {
      valide = false;
    } else {
      valide = true;
    }
    return valide;
  }

  // enregistrer les modifications
  enregistrer() {
    if (this.typeEstPrive) {
      this.data.mission.nomChauffeur = this.chauffeurSelectionne.nom;
      this.data.mission.telephoneChauffeur = this.chauffeurSelectionne.tel;
      this.data.mission.idChauffeur = this.chauffeurSelectionne.id;
      this.data.mission.matricule = this.vehiculeSelectionne.matricule;
    } else {
      this.data.mission.nomChauffeur = this.chauffeurSelectionne.nom;
      this.data.mission.telephoneChauffeur = this.chauffeurSelectionne.tel;
      this.data.mission.idChauffeur = 'null';
      this.data.mission.matricule = this.vehiculeSelectionne.matricule;
    }
    this.serviceMission.updateMission(this.data.mission).subscribe((result) => {
      Swal.fire({
        icon: 'success',
        title: 'Modification enregistrée',
        showConfirmButton: false,
        timer: 1500,
      });
      this.dialogRef.close();
    });
  }
}

// ******************************************* confirmation annulation mission ********************************

@Component({
  templateUrl: 'confirmation-annulation-mission.html',
})
export class ConfirmationAnnulationMission implements OnInit {
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = [
    'id',
    'nom',
    'matricule',
    'dateLivraison',
    'etatMission',
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceMission: MissionsService,
    private dialogRef: MatDialogRef<ConfirmationAnnulationMission>
  ) {}

  ngOnInit() {
    this.data.missionsPasAnnule.length === 0
      ? (this.dataSource.data = this.data.missions)
      : (this.dataSource.data = this.data.missionsPasAnnule);
  }

  async annulerLesMissions() {
    for (let i = 0; i < this.data.missions.length; i++) {
      const mission = this.data.missions[i];
      let idCommandes = mission.idCommandes.split('/');
      for (let j = 0; j < idCommandes.length; j++) {
        let formDataCommande: any = new FormData();
        formDataCommande.append('id', Number(idCommandes[j]));
        formDataCommande.append('etat', 'En cours de traitement');
        formDataCommande.append('idMission', 0);
        await this.serviceMission
          .affecterCommande(formDataCommande)
          .toPromise();
      }
      await this.serviceMission.deleteMission(mission.id).toPromise();
    }
    Swal.fire({
      icon: 'success',
      title: 'Mission annulée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.dialogRef.close();
  }
}

// ************************************** Trajet ***********************************
@Component({
  templateUrl: 'trajet.html',
  styleUrls: ['trajet.scss'],
})
export class Trajet implements OnInit {
  // les coordonnées actuelles prise depuis le navigateur
  currentLat: any;
  currentLong: any;

  // lien map
  lien: any;

  // afficher map ou non
  mapEstAffiche = false;

  // liste des commandes a afficher dans le drag and drop
  commandes: any = [];

  // point de depart
  origine: any;

  // point finale
  finChemin: any;

  // les points de stops
  pointStop: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private serviceMission: MissionsService
  ) {}

  async ngOnInit() {
    this.afficherTrajet();
    let idCommandes = this.data.mission.idCommandes.split('/');
    for (let i = 0; i < idCommandes.length; i++) {
      const idCommande = Number(idCommandes[i]);
      this.commandes.push(
        await this.serviceMission.commande(idCommande).toPromise()
      );
    }
    console.log(this.commandes);
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

  // retourne la position de destination d'une commande
  async getPosition(idPosition: any) {
    let position = await this.serviceMission
      .getPositionById(idPosition)
      .toPromise();
    return position;
  }

  // créer le meilleur trajet possible
  async createTrajet() {
    this.chercherMoi();
    let positions: any = [];
    let idCommandes = this.data.mission.idCommandes.split('/');
    console.log(idCommandes);
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
      latitude: this.currentLat,
      longitude: this.currentLong,
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
    this.mapEstAffiche = true;
  }

  //changer l'ordre du trajet lors du drop
  async drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.commandes, event.previousIndex, event.currentIndex);
    let idCommandes = '';
    for (let i = 0; i < this.commandes.length; i++) {
      const commande = this.commandes[i];
      idCommandes += commande.id + '/';
    }
    idCommandes = idCommandes.slice(0, -1);
    this.data.mission.idCommandes = idCommandes;
    console.log(idCommandes);
    await this.serviceMission
      .modifierIdCommandesDansMission(this.data.mission.id, idCommandes)
      .toPromise();
    this.afficherTrajet();
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
}

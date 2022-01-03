import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
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

// ************************************ Boite dialogue affecter chauffeur ********************************
@Component({
  selector: 'affecter-chauffeur',
  templateUrl: 'affecter-chauffeur.html',
  styleUrls: ['affecter-chauffeur.scss'],
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
export class AffecterChauffeur implements OnInit {
  chauffeursCompatibles: any;
  selectedValue: any;
  chauffeurs: any;
  couplesVehiculeChauffeursPrives: any = [];
  copieVehiculeChauffeurs: any = [];
  commandeActive: Array<boolean> = [];
  vehiculeActive: Array<boolean> = [];
  vehiculesTot: any = [];
  listeColisTot: any;
  listeColis: any;
  copieListeColisTot: any;
  typeVehicule: any;
  vehiculeChauffeurs: any;
  vehiculeLoue: any;
  index: any;
  listeCommandesParVehicule: any = [];
  listeMissionsVehiculesPrive: any = [];
  listeMissionsVehiculesLoue: any = [];
  listeCommandes: any = [];
  commandeSelectionne: any;
  listeColisAffiche = false;
  commandeDansVehiculeSelectionne: any;
  couplesVehiculeChauffeurPrive: any = [];
  couplesVehiculeChauffeurLoue: any = [];

  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<AffecterChauffeur>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceChauffeur: ChauffeurService,
    private serviceMission: MissionsService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.creerForm();
    await this.getListeChauffeurs();
    this.verifierCompatibiliteChauffeur();
    this.data.vehiculesPrives.forEach((v: any) => {
      this.vehiculesTot.push(v.vehicule);
      this.couplesVehiculeChauffeurPrive.push({
        vehicule: v.vehicule,
        chauffeur: {},
        commandes: [],
      });
    });
    this.vehiculesLoues.forEach((vehicule: any) => {
      this.couplesVehiculeChauffeurLoue.push({
        vehicule: vehicule,
        chauffeur: '',
        commandes: [],
      });
    });
    this.vehiculesTot = this.vehiculesTot.concat(this.vehiculesLoues);
    this.commandeActive[0] = true;
    this.vehiculeActive[0] = true;
    await this.chargerCommandes();
    this.choisirCommande(this.data.mission[0]);
    this.choisirVehicule(0);
  }

  creerForm() {
    this.form = this.fb.group({
      chauffeurs: this.fb.array([]), //chauffeurs privés
      chauffeursLoues: this.fb.array([]), //chauffeurs Loués
    });

    this.vehicules.forEach(() => {
      const chauffeur = this.fb.group({ chauffeur: '' });
      this.chauffeursForms.push(chauffeur);
    });

    this.vehiculesLoues.forEach(() => {
      const chauffeurLoue = this.fb.group({ chauffeurLoue: '' });
      this.chauffeursLouesForms.push(chauffeurLoue);
    });
  }

  get chauffeursForms() {
    return this.form.get('chauffeurs') as FormArray;
  }

  get chauffeursLouesForms() {
    return this.form.get('chauffeursLoues') as FormArray;
  }

  get vehicules() {
    return this.data.vehiculesPrives;
  }

  get vehiculesLoues() {
    return this.data.vehiculesLoues;
  }

  // etat du div qui contient liste des colis dans voiture "show" pour afficher, "hide" pour cacher
  get statusDetailCommande() {
    return this.listeColisAffiche ? 'show' : 'hide';
  }

  // la fonction qui permet de lancer le changement d'etat
  toggleListeColis() {
    this.listeColisAffiche = !this.listeColisAffiche;
  }

  afficherListeColis(commande: any) {
    this.commandeDansVehiculeSelectionne = commande;
    if (!this.listeColisAffiche) {
      setTimeout(() => {
        this.toggleListeColis();
      }, 20);
    } else {
      this.toggleListeColis();
      setTimeout(() => {
        this.commandeDansVehiculeSelectionne = commande;
      }, 310);
      setTimeout(() => {
        this.toggleListeColis();
      }, 20);
    }
  }

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
    console.log(this.listeColisTot);
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

  choisirVehicule(i: number) {
    this.index = i;
    if (i < this.couplesVehiculeChauffeursPrives.length) {
      this.typeVehicule = 'prive';
      this.vehiculeChauffeurs = this.couplesVehiculeChauffeursPrives[i];
      this.listeCommandes = this.couplesVehiculeChauffeurPrive[i].commandes;
    } else {
      this.typeVehicule = 'loue';
      this.vehiculeLoue =
        this.vehiculesLoues[i - this.couplesVehiculeChauffeursPrives.length];
      this.listeCommandes =
        this.couplesVehiculeChauffeurLoue[
          i - this.couplesVehiculeChauffeursPrives.length
        ].commandes;
    }
    console.log(this.couplesVehiculeChauffeurLoue);
  }

  ajouterCommandeAuVehicule(col: any) {
    if (
      this.poidsCommandes + col.poidsBrut / col.nombrePack >
      this.vehiculesTot[this.index].charge_utile
    )
      return;
    let colis = Object.assign({}, col);
    let commandeExiste =
      this.listeCommandes.filter(
        (commande: any) => Number(colis.idCommande) === commande.commande.id
      ).length > 0;
    if (col.nombrePack > 0) {
      if (!commandeExiste) {
        colis.nombrePack = 1;
        colis.poidsBrut = col.poidsBrut / col.nombrePack;
        colis.volume = col.volume / col.nombrePack;
        col.volume -= colis.volume;
        col.poidsBrut -= colis.poidsBrut;
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
          colis.volume = col.volume / col.nombrePack;
          col.volume -= colis.volume;
          col.poidsBrut -= colis.poidsBrut;
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

  augmenterQte(colis: any) {
    let index = this.listeColisTot.findIndex((col: any) => colis.id === col.id);
    if (this.listeColisTot[index].nombrePack === 0) return;
    colis.nombrePack += 1;
    this.changerQteNonAffectee(colis);
  }

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
          if (i !== this.index) {
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
    // paids des pack non affectées
    this.listeColisTot[index].poidsBrut =
      this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
    col.volume =
      (this.copieListeColisTot[index].volume /
        this.copieListeColisTot[index].nombrePack) *
      col.nombrePack;
    // volume des pack non affectées
    this.listeColisTot[index].volume =
      this.copieListeColisTot[index].volume - col.volume;
    if (this.listeColisTot[index].nombrePack < 0) {
      this.listeColisTot[index].nombrePack = 0;

      col.nombrePack =
        this.copieListeColisTot[index].nombrePack - nbrPackAffecte;

      col.poidsBrut =
        (this.copieListeColisTot[index].poidsBrut /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // paids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;

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

      // paids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;

      col.volume =
        (this.copieListeColisTot[index].volume /
          this.copieListeColisTot[index].nombrePack) *
        col.nombrePack;

      // volume des pack non affectées
      this.listeColisTot[index].volume =
        this.copieListeColisTot[index].volume - col.volume;
      return false;
    }
    console.log(this.copieListeColisTot[index].nombrePack);
    return true;
  }

  verifierCompatibiliteChauffeur() {
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
    for (let i = 0; i < this.couplesVehiculeChauffeurPrive.length; i++) {
      for (let j = 0; j < this.couplesVehiculeChauffeursPrives.length; j++) {
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
    // paids des pack non affectées
    this.listeColisTot[index].poidsBrut =
      this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
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
      // paids des pack non affectées
      this.listeColisTot[index].poidsBrut =
        this.copieListeColisTot[index].poidsBrut - col.poidsBrut;
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
    let poids;
    this.typeVehicule === 'prive'
      ? (poids =
          this.couplesVehiculeChauffeurPrive[this.index].vehicule.charge_utile)
      : (poids =
          this.couplesVehiculeChauffeurLoue[
            this.index - this.couplesVehiculeChauffeursPrives.length
          ].vehicule.charge_utile);
    return Number(poids.toFixed(4));
  }

  // retourne le volume de la vehicule
  get volumeVehicule() {
    let volume;
    this.typeVehicule === 'prive'
      ? (volume =
          this.couplesVehiculeChauffeurPrive[this.index].vehicule.longueur *
          this.couplesVehiculeChauffeurPrive[this.index].vehicule.largeur *
          this.couplesVehiculeChauffeurPrive[this.index].vehicule.hauteur)
      : (volume =
          this.couplesVehiculeChauffeurLoue[
            this.index - this.couplesVehiculeChauffeursPrives.length
          ].vehicule.longueur *
          this.couplesVehiculeChauffeurLoue[
            this.index - this.couplesVehiculeChauffeursPrives.length
          ].vehicule.largeur *
          this.couplesVehiculeChauffeurLoue[
            this.index - this.couplesVehiculeChauffeursPrives.length
          ].vehicule.hauteur);
    return Number((volume / 1000000).toFixed(4));
  }

  // retourne le poids des commandes dans vehicule
  get poidsCommandes() {
    let poids = 0;
    this.typeVehicule === 'prive'
      ? this.couplesVehiculeChauffeurPrive[this.index].commandes.forEach(
          (commande: any) => {
            commande.colis.forEach((colis: any) => {
              poids += colis.poidsBrut;
            });
          }
        )
      : this.couplesVehiculeChauffeurLoue[
          this.index - this.couplesVehiculeChauffeursPrives.length
        ].commandes.forEach((commande: any) => {
          commande.colis.forEach((colis: any) => {
            poids += colis.poidsBrut;
          });
        });
    return Number(poids.toFixed(4));
  }

  // retourne volume commandes
  get volumeCommandes() {
    let volume = 0;
    this.typeVehicule === 'prive'
      ? this.couplesVehiculeChauffeurPrive[this.index].commandes.forEach(
          (commande: any) => {
            commande.colis.forEach((colis: any) => {
              volume += colis.volume;
            });
          }
        )
      : this.couplesVehiculeChauffeurLoue[
          this.index - this.couplesVehiculeChauffeursPrives.length
        ].commandes.forEach((commande: any) => {
          commande.colis.forEach((colis: any) => {
            volume += colis.volume;
          });
        });
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
      element.chauffeur === '' ? (estValide = false) : '';
    });
    return estValide;
  }

  //   bouton ok
  valider() {
    let couplesVehiculeChauffeurPrive = this.couplesVehiculeChauffeurPrive;
    let couplesVehiculeChauffeurLoue = this.couplesVehiculeChauffeurLoue;
    // for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
    //   console.log(this.chauffeursForms.controls[i].get('chauffeur').value);
    //   couplesVehiculeChauffeurPrive.push({
    //     vehicule: this.couplesVehiculeChauffeursPrives[i].vehicule,
    //     chauffeur: this.chauffeursForms.controls[i].get('chauffeur').value,
    //   });
    // }
    // for (let j = 0; j < this.vehiculesLoues.length; j++) {
    //   couplesVehiculeChauffeurLoue.push({
    //     vehicule: this.vehiculesLoues[j],
    //     chauffeur:
    //       this.chauffeursLouesForms.controls[j].get('chauffeurLoue').value,
    //   });
    // }
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
  chauffeurs: any = [];
  matricule: any;
  commandes: any;

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
  expandedElement: tableCommandes | null;
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

  async refresh() {
    console.log(this.data.mission);
    // rafraichier la liste des commandes et calcule du poids et surface global
    let idChauffeurs = this.data.mission.idChauffeur.split('/');
    this.matricule = this.data.mission.matricule.split('/');
    for (let i = 0; i < idChauffeurs.length; i++) {
      let chauffeur = await this.serviceChauffeur
        .employe(Number(19))
        .toPromise();
      this.chauffeurs.push(chauffeur);
    }
    await this.getListeCommandes();
  }

  get nbrCommandes() {
    return this.data.mission.idCommandes.split('/').length;
  }

  get poidsMission() {
    return this.data.mission.poids;
  }

  get volumeMission() {
    return this.data.mission.volume;
  }

  async getListeCommandes() {
    this.commandes = await this.serviceMission
      .getCommandesParIdMission(this.data.mission.id)
      .toPromise();
    console.log(this.commandes);
  }

  supprimerCommande(id: any) {
    // supprimer une commande
    this.serviceMission.supprimerCommande(id);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }
  terminerCommande(id: any) {
    //marquer une commande comme livrée
    var formData: any = new FormData();
    formData.append('etat', 'Done');
    this.serviceMission.majEtat(id, formData);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }
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
      data: { idCommande: id, mode: 'admin' },
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
    console.log(position);
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

  async getListeColis() {
    this.listeColis = await this.serviceMission
      .getListeColisParIdCommande(this.data.idCommande)
      .toPromise();
    console.log(this.listeColis);
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

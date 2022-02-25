import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SuivieCommandeService } from './services/suivie-commande.service';

@Component({
  selector: 'app-suivie-commande',
  templateUrl: './suivie-commande.component.html',
  styleUrls: ['./suivie-commande.component.scss'],
  animations: [
    trigger('statusRecherche', [
      state(
        'show',
        style({
          opacity: 1,
        })
      ),
      state(
        'hide',
        style({
          opacity: 0,
        })
      ),
      transition('show <=> hide', animate('500ms')),
    ]),
    trigger('statusInfoCommande', [
      state(
        'show',
        style({
          opacity: 1,
          position: 'relative',
        })
      ),
      state(
        'hide',
        style({
          opacity: 0,
          position: 'relative',
        })
      ),
      transition('show <=> hide', animate('500ms')),
    ]),
    trigger('statusPasCommande', [
      state(
        'show',
        style({
          opacity: 1,
          position: 'relative',
        })
      ),
      state(
        'hide',
        style({
          opacity: 0,
        })
      ),
      transition('show <=> hide', animate('500ms')),
    ]),
  ],
})
export class SuivieCommandeComponent implements OnInit {
  trackingNumber: any;
  commandes: any;
  commande: any;
  nouveauRecherche: any = true;
  dispo: any = false;
  mission: any;
  enTransit = false;
  livree = false;
  rechercheEstAffiche = true;
  rechercheEstActive = true;
  infoCommandeEstAffiche = false;
  infoCommandeEstActive = false;
  pasCommandeEstAffiche = false;
  pasCommandeEstActive = false;
  historique: any = [];
  constructor(public service: SuivieCommandeService) {}

  ngOnInit(): void {}
  rechercheCommande() {
    //rechercher une commande pour consulter son etat
    this.dispo = false;
    this.nouveauRecherche = false;
    this.service
      .commandeByTrackingNumber(this.trackingNumber)
      .subscribe((data) => {
        this.commandes = data;
        this.commandes.length > 0 ? (this.dispo = true) : (this.dispo = false);
        if (this.commandes.length === 1) {
          this.commande = this.commandes[0];
          this.service.mission(this.commande.idMission).subscribe((data) => {
            this.mission = data;
            (this.commande.etat === 'Affectée' &&
              this.mission.etat === 'En cours') ||
            this.commande.etat === 'Livrée'
              ? (this.enTransit = true)
              : (this.enTransit = false);
            this.commande.etat === 'Livrée'
              ? (this.livree = true)
              : (this.livree = false);
          });
          let listeHistorique = this.commande.historique.split('%');
          let dateCreation = this.commande.dateCreation.split("T")[0];
          dateCreation = dateCreation.split("-");
          let dateCreationStr = dateCreation[2] + "/" + dateCreation[1] + "/" + dateCreation[0];
          this.historique.push({
            etat: listeHistorique[0].split('#')[0],
            date: dateCreationStr
          });
          for (let i = 1; i < listeHistorique.length; i++) {
            const histo = listeHistorique[i];
            this.historique.push({
              etat: histo.split('#')[0],
              date: histo.split('#')[1].split(' ')[0],
              heure: histo.split('#')[1].split(' ')[1],
            });
          };
          console.log(this.historique);
        } else {
        }
        this.rechercheEstAffiche = false;
        setTimeout(() => {
          this.rechercheEstActive = false;
          console.log(this.dispo);
          this.dispo ? this.afficherInfoCommande() : this.afficherPasCommande();
        }, 500);
      });
  }

  // afficher input recherche
  afficherRecherche() {
    this.rechercheEstActive = true;
    setTimeout(() => {
      this.rechercheEstAffiche = true;
    }, 500);
  }

  // afficher la section d'info commande
  afficherInfoCommande() {
    this.infoCommandeEstActive = true;
    setTimeout(() => {
      this.infoCommandeEstAffiche = true;
    }, 500);
  }

  // afficher la section du pas de commande
  afficherPasCommande() {
    this.pasCommandeEstActive = true;
    setTimeout(() => {
      this.pasCommandeEstAffiche = true;
    }, 500);
  }

  refaireRecherche() {
    this.pasCommandeEstAffiche = false;
    this.infoCommandeEstAffiche = false;
    setTimeout(() => {
      this.pasCommandeEstActive = false;
      this.infoCommandeEstActive = false;
      this.afficherRecherche();
    }, 500);
  }

  // etat du section qui contient l'input de recherche "show" pour afficher, "hide" pour cacher
  get statusRecherche() {
    return this.rechercheEstAffiche ? 'show' : 'hide';
  }

  // etat du section qui contient l'info du commande' "show" pour afficher, "hide" pour cacher
  get statusInfoCommande() {
    return this.infoCommandeEstAffiche ? 'show' : 'hide';
  }

  // etat du section du non disponibilité de commande "show" pour afficher, "hide" pour cacher
  get statusPasCommande() {
    return this.pasCommandeEstAffiche ? 'show' : 'hide';
  }
}

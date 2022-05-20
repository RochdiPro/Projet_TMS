import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SuivieCommandeService } from './services/suivie-commande.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  adresseLivreur: string;
  constructor(
    public service: SuivieCommandeService,
    private activatedroute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // get adresse de la societé
    this.service.infosGenerals().subscribe((result) => {
      this.adresseLivreur = result.ville;
    });
    this.activatedroute.paramMap.subscribe(params => { 
      this.trackingNumber = params.get('tn');
      if (this.trackingNumber) {
        this.rechercheCommande();
      } 
  });
  }

  clickerChercher() {
    this.router.navigateByUrl("/Menu/TMS/suivie-commande/"+this.trackingNumber)
  }

  //rechercher une commande pour consulter son etat
  rechercheCommande() {
    if (!this.trackingNumber) return;
    this.dispo = false;
    this.nouveauRecherche = false;
    this.historique = [];
    // get commande by tracking number
    this.service
      .commandeByTrackingNumber(this.trackingNumber)
      .subscribe((data) => {
        this.commandes = data;
        // tester si il y'a une commande avec le tracking number fourni
        this.commandes.length > 0 ? (this.dispo = true) : (this.dispo = false);
        if (this.commandes.length === 1) {
          this.commande = this.commandes[0];
          // get mission qui contienne la commande séléctionnée
          this.service.mission(this.commande.idMission).subscribe((data) => {
            this.mission = data;
            // afficher l'etat convenable au commande
            (this.commande.etat === 'En cours de livraison' &&
              this.mission.etat === 'En cours') ||
            this.commande.etat === 'Livrée'
              ? (this.enTransit = true)
              : (this.enTransit = false);
            this.commande.etat === 'Livrée'
              ? (this.livree = true)
              : (this.livree = false);
          });
          // get historique de la commande et l'enregistrer dans array
          let listeHistorique = this.commande.historique.split('%');
          let dateCreation = this.commande.dateCreation.split('T')[0];
          dateCreation = dateCreation.split('-');
          let dateCreationStr =
            dateCreation[2] + '/' + dateCreation[1] + '/' + dateCreation[0];
          // la premiére etat dans historique est sans temps donc on l'enregistre au debut tout seul
          this.historique.push({
            etat: listeHistorique[0].split('#')[0],
            date: dateCreationStr,
            localisation: 'Sfax',
          });
          // on ajoute les autres etats dans l'historique avec le temps convenable
          for (let i = 1; i < listeHistorique.length; i++) {
            const histo = listeHistorique[i];
            let etat = histo.split('#')[0];
            let date = histo.split('#')[1].split(' ')[0];
            let heure = histo.split('#')[1].split(' ')[1].split('&')[0];
            let localisation;
            if (histo.split('#')[1].split(' ')[1].split('&').length > 1) {
              localisation = histo.split('#')[1].split(' ')[1].split('&')[1];
            } else {
              localisation = 'Sfax';
            }

            this.historique.push({
              etat: etat,
              date: date,
              heure: heure,
              localisation: localisation,
            });
          }
        }
        // passer au interface convenable selon disponibilité du commande
        this.rechercheEstAffiche = false;
        setTimeout(() => {
          this.rechercheEstActive = false;
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
    this.router.navigateByUrl("/Menu/TMS/suivie-commande")
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

  // afficher l'etat convenable a dessus des icons des etats
  afficherEtat(etat: string) {
    let status: string;
    switch (etat) {
      case 'en cours de traitement':
        status = 'Ce colis est en cours de traitement';
        break;
      case "en cours d'expédition":
        status = "Ce colis est en cours d'expédition";
        break;
      case 'en cours de livraison':
        status = 'Votre colis est en cours de livraison';
        break;
      case 'livrée':
        status = 'Colis bien livré';
        break;

      default:
        break;
    }
    return status;
  }
}

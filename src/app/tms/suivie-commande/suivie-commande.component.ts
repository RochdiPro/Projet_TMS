import { Component, OnInit } from '@angular/core';
import { SuivieCommandeService } from './services/suivie-commande.service';

@Component({
  selector: 'app-suivie-commande',
  templateUrl: './suivie-commande.component.html',
  styleUrls: ['./suivie-commande.component.scss'],
})
export class SuivieCommandeComponent implements OnInit {
  trackingNumber: any;
  commande: any;
  nouveauRecherche: any = true;
  dispo: any = false;
  mission: any;
  constructor(public service: SuivieCommandeService) {}

  ngOnInit(): void {}
  rechercheCommande() {
    //rechercher une commande pour consulter son etat
    this.dispo = false;
    this.nouveauRecherche = false;
    this.service.commandeByTrackingNumber(this.trackingNumber).subscribe((data) => {
      this.commande = data;
      console.log(this.commande.etat);
      this.service.mission(this.commande.idMission).subscribe((data) => {
        this.mission = data;
        console.log(this.mission.etat);
        console.log(this.mission.id);
        if (this.commande === null) {
          this.dispo = false;
        } else {
          this.dispo = true;
        }
      });
    });
  }
}

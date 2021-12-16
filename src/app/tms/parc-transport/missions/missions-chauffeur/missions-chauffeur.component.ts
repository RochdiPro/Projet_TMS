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
import { DetailCommande } from '../dialogs/dialogs.component';

@Component({
  selector: 'app-missions-chauffeur',
  templateUrl: './missions-chauffeur.component.html',
  styleUrls: ['./missions-chauffeur.component.scss'],
  animations: [
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
          top: '97vh',
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
  enCoursEstClique = true;
  enAttenteEstClique = false;
  enTermineEstClique = false;
  detailMissionEstAffiche = false;
  commandesAffiche = false;

  idChauffeur = 20;
  missions: any;

  lat = 0;
  lng = 0;
  zoom = 15;
  constructor(private serviceCommande: MissionsService, private dialog: MatDialog) {}

  ngOnInit() {
    this.getMissionsParIdChauffeur();
  }

  async getMissionsParIdChauffeur() {
    this.missions = await this.serviceCommande
      .getMissionsChauffeur(this.idChauffeur)
      .toPromise();
  }

  nbrCommandes(mission: any) {
    return mission.idCommandes.split('/').length;
  }

  poidsMission(mission: any) {
    return mission.poids;
  }

  volumeMission(mission: any) {
    return mission.volume;
  }

  get statusDetailMission() {
    return this.detailMissionEstAffiche ? 'show' : 'hide';
  }

  toggleDetailMission() {
    this.commandesAffiche = false
    this.detailMissionEstAffiche = !this.detailMissionEstAffiche;
  }

  get statusAfficherCommandes() {
    return this.commandesAffiche ? 'showCommandes' : 'hideCommandes';
  }

  toggleAfficherCommandes() {
    this.commandesAffiche = !this.commandesAffiche;
  }

  ouvrirDetailCommande() {
    const dialogRef = this.dialog.open(DetailCommande,{
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail',
    })
  }
}

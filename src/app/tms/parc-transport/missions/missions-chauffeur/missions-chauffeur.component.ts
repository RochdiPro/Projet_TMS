import { Component, OnInit } from '@angular/core';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-missions-chauffeur',
  templateUrl: './missions-chauffeur.component.html',
  styleUrls: ['./missions-chauffeur.component.scss'],
})
export class MissionsChauffeurComponent implements OnInit {
  enCoursEstClique = false;
  enAttenteEstClique = false;
  enTermineEstClique = false;

  idChauffeur = 20;
  missions: any;
  constructor(private serviceCommande: MissionsService) {}

  ngOnInit() {
    this.getMissionsParIdChauffeur()
  }

  async getMissionsParIdChauffeur() {
    this.missions = await this.serviceCommande
      .getMissionsChauffeur(this.idChauffeur)
      .toPromise();
  }

  nbrCommandes(mission: any) {
    return mission.idCommandes.split("/").length;
  }

  poidsMission (mission: any) {
    return mission.poids;
  }

  volumeMission(mission: any) {
    return mission.volume;
  }
}

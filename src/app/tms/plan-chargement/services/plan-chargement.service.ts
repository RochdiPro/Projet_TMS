import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";

@Injectable({
  providedIn: 'root'
})
export class PlanChargementService {
  handleError: any;
  constructor(private httpClient: HttpClient) { }

  //get vehicule par sa matricule
  public vehicule(matricule: string) {
    return this.httpClient.get(erp + 'vehicule-matricule', {
      params: {
        matricule: matricule
      }, observe: 'body'
    });
  }

  //get vehicule par sa matricule
  public vehiculeLoue(matricule: string) {
    return this.httpClient.get(erp + 'vehicule-loue-matricule', {
      params: {
        matricule: matricule
      }, observe: 'body'
    });
  }

  //filtrer les missions
  public filtrerMissions(nomChauffeur: any, matricule: any, etat: any) {
    return this.httpClient
      .get(erp + 'filtrer-missions', {
        params: {
          nom: nomChauffeur,
          matricule: matricule,
          etat: etat,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
  //get liste colis par id du mission
  public listeColisParMission(idMission: string) {
    return this.httpClient
      .get(erp + 'liste-colis-par-id-mission', {
        params: {
          idMission: idMission
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
  //get commande par id
  public commande(id: any) {
    return this.httpClient
      .get(erp + 'commande', {
        params: {
          id: id
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
}

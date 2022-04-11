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

   // modifier les id des commandes dans une mission
   public modifierIdCommandesDansMission(id: number, idCommandes: string) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('idCommandes', idCommandes);
    return this.httpClient
      .put(erp + 'modifier-id-commandes', formData)
      .pipe(catchError(this.handleError));
  }

  // enregistrer plan chargement
  public enregistrerPlanChargement(id: number, canvasTop: string, canvasFace: string, note: string) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('canvasTop', canvasTop);
    formData.append('canvasFace', canvasFace);
    formData.append('note', note);
    return this.httpClient
      .put(erp + 'enregistrer-canvas', formData)
      .pipe(catchError(this.handleError));
  }
}

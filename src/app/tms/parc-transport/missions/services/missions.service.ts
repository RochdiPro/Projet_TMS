import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class MissionsService {
  handleError: any;

  constructor(private httpClient: HttpClient) { }

  //creer mission
  public creerMission(formData: any) {
    return this.httpClient.post(erp + 'creer-mission', formData).pipe(catchError(this.handleError));
  }

  //lister les missions
  public missions() {
    return this.httpClient.get(erp + 'missions').pipe(catchError(this.handleError));
  }

  //charger une mission par id
  public mission(id: any) {
    return this.httpClient.get(erp + 'mission', {
      params: {
        id: id
      },observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // supprimer une mission
  public deleteMission(id: any) {
    return this.httpClient.delete(erp + "supprimer-mission", {
      params: {
        id: id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // mise a jour mission
  public updateMission(formData: any) {
    return this.httpClient.put(erp + 'mise-a-jour-mission', formData).pipe(catchError(this.handleError));
  }
  
  //filtrer les missions
  public filtrerMissions(nomChauffeur: any, matricule: any, etat: any) {
    return this.httpClient.get(erp + 'filtrer-missions', {
      params: {
        nom: nomChauffeur,
        matricule: matricule,
        etat: etat
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //filtrer les missions par le matricule du vehicule et par nom chauffeur
  // public filtrerMissionsVehiculeChauffeur(vehicule : any, chauffeur : any) {
  //   return this.httpClient.get(erp + 'filtrerMissionsVehiculeChauffeur' + '?vehicule=' + vehicule + '&chauffeur=' + chauffeur);
  // }

   // get liste des commandes
   public commandes() {
    return this.httpClient.get(erp + 'commandes');
  }
  // get commande par son id
  public commande(id: any) {
    return this.httpClient.get(erp + 'commande', {
      params: {
        id: id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }
  // get commandes par son etat
  public getCommandesParEtat(etat: any) {
    return this.httpClient.get(erp + 'commandes-etat', {
      params:{
        etat: etat
      },observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // get commandes par id mission
  public getCommandesParIdMission(idMission: any) {
    return this.httpClient.get(erp + "commandes-id-mission", {
      params: {
        idMission: idMission
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // getMissionsChauffeur
  public getMissionsChauffeur(idChauffeur: any) {
    return this.httpClient.get(erp + "missions-chauffeur", {
      params: {
        idChauffeur: idChauffeur 
      }, observe: "body"
    }).pipe(catchError(this.handleError));
  }

  public majEtat(id: any, formData: any) {
    this.httpClient.put(erp + 'miseajouretat/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public creerCommande(formData: any) {
    this.httpClient.post(erp + 'createCommande', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public filtrerCommande(champ: any, valeur: any) {
    return this.httpClient.get(erp + 'filtrerCommande' + '?champ=' + champ + '&valeur=' + valeur);
  }
  public supprimerCommande(id: any) {
    this.httpClient.delete(erp + 'deleteCommande/' + id).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
}

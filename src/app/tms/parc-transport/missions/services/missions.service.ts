import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class MissionsService {

  constructor(private httpClient: HttpClient) { }

  //creer mission
  public creerMission(formData: any) {
    this.httpClient.post(erp + 'creerMission', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  //lister les missions
  public missions() {
    return this.httpClient.get(erp + 'missions');
  }

  //charger une mission par id
  public mission(id: any) {
    return this.httpClient.get(erp + 'mission')
  }
  
  //filtrer les missions
  public filtrerMissions(champ1: any, valeur1: any, champ2: any, valeur2: any, champ3: any, valeur3: any, champ4: any, valeur4: any) {
    return this.httpClient.get(erp + 'filtrerMissions' + '?champ1=' + champ1 + '&valeur1=' + valeur1 + '&champ2=' + champ2 + '&valeur2=' + valeur2 + '&champ3=' + champ3 + '&valeur3=' + valeur3 + '&champ4=' + champ4 + '&valeur4=' + valeur4);
  }

  //filtrer les missions par le matricule du vehicule et par nom chauffeur
  public filtrerMissionsVehiculeChauffeur(vehicule : any, chauffeur : any) {
    return this.httpClient.get(erp + 'filtrerMissionsVehiculeChauffeur' + '?vehicule=' + vehicule + '&chauffeur=' + chauffeur);
  }

  public majEtat(id: any, formData: any) {
    this.httpClient.put(erp + 'miseajouretat/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public commandes() {
    return this.httpClient.get(erp + 'commandes');
  }
  public commande(id: any) {
    return this.httpClient.get(erp + 'commande/' + id);
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

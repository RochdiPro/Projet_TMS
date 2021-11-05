import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class ChauffeurService {

  constructor(private httpClient: HttpClient) { }

  
  //lister les employes
  public employes() {
    return this.httpClient.get(infonet + 'Employes');
  }

  //charger un employe par ID
  public employe(id: any) {
    return this.httpClient.get(infonet + 'Employe' + "?Id=" + id);
  }

  //filtrer liste chauffeur
  public filtrerChauffeur(champ: any, valeur: any) {
    return this.httpClient.get(infonet + 'Filtre_Employe' + '?Champ=' + champ + '&Valeur=' + valeur);
  }

  //charger image employe
  public imageEmploye(id: any) {
    return this.httpClient.get(infonet + 'Image_Employe' + '?Id=' + id);

  }

}

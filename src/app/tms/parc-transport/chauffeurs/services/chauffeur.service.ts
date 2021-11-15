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
    return this.httpClient.get(infonet + 'Employees');
  }

  //charger un employe par ID
  public employe(id: any) {
    return this.httpClient.get(infonet + 'Employee' + "?Id=" + id);
  }

  //filtrer liste chauffeur
  public filtrerChauffeur(champ: any, valeur: any) {
    return this.httpClient.get(infonet + 'Filtre_Employee' + '?Champ=' + champ + '&Valeur=' + valeur);
  }

  //charger image employe
  public imageEmploye(id: any) {
    return this.httpClient.get(infonet + 'Image_Employee' + '?Id=' + id);

  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
const erp = '/ERP/';
const infonet = '/INFONET/';
@Injectable({
  providedIn: 'root',
})
export class ChauffeurService {
  handleError: any;

  constructor(private httpClient: HttpClient) {}

  //get configuration application
  public configurationApplication() {
    return this.httpClient
      .get(erp + 'configuration-application')
      .pipe(catchError(this.handleError));
  }

  //les services du mode connecté
  //lister les employes
  public employes() {
    return this.httpClient.get(infonet + 'Employees');
  }

  //charger un employe par ID
  public employe(id: any) {
    return this.httpClient
      .get(infonet + 'Employee', {
        params: {
          Id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //filtrer liste chauffeur
  public filtrerChauffeur(champ: any, valeur: any) {
    return this.httpClient.get(
      infonet + 'Filtre_Employee' + '?Champ=' + champ + '&Valeur=' + valeur
    );
  }

  //charger image employe
  public imageEmploye(id: any) {
    return this.httpClient.get(infonet + 'Image_Employee' + '?Id=' + id);
  }

  //get liste des chauffeurs
  public getChauffeurs() {
    return this.httpClient
      .get(infonet + 'Filtre_Employee', {
        params: {
          Champ: 'role',
          Valeur: 'chauffeur',
        },
      })
      .pipe(catchError(this.handleError));
  }

  //les services du mode non connecté
  //lister les employes
  public employesManuel() {
    return this.httpClient.get(erp + 'Employees');
  }

  //charger un employe par ID
  public employeManuel(id: any) {
    return this.httpClient
      .get(erp + 'Employee', {
        params: {
          Id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //filtrer liste chauffeur
  public filtrerChauffeurManuel(champ: any, valeur: any) {
    return this.httpClient.get(
      erp + 'Filtre_Employee' + '?Champ=' + champ + '&Valeur=' + valeur
    );
  }

  //charger image employe
  public imageEmployeManuel(id: any) {
    return this.httpClient.get(erp + 'Image_Employee' + '?Id=' + id);
  }

  //get liste des chauffeurs
  public getChauffeursManuel() {
    return this.httpClient
      .get(erp + 'Filtre_Employee', {
        params: {
          Champ: 'role',
          Valeur: 'chauffeur',
        },
      })
      .pipe(catchError(this.handleError));
  }
}

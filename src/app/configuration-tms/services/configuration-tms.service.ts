import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ConfigurationExcel } from '../interfaces/configuration-excel';
const erp = '/ERP/';
const infonet = '/INFONET/';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationTmsService {
  handleError: any;
  constructor(private httpClient: HttpClient) {}

  //get coefficients frais de livraison
  public fraisLivraison() {
    return this.httpClient
      .get(erp + 'frais-livraison')
      .pipe(catchError(this.handleError));
  }

  //creation du configuration du fichier excel
  public createConfigExcel(config: ConfigurationExcel) {
    return this.httpClient
      .post(erp + 'creer-configuration-excel', config)
      .pipe(catchError(this.handleError));
  }

  //charger la configuration excel enregistrée
  public configurationExcel() {
    return this.httpClient
      .get(erp + 'configuration-excel')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour la configuration excel
  public miseajourvehicule(config: ConfigurationExcel) {
    return this.httpClient
      .put(erp + 'modifier-configuration-excel', config)
      .pipe(catchError(this.handleError));
  }
}

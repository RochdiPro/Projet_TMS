import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
const erp = "/ERP/";
const infonet = "/INFONET/";

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  handleError: any;
  supp: any


  constructor(private httpClient: HttpClient) { }

  
  //get liste supports
  public supports() {
    return this.httpClient.get(erp + 'supports').pipe(catchError(this.handleError));
  }

  //get support
  public support() {
    return this.httpClient.get(erp + 'support').pipe(catchError(this.handleError));
  }

  //créer support
  public creerSupport(formData: any){
    return this.httpClient.post(erp + 'creer-support', formData).pipe(catchError(this.handleError));
  }

  //modifier support
  public modifierSupport(formData: any){
    return this.httpClient.put(erp + 'modifier-support', formData).pipe(catchError(this.handleError));
  }

  //supprimer support
  public supprimerSupport(id: any){
    return this.httpClient.delete(erp + "supprimer-support" , {
      params:{
        id: id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //filtrer par champ
  public filtrerSupports(champ: any, valeur: any){
    return this.httpClient.get(erp + 'filtre-support', {
      params:{
        champ: champ,
        valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

}

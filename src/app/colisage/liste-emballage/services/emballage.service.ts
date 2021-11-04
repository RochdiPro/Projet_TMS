import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";

@Injectable({
  providedIn: 'root'
})
export class EmballageService {
  handleError: any;

  constructor(private httpClient: HttpClient) { }

  //créer nouveau produit dans la liste d'emballage
  public creerProduitEmballe(formData: any) {
    return this.httpClient.post(erp + 'creer-emballage', formData).pipe(catchError(this.handleError))
  }

  //lister les produits emballés dans la liste d'emballage'
  public listeEmballage() {
    return this.httpClient.get(erp + 'emballages').pipe(catchError(this.handleError));
  }

  public getEmballage(id: any){
    return this.httpClient.get(erp + 'emballage', id)
  }


  //filtrer emballages
  public fltreListeproduit(champ1 : any, valeur1 : any, champ2 : any, valeur2 : any, champ3 : any, valeur3 : any){
    return this.httpClient.get(erp + 'filtre-emballage', {
      params: {
        champ1: champ1,
        valeur1: valeur1,
        champ2: champ2,
        valeur2: valeur2,
        champ3: champ3,
        valeur3: valeur3
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //lister les produits dans la fiche produits
  public listeProduits() {
    return this.httpClient.get(infonet + 'Fiche_Produits');
  }

  //get produit by id
  public produit(id :any) {
    return this.httpClient.get(infonet + 'Fiche_Produit' , {
      params: {
        id : id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }


  //Filtre fiche produits
  public filtreProduits(champ: any, valeur: any) {
    return this.httpClient.get(infonet + 'Filtre_Fiche_Produit', {
      params: {
        Champ: champ,
        Valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class ColisageService {
  handleError : any;
  constructor(private http: HttpClient) { }

  //créer nouveau produit dans la liste de colisage
  public creerProduitEmballe(formData: any) {
    this.http.post(erp + 'creerProduitEmballe', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  //lister les produits emballés dans la liste de colisage 
  public listeColisage() {
    return this.http.get(erp + 'listeColisage');
  }

  //lister les produits dans la fiche produits
  public listeProduits(){
    return this.http.get(infonet + 'Fiche_Produits');
  }
 

  //Filtre fiche produits
  public filtreProduits(champ: any, valeur: any){
    return this.http.get(infonet + 'Filtre_Fiche_Produit',  {
      params: {
        Champ: champ,
        Valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }
}

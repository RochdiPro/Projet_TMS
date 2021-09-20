import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class ColisageService {
  handleError: any;
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

  public getEmballage(id: any){
    return this.http.get(erp + 'produitEmballe', id)
  }


  //filtrer liste colisage
  public fltreListeproduit(champ1 : any, valeur1 : any, champ2 : any, valeur2 : any, champ3 : any, valeur3 : any){
    return this.http.get(erp + 'filtreListeColisage', {
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
    return this.http.get(infonet + 'Fiche_Produits');
  }

  //lister les produits dans la fiche produits
  public produit(id :any) {
    return this.http.get(infonet + 'Fiche_Produit' , {
      params: {
        id : id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }


  //Filtre fiche produits
  public filtreProduits(champ: any, valeur: any) {
    return this.http.get(infonet + 'Filtre_Fiche_Produit', {
      params: {
        Champ: champ,
        Valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }
}

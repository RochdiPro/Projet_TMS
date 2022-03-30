import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Produit } from '../classes/produit';
const erp = '/ERP/';
@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  handleError: any;
  constructor(private httpClient: HttpClient) {}

  // get liste produits
  public produits() {
    return this.httpClient.get(erp + 'produits');
  }

  // get produit par id
  public produit(id: string) {
    return this.httpClient.get(erp + 'produit', {
      params: {
        id: id,
      },
      observe: 'body',
    });
  }

  // créer nouveau produit
  public creerProduit(produit: Produit) {
    return this.httpClient
      .post(erp + 'creer-produit', produit)
      .pipe(catchError(this.handleError));
  }

  // modifier produit
  public modifierProduit(produit: Produit) {
    return this.httpClient
      .put(erp + 'modifier-produit', produit)
      .pipe(catchError(this.handleError));
  }

  // supprimer produit
  public supprimerProduit(id: string) {
    return this.httpClient.delete(erp + 'delete-produit', {
      params: { id: id },
      observe: 'body',
    }).pipe(catchError(this.handleError));
  }
}

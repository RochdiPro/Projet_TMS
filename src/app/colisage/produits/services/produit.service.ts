import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Backup } from '../classes/backup';
import { Produit } from '../classes/produit';
const erp = '/ERP/';
@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  handleError: any;
  prod: Produit;
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
    return this.httpClient
      .delete(erp + 'delete-produit', {
        params: { id: id },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // filtrer produit produits
  public filtrerProduits(id: string, marque: string, nom: string) {
    return this.httpClient
      .get(erp + 'filtre-produit', {
        params: {
          id: id,
          marque: marque,
          nom: nom,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get les backups
  public getBackup(): Observable<Backup> {
    return this.httpClient
      .get<Backup>(erp + 'get-backups-produits');
  }

  // restaurer la liste des produits depuis un fichier backup
  public restaurerListeProduit(numBackup: string) {
    let formData = new FormData()
    formData.append("numBackup", numBackup)
    return this.httpClient
      .put(erp + 'restaurer-liste-produits', formData)
      .pipe(catchError(this.handleError));
  }

  //ajouter un nouveau backup
  public ajouterBackup(file: File) {
    let formData = new FormData();
    formData.append('file', file);
    return this.httpClient
      .post(erp + 'creer-backup-produits', formData)
      .pipe(catchError(this.handleError));
  }

    // api exporter liste produit
    public exporterListeProduit() {
      return this.httpClient
        .get(erp + 'exporter-produits', {responseType: 'blob'});
    }
}

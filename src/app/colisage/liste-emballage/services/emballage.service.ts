import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ConfigurationApplication } from 'src/app/configuration-tms/classes/configuration-application';

const erp = '/ERP/';
const infonet = '/INFONET/';

@Injectable({
  providedIn: 'root',
})
export class EmballageService {
  handleError: any;

  constructor(private httpClient: HttpClient) {}

  //créer nouveau produit dans la liste d'emballage
  public creerProduitEmballe(formData: any) {
    return this.httpClient
      .post(erp + 'creer-emballage', formData)
      .pipe(catchError(this.handleError));
  }

  //lister les produits emballés dans la liste d'emballage'
  public listeEmballage() {
    return this.httpClient
      .get(erp + 'emballages')
      .pipe(catchError(this.handleError));
  }

  public getEmballage(id: any) {
    return this.httpClient.get(erp + 'emballage', id);
  }

  //filtrer emballages
  public fltreListeEmballagePlusieursChammps(
    id: any,
    nomEmballage: any,
    typeEmballage: any,
    nomProduit: any,
    qte: any,
    unite: any,
    poids: any,
    volume: any
  ) {
    return this.httpClient
      .get(erp + 'filtre-plusieurs-champs-emballage', {
        params: {
          id: id,
          nomEmballage: nomEmballage,
          type: typeEmballage,
          nomProduit: nomProduit,
          quantite: qte,
          unite: unite,
          poids: poids,
          volume: volume,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //lister les produits dans la fiche produits
  public listeProduits() {
    return this.httpClient.get(infonet + 'Fiche_Produits');
  }

  //get produit by id
  public produit(id: any) {
    return this.httpClient
      .get(infonet + 'Fiche_Produit', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //Filtre fiche produits
  public filtreProduits(champ: any, valeur: any) {
    return this.httpClient
      .get(infonet + 'Filtre_Fiche_Produit', {
        params: {
          Champ: champ,
          Valeur: valeur,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get liste produits mode manuel
  public produitsManuel() {
    return this.httpClient.get(erp + 'produits');
  }

  //get configuration application
  public configurationApplication() {
    return this.httpClient
      .get<ConfigurationApplication>(erp + 'configuration-application')
      .pipe(catchError(this.handleError));
  }
}

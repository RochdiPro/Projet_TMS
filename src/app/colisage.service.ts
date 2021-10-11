import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class ColisageService {
  handleError: any;
  constructor(private httpClient: HttpClient) { }

  //créer nouveau produit dans la liste de colisage
  public creerProduitEmballe(formData: any) {
    return this.httpClient.post(erp + 'creerProduitEmballe', formData).pipe(catchError(this.handleError))
  }

  //lister les produits emballés dans la liste de colisage 
  public listeColisage() {
    return this.httpClient.get(erp + 'listeColisage');
  }

  public getEmballage(id: any){
    return this.httpClient.get(erp + 'produitEmballe', id)
  }


  //filtrer liste colisage
  public fltreListeproduit(champ1 : any, valeur1 : any, champ2 : any, valeur2 : any, champ3 : any, valeur3 : any){
    return this.httpClient.get(erp + 'filtreListeColisage', {
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

  //lister les produits dans la fiche produits
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

  //charger la liste des factures
  public factures(){
    return this.httpClient.get(infonet + 'Factures');
  }
  
  //Filtre Facture
  public filtreFacture(Champ: any, Valeur: any) {
    return this.httpClient.get(infonet + 'Filtre_Facture', {
      params: {
        Champ: Champ,
        Valeur: Valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }
  //Filtre Bon Livraison
  public filtreBonLivraison(Champ: any, Valeur: any) {
    return this.httpClient.get(infonet + 'Filtre_Bon_Livraison', {
      params: {
        Champ: Champ,
        Valeur: Valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //charger la liste des Bons de livraison
  public bonLivraisons(){
    return this.httpClient.get(infonet + 'Bon_Livraisons');
  }
  //charger Client
  public client(idClt: any){
    return this.httpClient.get(infonet + 'Client', {
      params: {
        Id_Clt : idClt
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //charger Les details du facture
  public  Detail_Facture(Id: any): Observable<any> {

    return this.httpClient.get(infonet + "Detail_Facture"
      , {
        params: {
          Id_Facture: Id
        }, responseType: 'blob'
      }).pipe(catchError(this.handleError))
  }

  //charger Les details du bon livraison
  public  Detail_BL(Id: any): Observable<any> {

    return this.httpClient.get(infonet + "Detail_Bon_Livraison"
      , {
        params: {
          Id_BL: Id
        }, responseType: 'blob'
      }).pipe(catchError(this.handleError))
  }

  //get liste supports
  public supports() {
    return this.httpClient.get(erp + 'Supports').pipe(catchError(this.handleError));
  }

  //get support
  public support() {
    return this.httpClient.get(erp + 'Support').pipe(catchError(this.handleError));
  }

  //créer support
  public creerSupport(formData: any){
    return this.httpClient.post(erp + 'Creer_Support', formData).pipe(catchError(this.handleError));
  }

  //modifier support
  public modifierSupport(formData: any){
    return this.httpClient.put(erp + 'modifierSupport', formData).pipe(catchError(this.handleError));
  }

  //supprimer support
  public supprimerSupport(id: any){
    return this.httpClient.delete(erp + "supprimerSupport" , {
      params:{
        id: id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //filtrer par champ
  public filtrerSupports(champ: any, valeur: any){
    return this.httpClient.get(erp + 'filtreSupport', {
      params:{
        champ: champ,
        valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }
}

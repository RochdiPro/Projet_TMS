import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  handleError: any;

  constructor(private httpClient: HttpClient) { }

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

  //charger liste Clients
  public clients(){
    return this.httpClient.get(infonet + 'Clients').pipe(catchError(this.handleError));
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

   //get position client by id client
   public positionClient(idClient: any) {
    return this.httpClient.get(erp + 'position-client-id-client' , {
      params: {
        idClient: idClient
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //get dernier id position client
  public dernierPositionClient(){
    return this.httpClient.get(erp + 'dernier-position-client').pipe(catchError(this.handleError));
  }

  //get position by id
  public getPositionById(id: any){
    return this.httpClient.get(erp + 'position-client', {
      params:{
        id: id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //create position client
  public creerPositionClient(formData: any) {
    return this.httpClient.post(erp + 'position-client', formData).pipe(catchError(this.handleError));
  }

  //modifier position client
  public modifierPositionClient(formData: any) {
    return this.httpClient.put(erp + 'position-client', formData).pipe(catchError(this.handleError))
  }

   //ajouter produit au table liste colisage
   public creerColis(formData: any){
    return this.httpClient.post(erp + 'creer-colis', formData).pipe(catchError(this.handleError));
  }

  //get liste des colis par reference commande
  public getListeColisParReference(reference: any){
    return this.httpClient.get(erp + 'liste-colis-par-reference', {
      params: {
        reference: reference
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //delete from liste colisage by reference
  public deleteColisParReference(reference: any){
    return this.httpClient.delete(erp + 'supprimer-par-reference',{
      params: {
        reference: reference
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // creer commande
  public creerCommande(formData: any){
    return this.httpClient.post(erp + 'creer-commande', formData).pipe(catchError(this.handleError))
  }

  //get liste commande
  public getListeCommandes(){
    return this.httpClient.get(erp + 'commandes').pipe(catchError(this.handleError))
  }

  //modifier l'id du position dans le table commande
  public modifierIdPositionDansTableCommande(formData: any) {
    return this.httpClient.put(erp + 'modifier-id-position', formData).pipe(catchError(this.handleError));
  }

  //supprimer commande
  public supprimerCommande(id: any) {
    return this.httpClient.delete(erp + 'supprimer-commande', {
      params: {
        id: id
      }
    }).pipe(catchError(this.handleError));
  }
}

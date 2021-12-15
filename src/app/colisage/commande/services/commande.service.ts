import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const erp = '/ERP/';
const infonet = '/INFONET/';
@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  handleError: any;

  constructor(private httpClient: HttpClient) {}

  //charger la liste des factures
  public factures() {
    return this.httpClient.get(infonet + 'Factures');
  }

  // get facture par son id
  public facture(id: any) {
    return this.httpClient
      .get(infonet + 'Facture', {
        params: {
          Id: id,
        },
      })
      .pipe(catchError(this.handleError));
  }

  //Filtre Facture
  public filtreFacture(Champ: any, Valeur: any) {
    return this.httpClient
      .get(infonet + 'Filtre_Facture', {
        params: {
          Champ: Champ,
          Valeur: Valeur,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
  //Filtre Bon Livraison
  public filtreBonLivraison(Champ: any, Valeur: any) {
    return this.httpClient
      .get(infonet + 'Filtre_Bon_Livraison', {
        params: {
          Champ: Champ,
          Valeur: Valeur,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //charger la liste des Bons de livraison
  public bonLivraisons() {
    return this.httpClient.get(infonet + 'Bon_Livraisons');
  }

  // get Bon Livraison par son id
  public bonLivraison(id: any) {
    return this.httpClient
      .get(infonet + 'Bon_Livraison', {
        params: {
          Id: id,
        },
      })
      .pipe(catchError(this.handleError));
  }

  //charger liste Clients
  public clients() {
    return this.httpClient
      .get(infonet + 'Clients')
      .pipe(catchError(this.handleError));
  }
  //charger Client
  public client(idClt: any) {
    return this.httpClient
      .get(infonet + 'Client', {
        params: {
          Id_Clt: idClt,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //charger Les details du facture
  public Detail_Facture(Id: any): Observable<any> {
    return this.httpClient
      .get(infonet + 'Detail_Facture', {
        params: {
          Id_Facture: Id,
        },
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError));
  }

  //charger Les details du bon livraison
  public Detail_BL(Id: any): Observable<any> {
    return this.httpClient
      .get(infonet + 'Detail_Bon_Livraison', {
        params: {
          Id_BL: Id,
        },
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError));
  }

  //get position client by id client
  public positionClient(idClient: any) {
    return this.httpClient
      .get(erp + 'position-client-id-client', {
        params: {
          idClient: idClient,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //get dernier id position client
  public dernierPositionClient() {
    return this.httpClient
      .get(erp + 'dernier-position-client')
      .pipe(catchError(this.handleError));
  }

  //get position by id
  public getPositionById(id: any) {
    return this.httpClient
      .get(erp + 'position-client', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //create position client
  public creerPositionClient(formData: any) {
    return this.httpClient
      .post(erp + 'position-client', formData)
      .pipe(catchError(this.handleError));
  }

  //modifier position client
  public modifierPositionClient(formData: any) {
    return this.httpClient
      .put(erp + 'position-client', formData)
      .pipe(catchError(this.handleError));
  }

  //ajouter produit au table liste colisage
  public creerColis(formData: any) {
    return this.httpClient
      .post(erp + 'creer-colis', formData)
      .pipe(catchError(this.handleError));
  }

  //get liste des colis par id commande
  public getListeColisParIdCommande(idCommande: any) {
    return this.httpClient
      .get(erp + 'liste-colis-par-id-commande', {
        params: {
          idCommande: idCommande,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //delete from liste colisage by id commande
  public deleteColisParIdCommande(idCommande: any) {
    return this.httpClient
      .delete(erp + 'supprimer-par-id-commande', {
        params: {
          idCommande: idCommande,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // creer commande
  public creerCommande(formData: any) {
    return this.httpClient
      .post(erp + 'creer-commande', formData)
      .pipe(catchError(this.handleError));
  }

  //get liste commande
  public getListeCommandes() {
    return this.httpClient
      .get(erp + 'commandes')
      .pipe(catchError(this.handleError));
  }

  //get la derniere cmmmande enregistrée
  public getDerniereCommande() {
    return this.httpClient
      .get(erp + 'dernier-enregistrement-commande')
      .pipe(catchError(this.handleError));
  }

  //modifier l'id du position dans le table commande
  public modifierIdPositionDansTableCommande(formData: any) {
    return this.httpClient
      .put(erp + 'modifier-id-position', formData)
      .pipe(catchError(this.handleError));
  }

  //modifier l'etat du commande
  public modifierEtatCommande(formData: any) {
    return this.httpClient
      .put(erp + 'modifier-etat-commande', formData)
      .pipe(catchError(this.handleError));
  }

  //supprimer commande
  public supprimerCommande(id: any) {
    return this.httpClient
      .delete(erp + 'supprimer-commande', {
        params: {
          id: id,
        },
      })
      .pipe(catchError(this.handleError));
  }

  // get les coefficients du score de la commande
  public getCoefficientsScoreCommande() {
    return this.httpClient
      .get(erp + 'score-commande')
      .pipe(catchError(this.handleError));
  }

  // get liste commandes en mode manuel
  public commandesModeManuel(date: any) {
    return this.httpClient
      .get(erp + 'commandes-mode-manuel', {
        params: {
          date: date,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get liste des dates disponibles dans dossier DATA
  public datesDisponibles() {
    return this.httpClient
      .get(erp + 'dates-disponibles')
      .pipe(catchError(this.handleError));
  }

  // generer les fichiers xml a partir des fichiers excel
  public genererXML() {
    return this.httpClient
      .get(erp + 'creer-fichiers-xml')
      .pipe(catchError(this.handleError));
  }

  // get le fichier xml d'une commande
  public loadXML(date: string, nomFichier: string) {
    return this.httpClient
      .get('assets/DATA/' + date + '/Xmls/' + nomFichier, {
        headers: new HttpHeaders()
          .set('Content-Type', 'text/xml')
          .append('Access-Control-Allow-Methods', 'GET')
          .append('Access-Control-Allow-Origin', '*')
          .append(
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method'
          ),
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError));
  }

  // modifier l'etat du commande manuel dans le fichier excel
  public modifierEtatCommandeDansExcel(
    date: string,
    type: string,
    nomFichier: string,
    nouveauEtat: string
  ) {
    let formData: any = new FormData();
    formData.append('date', date);
    formData.append('type', type);
    formData.append('nomFichier', nomFichier);
    formData.append('nouveauEtat', nouveauEtat);

    return this.httpClient
      .put(erp + 'changer-etat-commande-manuel', formData)
      .pipe(catchError(this.handleError));
  }

  // modifier l'etat du facture
  public modifierEtatFacture(formData: any) {
    this.httpClient.post(infonet + 'Changer_Etat_Facture', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }

  // modifier l'etat du Bon Livraison
  public modifierEtatBonLivraison(formData: any) {
    this.httpClient.post(infonet + 'Changer_Etat_BL', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }
}

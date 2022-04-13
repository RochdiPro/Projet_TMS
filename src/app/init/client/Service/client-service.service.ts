import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
const erp = '/ERP/';
const infonet = '/INFONET/';

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {

  constructor(private http: HttpClient) { }
  private gererErreur(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Une erreur s' + "'" + 'est produite:', error.error.message);
    } else {
      console.error(
        `Code renvoyé par le backend ${error.status}, ` +
        `le contenu était: ${error.error}`);
    }
    return throwError(
      'Veuillez réessayer plus tard.');
  }
  filtre_6champs (champ1 : any, valeur1 : any, champ2 : any, valeur2 : any, champ3 : any, valeur3 : any ,champ4 : any, valeur4 : any, champ5 : any, valeur5 : any, champ6 : any, valeur6 : any)
  {
    return this.http.get(erp + 'Filtre_Client_6_Champs', {
      params: {
        Champ1: champ1,
        Valeur1: valeur1,
        Champ2: champ2,
        Valeur2: valeur2,
        Champ3: champ3,
        Valeur3: valeur3,
        Champ4: champ4,
        Valeur4: valeur4,
        Champ5: champ5,
        Valeur5: valeur5,
        Champ6: champ6,
        Valeur6: valeur6,
        
      }, observe: 'body'
    }).pipe()

  }

  // récupérer image du Client
  Image_Client(id: any) {
    return this.http.get(erp + 'Client_Image', {
      params: {
        Id_Clt: id
      }, responseType: 'blob'
    });
  }
  // Obtenir la liste des champs du fiche Client 
  obtenirListeChampsClient(): Observable<any> {
    return this.http.get(erp + 'Liste_Champs_Client', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }

  // Filtrer liste du Client
  filtrerClient(champ: any, valeur: any): Observable<any> {

    return this.http.get(erp + 'Filtre_Client/', {
      params: {
        Champ: champ,
        Valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.gererErreur))

  }
  // récupérer la region  du Client 
  ListerRegion(ville: any): Observable<any> {
    return this.http.get(infonet + 'Categorie_Region', {
      params: {
        Ville: ville
      }, observe: 'body'
    }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer la ville  du Client 
  ListerVille(pays: any): Observable<any> {
    return this.http.get(infonet + 'Categorie_Ville', {
      params: {
        Pays: pays
      }, observe: 'body'
    }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer les pays 
  ListerPays(): Observable<any> {
    return this.http.get(infonet + 'Categorie_Pays', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer les catégories banques du Client 
  ListerBanques(): Observable<any> {
    return this.http.get(infonet + 'Categorie_Banque', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer les catégories du Client 
  ListerCategorieClient(): Observable<any> {
    return this.http.get(infonet + 'Categorie_Client', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer les categories fiscales du Client 
  ListerCategorieFiscale(): Observable<any> {
    return this.http.get(infonet + 'Categorie_Fiscale', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer les categories de pièce d'identité du Client 
  ListerCategoriePiece(): Observable<any> {
    return this.http.get(infonet + 'Categorie_Piece', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }
  // récupérer la liste des Clients
  ListeClients(): Observable<any> {
    return this.http.get(erp + 'Clients')
      .pipe(catchError(this.gererErreur)
      );
  }
  //  récupérer le Client selon son identifient
  Client(id:any): Observable<any> {
    return this.http.get(erp + 'Client/', {
      params: {
        Id_Clt: id
      }, observe: 'body'
    }).pipe(catchError(this.gererErreur)
    );
  }
  // ajouter un Client 
  ajouterClient(Client: any) {

    return this.http.post(erp + 'Creer_Client', Client, { observe: "response" })
  }

  // suppression d'un Client par identifiant 
  SupprimerClient(formData: any) {

    return this.http.delete(erp + 'Supprimer_Client/', {
      params: {
        Id_Clt: formData
      }, observe: 'response'
    }).toPromise()
      .then(response => {
        console.log(response);
      })
      .catch(console.log);
  }

  // modification d'un Client par id
  ModifierClient(Client: any): Observable<any> {
    return this.http.post(erp + 'Modifier_Client', Client).pipe(
      catchError(this.gererErreur)
    );
  }
}

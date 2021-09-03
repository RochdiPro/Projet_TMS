import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
const infonet = '/ERP/';

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

   
  // Obtenir la liste des champs du fiche Client 
  obtenirListeChampsClient(): Observable<any> {
    return this.http.get(infonet + 'Liste_Champs_Client', { observe: 'body' }).pipe(catchError(this.gererErreur)
    );
  }

  // Filtrer liste du Client
  filtrerClient(champ: any, valeur: any): Observable<any> {

    return this.http.get(infonet + 'Filtre_Client/', {
      params: {
        Champ: champ,
        Valeur: valeur
      }, observe: 'body'
    }).pipe(catchError(this.gererErreur))

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
    return this.http.get(infonet + 'Clients')
      .pipe(catchError(this.gererErreur)
      );
  }
 

  // modification d'un Client par id
  ModifierClient(Client: any): Observable<any> {
    return this.http.post(infonet + 'Modifier_Client', Client).pipe(
      catchError(this.gererErreur)
    );
  }
}

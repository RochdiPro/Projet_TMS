import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const infonet = '/ERP/';
@Injectable({
  providedIn: 'root',
})
export class EditService {
  constructor(private http: HttpClient) {}
  //Obtenir la liste des champs des catégories
  obtenirListeCategorie(): Observable<any> {
    return this.http
      .get(infonet + 'Liste_Categorie', { observe: 'body' })
      .pipe(catchError(this.handleError()));
  }
  //Obtenir les données d'une catégorie parmis la liste des catégories
  obtenirCategorie(categorie: String): Observable<any> {
    return this.http
      .get(infonet + categorie, { observe: 'body' })
      .pipe(catchError(this.handleError()));
  }
  //Obtenir catégorie famille,sous-famille et type2
  obtenirCategorie2(categorie: String, type: string): Observable<any> {
    return this.http
      .get(infonet + categorie, {
        params: {
          Type: type,
          Pays: type,
          Ville: type,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError()));
  }
  //Ajouter données à la catégorie choisie
  ajouterDonneesCategorie(donnees: any, categorie: String) {
    return this.http.post(infonet + 'Creer_' + categorie, donnees);
  }
  //Supprimer données du catégorie choisie
  supprimerDonneesCategorie(nom: any, categorie: String) {
    return this.http.delete<any>(infonet + 'Supprimer_' + categorie + '/', {
      params: {
        Categorie: nom,
      },
      observe: 'response',
    });
  }
  //Afficher message d'erreur
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  //Initialiser données
  initialiserDonnees() {
    return this.http.post<any>(infonet + "Init_Donnees",{});
  }
}

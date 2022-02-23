import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

const erp = "/ERP/";
const infonet = "/INFONET/";

@Injectable({
  providedIn: 'root'
})
export class SuivieCommandeService {
  handleError: any;
  constructor(private httpClient: HttpClient) { }

  //get commande par le trackingNumber
  public commandeByTrackingNumber(trackingNumber: any) {
    return this.httpClient
      .get(erp + 'commandes-tracking-number', {
        params: {
          trackingNumber: trackingNumber
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

   //charger une mission par id
   public mission(id: any) {
    return this.httpClient
      .get(erp + 'mission', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ObservableInput } from 'rxjs';
import { catchError } from 'rxjs/operators';
const erp = '/ERP/';
@Injectable({
  providedIn: 'root',
})
export class CarburantService {
  handleError: (err: any, caught: Observable<Object>) => ObservableInput<any>;
  constructor(private httpClient: HttpClient) {}
  //lister les carburants
  public carburants() {
    return this.httpClient.get(erp + 'carburants');
  }

  //creer nouveau carburant
  public creerCarburant(formData: any) {
    return this.httpClient
      .post(erp + 'creerCarburant', formData)
      .pipe(catchError(this.handleError));
  }
  //modifier carburant
  public modifierCarburant(formData: any) {
    return this.httpClient
      .put(erp + 'majCarburant', formData)
      .pipe(catchError(this.handleError));
  }
}

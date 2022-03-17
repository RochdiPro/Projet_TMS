import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private static _apiKey: string;
  get apiKey() {
    return AppInitService._apiKey;
  }
  // charger API key depuis la base de donnée
  public static loadApiKey(httpClient: HttpClient) {
    return httpClient
      .get<any>('/ERP/configuration-application')
      .toPromise()
      .then((dto) => {
        this._apiKey = dto.apiKeyGoogle;
      });
  }
}

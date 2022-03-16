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

  public static loadApiKey(httpClient: HttpClient) {
    return httpClient
      .get<any>('/ERP/configuration-application') // use your endpoint for getting the settings and your own SettingsDto type
      .toPromise()
      .then((dto) => {
        this._apiKey = dto.apiKeyGoogle; // adjust to your DTO
      });
  }
}

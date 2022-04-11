export class ConfigurationApplication {
    id: number;
    adresseIp: String;
    apiKeyGoogle: String;


  constructor(adresseIp: String, apiKeyGoogle: String) {
    this.adresseIp = adresseIp
    this.apiKeyGoogle = apiKeyGoogle
  }

}
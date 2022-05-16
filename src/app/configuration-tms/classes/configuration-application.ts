export class ConfigurationApplication {
    id: number;
    adresseIp: String;
    apiKeyGoogle: String;
    modeManuel: boolean;


  constructor(adresseIp: String, apiKeyGoogle: String, modeManuel: boolean) {
    this.adresseIp = adresseIp
    this.apiKeyGoogle = apiKeyGoogle
    this.modeManuel = modeManuel;
  }

}
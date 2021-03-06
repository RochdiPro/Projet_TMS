import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { CoefficientsFraisLivraison } from '../classes/coefficients-frais-livraison';
import { CoefficientsScoreCommande } from '../classes/coefficients-score-commande';
import { ConfigurationApplication } from '../classes/configuration-application';
import { ConfigurationExcel } from '../classes/configuration-excel';
import { ConfigurationExcelProduit } from '../classes/configuration-excel-produit';
import { InfoGeneral } from '../classes/info-general';
const erp = '/ERP/';
const infonet = '/INFONET/';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationTmsService {
  handleError: any;
  constructor(private httpClient: HttpClient) {}

  //creation infos general
  public createInfosGenerals(info: InfoGeneral) {
    return this.httpClient
      .post(erp + 'creer-info-general', info)
      .pipe(catchError(this.handleError));
  }

  //get parmétres infos generals
  public infosGenerals() {
    return this.httpClient
      .get(erp + 'info-general')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour infos general
  public modifierInfosGenerals(info: InfoGeneral) {
    return this.httpClient
      .put(erp + 'modifier-info-general', info)
      .pipe(catchError(this.handleError));
  }

  //mettre a jour adresse
  public modifierAdresse(info: InfoGeneral) {
    return this.httpClient
      .put(erp + 'modifier-adresse-info-general', info)
      .pipe(catchError(this.handleError));
  }

  //creation coefficients frais livraison
  public createCoefficientsFraisLivraison(
    coefficients: CoefficientsFraisLivraison
  ) {
    return this.httpClient
      .post(erp + 'frais-livraison', coefficients)
      .pipe(catchError(this.handleError));
  }

  //get coefficients frais de livraison
  public fraisLivraison() {
    return this.httpClient
      .get(erp + 'frais-livraison')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour les coefficients frais de livrzison
  public modifierCoefficientsFraisLivraison(
    coefficients: CoefficientsFraisLivraison
  ) {
    return this.httpClient
      .put(erp + 'frais-livraison', coefficients)
      .pipe(catchError(this.handleError));
  }

  //creation coefficients score commande
  public createCoefficientsScoreCommande(
    coefficients: CoefficientsScoreCommande
  ) {
    return this.httpClient
      .post(erp + 'score-commande', coefficients)
      .pipe(catchError(this.handleError));
  }

  //get coefficients score commande
  public coeifficientsScoreCommande() {
    return this.httpClient
      .get(erp + 'score-commande')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour les coefficients score commande
  public modifierCoefficientsScoreCommande(
    coefficients: CoefficientsScoreCommande
  ) {
    return this.httpClient
      .put(erp + 'score-commande', coefficients)
      .pipe(catchError(this.handleError));
  }

  //creation du configuration du fichier excel
  public createConfigExcel(config: ConfigurationExcel) {
    return this.httpClient
      .post(erp + 'creer-configuration-excel', config)
      .pipe(catchError(this.handleError));
  }

  //charger la configuration excel enregistrée
  public configurationExcel() {
    return this.httpClient
      .get(erp + 'configuration-excel')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour la configuration excel
  public modifierParametreExcel(config: ConfigurationExcel) {
    return this.httpClient
      .put(erp + 'modifier-configuration-excel', config)
      .pipe(catchError(this.handleError));
  }

  //creation config application general
  public createConfigApplication(config: ConfigurationApplication) {
    return this.httpClient
      .post(erp + 'creer-configuration-application', config)
      .pipe(catchError(this.handleError));
  }

  //get coefficients infos generals
  public getConfigurationApplication() {
    return this.httpClient
      .get(erp + 'configuration-application')
      .pipe(catchError(this.handleError));
  }

  //mettre a jour infos general
  public modifierConfigurationApplication(config: ConfigurationApplication) {
    return this.httpClient.put(
      erp + 'modifier-configuration-application',
      config
    );
  }

  //get adresse email utilisée pour envoyer email
  public getEmailAdress() {
    return this.httpClient
      .get(erp + 'adresse-email', { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  //get configuration excel produit
  public getConfigurationProduit() {
    return this.httpClient
      .get(erp + 'configuration-excel-produit')
      .pipe(catchError(this.handleError));
  }

  //créer nouvelle configuration produit
  public createConfigurationProduit(config: ConfigurationExcelProduit) {
    return this.httpClient
      .post(erp + 'creer-configuration-excel-produit', config)
      .pipe(catchError(this.handleError));
  }

  //modifier configuratio produit
  public modifierConfigurationProduit(config: ConfigurationExcelProduit) {
    return this.httpClient
      .put(erp + 'modifier-configuration-excel-produit', config)
      .pipe(catchError(this.handleError));
  }

  // api exporter liste produit
  public exporterListeProduit() {
    return this.httpClient.get(erp + 'exporter-produits', {
      responseType: 'blob',
    });
  }

  //exporter liste des emballages
  public exporterEmballages() {
    return this.httpClient.get(erp + 'exporter-emballages', {
      responseType: 'blob',
    });
  }
  //exporter liste des supports
  public exporterSupports() {
    return this.httpClient.get(erp + 'exporter-supports', {
      responseType: 'blob',
    });
  }
  //exporter liste des supports
  public exporterCommandes() {
    return this.httpClient.get(erp + 'exporter-commandes', {
      responseType: 'blob',
    });
  }
  //exporter liste des vehicules
  public exporterVehicules() {
    return this.httpClient.get(erp + 'exporter-vehicules', {
      responseType: 'blob',
    });
  }
  //exporter liste des vehicules loués
  public exporterVehiculesLoues() {
    return this.httpClient.get(erp + 'exporter-vehicules-loues', {
      responseType: 'blob',
    });
  }
  //exporter liste des carburants
  public exporterCarburants() {
    return this.httpClient.get(erp + 'exporter-carburants', {
      responseType: 'blob',
    });
  }
  //exporter liste des missions
  public exporterMissions() {
    return this.httpClient.get(erp + 'exporter-missions', {
      responseType: 'blob',
    });
  }
  //exporter liste des employés
  public exporterEmployes() {
    return this.httpClient.get(erp + 'exporter-tous-employes', {
      responseType: 'blob',
    });
  }
  //exporter liste des clients
  public exporterClients() {
    return this.httpClient.get(erp + 'exporter-tous-clients', {
      responseType: 'blob',
    });
  }
}

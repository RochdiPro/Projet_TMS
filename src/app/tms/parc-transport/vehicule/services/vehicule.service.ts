import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
const erp = '/ERP/';
const infonet = '/INFONET/';
@Injectable({
  providedIn: 'root',
})
export class VehiculeService {
  vehiculeAModifier: any;
  vehiculeLoueAModifier: any;
  handleError: any;
  constructor(private httpClient: HttpClient) {}

  //creation du vehicule
  public createvehicule(formData: any) {
    return this.httpClient
      .post(erp + 'creer-vehicule', formData)
      .pipe(catchError(this.handleError));
  }

  //lister toutes les vehicules
  public vehicules() {
    return this.httpClient.get(erp + 'vehicules');
  }

  //charger un vehicule specifique
  public vehicule(id: any) {
    return this.httpClient
      .get(erp + 'vehicule', {
        params: {
          id: id,
        },
      })
      .pipe(catchError(this.handleError));
  }

  //mettre a jour un vehicule
  public miseajourvehicule(formData: any) {
    return this.httpClient
      .put(erp + 'modifier-vehicule', formData)
      .pipe(catchError(this.handleError));
  }

  //modifier les informations d'un vehicule
  public modifierVehicule(formData: any) {
    return this.httpClient
      .put(erp + 'modifier-infos-vehicule', formData)
      .pipe(catchError(this.handleError));
  }

  //filtrer vehicule
  public filtrerVehicule(
    matricule: string,
    etatVehicule: string
  ) {
    return this.httpClient
      .get(erp + 'filtre-vehicule', {
        params: {
          matricule: matricule,
          etatVehicule: etatVehicule,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //ajouter une reclamation pour un vehicule
  public reclamationvehicule(formData: any) {
    return this.httpClient
      .put(erp + 'reclamation-vehicule', formData)
      .pipe(catchError(this.handleError));
  }

  //mettre a jour le kilométrage d'un vehicule
  public miseajourkm(formData: any) {
    return this.httpClient
      .put(erp + 'modifier-consommation', formData)
      .pipe(catchError(this.handleError));
  }

  //supprimer un vehicule
  public supprimerVehicule(id: any) {
    return this.httpClient
      .delete(erp + 'supprimer-vehicule', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // modifier kilometrage prochain entretien
  public majKilometrageEntretien(formData: any) {
    return this.httpClient
      .put(erp + 'mise-a-jour-kilometrage-entretien', formData)
      .pipe(catchError(this.handleError));
  }

  //creer nouveau entretien
  public creerEntretien(formData: any) {
    return this.httpClient
      .post(erp + 'create-entretien', formData)
      .pipe(catchError(this.handleError));
  }

  //get liste entretiens
  public getEntretiensVehicule(id: any) {
    return this.httpClient
      .get(erp + 'entretien-vehicule', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //lister les carburants
  public carburants() {
    return this.httpClient.get(erp + 'carburants');
  }

  //get carburant par nom carburant
  public carburant(carburant: string) {
    return this.httpClient.get(erp + 'carburant', {
      params: {
        carburant: carburant,
      },
      observe: 'body',
    });
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

  //Ajouter un nouveau vehicule loué
  public creerVehiculeLoue(formData: any) {
    return this.httpClient
      .post(erp + 'creer-vehicule-loue', formData)
      .pipe(catchError(this.handleError));
  }

  //lister les vehicules loués
  public vehiculesLoues() {
    return this.httpClient.get(erp + 'vehicules-loues');
  }

  // modifier vehicule loue
  public modifierVehiculeLoue(formData: any) {
    return this.httpClient.put(erp + 'modifier-vehicule-loue', formData);
  }

  //importer les données d'un vehicule loué par ID
  public vehiculeLoue(id: any) {
    return this.httpClient
      .get(erp + 'vehicule-loue', {
        params: {
          id_vehicule_loue: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //supprimer un vehicule loué
  public supprimerVehiculeLoue(id: any) {
    return this.httpClient
      .delete(erp + 'supprimer-vehicule-loue', {
        params: {
          id_vehicule_loue: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //mise a jour etat vehicule loué
  public majDateLocation(formData: any) {
    return this.httpClient
      .put(erp + 'mise-a-jour-date-location', formData)
      .pipe(catchError(this.handleError));
  }

  //filtrer vehicule
  public filtrerVehiculeLoues(
    matricule: string,
    proprietaire: string,
    etatVehicule: string
  ) {
    return this.httpClient
      .get(erp + 'filtre-vehicule-loue', {
        params: {
          matricule: matricule,
          proprietaire: proprietaire,
          etatVehicule: etatVehicule,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // modifier consommation
  public modifierConsommation(
    id: any,
    kmActuel: any,
    consommation: any,
    historiqueConsommation: any,
    historiqueA: any,
    historiqueB: any,
    historiqueC: any,
    reservoir: any
  ) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('kmactuel', Number(kmActuel));
    formData.append('consommation', consommation);
    formData.append('historiqueConsommation', historiqueConsommation);
    formData.append('historiqueA', historiqueA);
    formData.append('historiqueB', historiqueB);
    formData.append('historiqueC', historiqueC);
    formData.append('reservoir', reservoir);
    return this.httpClient.put(erp + 'modifier-consommation', formData);
  }
  // modifier consommation vehicule loué
  public modifierConsommationVehiculeLoue(
    id: any,
    kmActuel: any,
    consommation: any,
    historiqueConsommation: any,
    historiqueA: any,
    historiqueB: any,
    historiqueC: any,
    reservoir: any
  ) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('kmactuel', Number(kmActuel));
    formData.append('consommation', consommation);
    formData.append('historiqueConsommation', historiqueConsommation);
    formData.append('historiqueA', historiqueA);
    formData.append('historiqueB', historiqueB);
    formData.append('historiqueC', historiqueC);
    formData.append('reservoir', reservoir);
    return this.httpClient.put(erp + 'modifier-consommation-vehicule-loue', formData);
  }

  //get liste des chauffeurs
  public getChauffeurs() {
    return this.httpClient
      .get(infonet + 'Filtre_Employee', {
        params: {
          Champ: 'role',
          Valeur: 'chauffeur',
        },
      })
      .pipe(catchError(this.handleError));
  }

  //get configuration de l'application
  public getConfigurationApplication() {
    return this.httpClient
      .get(erp + 'configuration-application')
      .pipe(catchError(this.handleError));
  }

  //get infos generales
  public getInfoGeneralesDeLaSociete() {
    return this.httpClient
      .get(erp + 'info-general')
      .pipe(catchError(this.handleError));
  }

  //get liste des chauffeurs
  public getChauffeursManuel() {
    return this.httpClient
      .get(erp + 'Filtre_Employee', {
        params: {
          Champ: 'role',
          Valeur: 'chauffeur',
        },
      })
      .pipe(catchError(this.handleError));
  }

  //get vehicule par matricule
  public getMatriculesVehiculesPrives() {
    return this.httpClient.get(erp + "matricules-vehicules-prives")
  }

  //get vehicule Loue par matricule
  public getMatriculesVehiculesLoues() {
    return this.httpClient.get(erp + "matricules-vehicules-loues")
  }

  // changer etat vehicule
  public changerEtatVehicule(matricule: string, etat: string) {
    let formData = new FormData();
    formData.append('matricule', matricule);
    formData.append('etat', etat);
    return this.httpClient.put(erp + "changer-etat-vehicule",formData);
  }

  // changer etat vehicule loué
  public changerEtatVehiculeLoue(matricule: string, etat: string) {
    let formData = new FormData();
    formData.append('matricule', matricule);
    formData.append('etat', etat);
    return this.httpClient.put(erp + "changer-etat-vehicule-loue",formData);
  }

}

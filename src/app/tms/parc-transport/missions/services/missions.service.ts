import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
const erp = '/ERP/';
const infonet = '/INFONET/';
@Injectable({
  providedIn: 'root',
})
export class MissionsService {
  handleError: any;

  constructor(private httpClient: HttpClient) {}

  //creer mission
  public creerMission(formData: any) {
    return this.httpClient
      .post(erp + 'creer-mission', formData)
      .pipe(catchError(this.handleError));
  }

  //lister les missions
  public missions() {
    return this.httpClient
      .get(erp + 'missions')
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

  // get la derniére mission enregistrée
  public derniereMission() {
    return this.httpClient
      .get(erp + 'derniere-mission')
      .pipe(catchError(this.handleError));
  }

  // supprimer une mission
  public deleteMission(id: any) {
    return this.httpClient
      .delete(erp + 'supprimer-mission', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // mise a jour mission
  public updateMission(formData: any) {
    return this.httpClient.put(erp + 'mise-a-jour-mission', formData);
  }

  //filtrer les missions
  public filtrerMissions(nomChauffeur: any, matricule: any, etat: any) {
    return this.httpClient
      .get(erp + 'filtrer-missions', {
        params: {
          nom: nomChauffeur,
          matricule: matricule,
          etat: etat,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get liste des commandes
  public commandes() {
    return this.httpClient.get(erp + 'commandes');
  }
  // get commande par son id
  public commande(id: any) {
    return this.httpClient
      .get(erp + 'commande', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }
  // get commandes par son etat
  public getCommandesParEtat(etat: any) {
    return this.httpClient
      .get(erp + 'commandes-etat', {
        params: {
          etat: etat,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get commandes par id mission
  public getCommandesParIdMission(idMission: any) {
    return this.httpClient
      .get(erp + 'commandes-id-mission', {
        params: {
          idMission: idMission,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // get liste colis par id mission
  public getColisParIdMission(idMission: any) {
    return this.httpClient
      .get(erp + 'liste-colis-par-id-mission', {
        params: {
          idMission: idMission,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // getMissionsChauffeur
  public getMissionsChauffeur(idChauffeur: any) {
    return this.httpClient
      .get(erp + 'missions-chauffeur', {
        params: {
          idChauffeur: idChauffeur,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  //get liste des colis par id commande
  public getListeColisParIdCommande(idCommande: any) {
    return this.httpClient
      .get(erp + 'liste-colis-par-id-commande', {
        params: {
          idCommande: idCommande,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // changer etat mission
  public modifierEtatMission(id: number, etat: string) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('etat', etat);
    return this.httpClient
      .put(erp + 'modifier-etat-mission', formData)
      .pipe(catchError(this.handleError));
  }

  // livrer commande
  public livrerCommande(qrCode: string, idMaission: any, idCommandes: any) {
    let formData = new FormData();
    formData.append('qrCode', qrCode);
    formData.append('idMission', idMaission);
    formData.append('idCommandes', idCommandes);
    return this.httpClient
      .put(erp + 'livrer-commande', formData)
      .pipe(catchError(this.handleError));
  }

  //modifier l'etat du commande
  public affecterCommande(formData: any) {
    return this.httpClient
      .put(erp + 'affecter-commande', formData)
      .pipe(catchError(this.handleError));
  }

  //creer liste colisage par mission
  public creerListeColisMission(colis: any) {
    return this.httpClient
      .post(erp + 'creer-colis-mission', colis)
      .pipe(catchError(this.handleError));
  }

  // get liste vehicules prives
  public vehicules() {
    return this.httpClient.get(erp + 'vehicules');
  }

  //filtrer vehicule
  public filtrerVehiculeLoues(champ: any, valeur: any) {
    return this.httpClient
      .get(erp + 'filtre-vehicule-loue', {
        params: {
          champ: champ,
          valeur: valeur,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
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

  //get position by id
  public getPositionById(id: any) {
    return this.httpClient
      .get(erp + 'position-client', {
        params: {
          id: id,
        },
        observe: 'body',
      })
      .pipe(catchError(this.handleError));
  }

  // modifier les id des commandes dans une mission
  public modifierIdCommandesDansMission(id: number, idCommandes: string) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('idCommandes', idCommandes);
    return this.httpClient
      .put(erp + 'modifier-id-commandes', formData)
      .pipe(catchError(this.handleError));
  }

  public majEtat(id: any, formData: any) {
    this.httpClient.put(erp + 'miseajouretat/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }
  public creerCommande(formData: any) {
    this.httpClient.post(erp + 'createCommande', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }
  public filtrerCommande(champ: any, valeur: any) {
    return this.httpClient.get(
      erp + 'filtrerCommande' + '?champ=' + champ + '&valeur=' + valeur
    );
  }
  public supprimerCommande(id: any) {
    this.httpClient.delete(erp + 'deleteCommande/' + id).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    );
  }

  //get vehicule par sa matricule
  public vehicule(matricule: string) {
    return this.httpClient.get(erp + 'vehicule-matricule', {
      params: {
        matricule: matricule,
      },
      observe: 'body',
    });
  }

  //modifier consommation
  public modifierConsommation(
    id: any,
    kmActuel: any,
    consommation: any,
    historiqueConsommation: any,
    reservoir: any
  ) {
    let formData: any = new FormData();
    formData.append('id', id);
    formData.append('kmactuel', Number(kmActuel));
    formData.append('consommation', consommation);
    formData.append('historiqueConsommation', historiqueConsommation);
    formData.append('reservoir', reservoir);
    return this.httpClient.put(erp + 'modifier-consommation', formData);
  }

  // envoyer notification du prochaine livraison
  public envoyerNotificationProchaineLivraison(idCommandes: any) {
    return this.httpClient.get(erp + 'envoyer-notification-livraison', {
      params: {
        idCommandes: idCommandes,
      },
      observe: 'body',
    });
  }

  //get parmétres infos generals
  public infosGenerals() {
    return this.httpClient
      .get(erp + 'info-general')
      .pipe(catchError(this.handleError));
  }
}

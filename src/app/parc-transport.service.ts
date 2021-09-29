import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
const erp = "/ERP/";
const infonet = "/INFONET/";
@Injectable({
  providedIn: 'root'
})
export class ParcTransportService {
  handleError: any;

  constructor(private http: HttpClient) { }

  //creation du vehicule
  public createvehicule(formData: any) {
    return this.http.post(erp + 'createvehicule', formData).pipe(
      catchError(this.handleError)
    );
  }

  //lister toutes les vehicules
  public vehicules() {
    return this.http.get(erp + 'vehicules');
  }

  //charger un vehicule specifique
  public vehicule(id: any) {
    return this.http.get(erp + 'vehicule/' + id);
  }

  //mettre a jour un vehicule
  public miseajourvehicule(id: any, formData: any) {
    return this.http.put(erp + 'updatevehicule/' + id, formData).pipe(
      catchError(this.handleError)
    );
  }

  //ajouter une reclamation pour un vehicule
  public reclamationvehicule(id: any, formData: any) {
    return this.http.put(erp + 'reclamationvehicule/' + id, formData).pipe(
      catchError(this.handleError)
    );
  }

  //mettre a jour le kilométrage d'un vehicule
  public miseajourkm(id: any, formData: any) {
    return this.http.put(erp + 'miseajourkm/' + id, formData).pipe(
      catchError(this.handleError)
    );
  }

  //supprimer un vehicule
  public supprimerVehicule(id: any) {
    return this.http.delete(erp + 'deletevehicule/' + id).pipe(
      catchError(this.handleError)
    );
  }

  //mettre à jour l'etat de vehicule
  public majEtatVehicule(formData: any) {
    this.http.put(erp + 'miseajourEtatVehicule', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  //mettre à jour la charge et la surface
  public majChargeEtSurface(formData: any) {
    this.http.put(erp + 'miseajourChargeEtSurface', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  //lister les carburants
  public carburants() {
    return this.http.get(erp + 'carburants');
  }

  //creer nouveau carburant
  public creerCarburant(formData: any) {
    return this.http.post(erp + 'creerCarburant', formData).pipe(
      catchError(this.handleError)
    );
  }
  
  //modifier carburant
  public modifierCarburant(formData: any) {
    return this.http.put(erp + 'majCarburant', formData).pipe(
      catchError(this.handleError)
    );
  }

  //Ajouter un nouveau vehicule loué
  public creerVehiculeLoue(formData: any) {
    return this.http.post(erp + 'Creer_Vehicule_Loue', formData).pipe(
      catchError(this.handleError)
    );
  }

  //lister les vehicules loués
  public vehiculesLoues() {
    return this.http.get(erp + 'Vehicules_Loues')
  }

  //importer les données d'un vehicule loué par ID
  public vehiculeLoue(id : any){
    return this.http.get(erp + 'Vehicule_Loue', {
      params: {
        id_vehicule_loue : id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //supprimer un vehicule loué
  public supprimerVehiculeLoue(id: any) {
    return this.http.delete(erp + 'Supprimer_Vehicule_Loue', {
      params: {
        id_vehicule_loue : id
      }, observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  //mise a jour etat vehicule loué
  public majDateLocation(formData: any) {
    return this.http.put(erp + 'Maj_Date_Location', formData).pipe(
      catchError(this.handleError)
    );
  }

  //lister les employes
  public employes() {
    return this.http.get(infonet + 'Employes');
  }

  //charger un employe par ID
  public employe(id: any) {
    return this.http.get(infonet + 'Employe' + "?Id=" + id);
  }

  //creer mission
  public creerMission(formData: any) {
    this.http.post(erp + 'creerMission', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  //lister les missions
  public missions() {
    return this.http.get(erp + 'missions');
  }

  //charger une mission par id
  public mission(id: any) {
    return this.http.get(erp + 'mission')
  }
  
  //filtrer les missions
  public filtrerMissions(champ1: any, valeur1: any, champ2: any, valeur2: any, champ3: any, valeur3: any, champ4: any, valeur4: any) {
    return this.http.get(erp + 'filtrerMissions' + '?champ1=' + champ1 + '&valeur1=' + valeur1 + '&champ2=' + champ2 + '&valeur2=' + valeur2 + '&champ3=' + champ3 + '&valeur3=' + valeur3 + '&champ4=' + champ4 + '&valeur4=' + valeur4);
  }

  //filtrer les missions par le matricule du vehicule et par nom chauffeur
  public filtrerMissionsVehiculeChauffeur(vehicule : any, chauffeur : any) {
    return this.http.get(erp + 'filtrerMissionsVehiculeChauffeur' + '?vehicule=' + vehicule + '&chauffeur=' + chauffeur);
  }

  //charger les factures
  public factures() {
    return this.http.get(infonet + 'Factures')
  }

  //charger les BLs
  public bon_Livraison(){
    return this.http.get(infonet + 'Bon_Livraisons')
  }

  //charger Les details du facture
  public  Detail_Facture(Id: any): Observable<any> {

    return this.http.get(infonet + "Detail_Facture"
      , {
        params: {
          Id_Facture: Id
        }, responseType: 'blob'
      }).pipe(catchError(this.handleError))
  }

  //charger les données d'un client a partir son Id
  // public client(id: any) {
  //   return this.http.get(infonet + 'Client' , {
  //     params: {
  //       id : id
  //     }, observe: 'body'
  //   }).pipe(catchError(this.handleError));
  // }

  //charger liste des clients
  public clients(){
    return this.http.get(infonet + 'Clients')
  }


  public majTrajet(formData: any) {
    this.http.put(erp + 'majTrajetMission', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public majEtatMission(formData: any) {
    this.http.put(erp + 'majEtatMission', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public imageEmploye(id: any) {
    return this.http.get(infonet + 'Image_Employe' + '?Id=' + id);

  }
  public filtrerChauffeur(champ: any, valeur: any) {
    return this.http.get(infonet + 'Filtre_Employe' + '?Champ=' + champ + '&Valeur=' + valeur);
  }
  public commandes() {
    return this.http.get(erp + 'commandes');
  }
  public commande(id: any) {
    return this.http.get(erp + 'commande/' + id);
  }
  public creerCommande(formData: any) {
    this.http.post(erp + 'createCommande', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public filtrerCommande(champ: any, valeur: any) {
    return this.http.get(erp + 'filtrerCommande' + '?champ=' + champ + '&valeur=' + valeur);
  }
  public supprimerCommande(id: any) {
    this.http.delete(erp + 'deleteCommande/' + id).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public majEtat(id: any, formData: any) {
    this.http.put(erp + 'miseajouretat/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public positionClient(id: any) {
    return this.http.get(erp + 'PositionClient/' + id);
  }
  public creerPosClient(formData: any) {
    this.http.post(erp + 'CreerPositionClient', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
}

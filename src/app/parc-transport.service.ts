import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
const erp = "/ERP/";
@Injectable({
  providedIn: 'root'
})
export class ParcTransportService {

  constructor(private http: HttpClient) { }
  public createvehicule(formData: any) {
    this.http.post(erp + 'createvehicule', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public vehicules() {
    return this.http.get(erp + 'vehicules');
  }

  public vehicule(id: any) {
    return this.http.get(erp + 'vehicule/' + id);
  }
  public miseajourvehicule(id: any, formData: any) {
    this.http.put(erp + 'updatevehicule/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public reclamationvehicule(id: any, formData: any) {
    this.http.put(erp + 'reclamationvehicule/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public miseajourkm(id: any, formData: any) {
    this.http.put(erp + 'miseajourkm/' + id, formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public supprimerVehicule(id: any) {
    this.http.delete(erp + 'deletevehicule/' + id).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public majPrixCarburant(formData: any) {
    this.http.put(erp + 'updatePrixCarburant', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public majEtatVehicule(formData: any) {
    this.http.put(erp + 'miseajourEtatVehicule', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }

  public majChargeEtSurface(formData: any) {
    this.http.put(erp + 'miseajourChargeEtSurface', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public employes() {
    return this.http.get(erp + 'Employes');
  }
  public employe(id: any) {
    return this.http.get(erp + 'Employe' + "?Id=" + id);
  }
  public createAffectation(formData: any) {
    this.http.post(erp + 'createAffectation', formData).subscribe(
      (response) => console.log(response),
      (error) => console.log(error)
    )
  }
  public affectations() {
    return this.http.get(erp + 'affectations');
  }
  public affectation(id: any) {
    return this.http.get(erp + 'affectation/' + id)
  }
  public filtrerMission(champ: any, valeur: any) {
    return this.http.get(erp + 'filtrerMission' + '?champ=' + champ + '&valeur=' + valeur);
  }
  public filtrerMissionDeuxFacteurs(champ1: any, valeur1: any, champ2: any, valeur2: any) {
    return this.http.get(erp + 'filtrerMission2' + '?champ1=' + champ1 + '&valeur1=' + valeur1 + '&champ2=' + champ2 + '&valeur2=' + valeur2);
  }
  public filtrerMissionTroisFacteurs(champ1: any, valeur1: any, champ2: any, valeur2: any, champ3: any, valeur3: any) {
    return this.http.get(erp + 'filtrerMission3' + '?champ1=' + champ1 + '&valeur1=' + valeur1 + '&champ2=' + champ2 + '&valeur2=' + valeur2 + '&champ3=' + champ3 + '&valeur3=' + valeur3);
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
    return this.http.get(erp + 'Image_Employe' + '?Id=' + id);

  }
  public filtrerChauffeur(champ: any, valeur: any) {
    return this.http.get(erp + 'Filtre_Employe' + '?Champ=' + champ + '&Valeur=' + valeur);
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

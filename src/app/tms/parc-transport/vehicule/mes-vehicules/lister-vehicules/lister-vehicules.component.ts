import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AjouterCarburantComponent, BoiteDialogueEntretien, DetailVehiculeComponent, MajVehiculeComponent, MiseAJourConsommationComponent, NotificationComponent, ReclamationComponent } from '../../dialogs/dialogs.component';
import { VehiculeService } from '../../services/vehicule.service';

@Component({
  selector: 'app-lister-vehicules',
  templateUrl: './lister-vehicules.component.html',
  styleUrls: ['./lister-vehicules.component.scss']
})
export class ListerVehiculesComponent implements OnInit {

  //Declaration des variables
  vehicules: any;
  carburants: any;
  notification = true;
  datePresent = new Date();
  carburant: any;
  vehicule: any;
  form = new FormGroup({ carb: new FormControl(), prix: new FormControl() });

  //variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  // categorie utilisé pour le filtrage par categorie vehicule
  carosserie = [
    //types de carosserie des véhicules et leur catégories de permis accordées
    { name: 'DEUX ROUES', value: 'A/A1/B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'VOITURES PARTICULIÈRES', value: 'B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'POIDS LOURDS', value: 'C/C+E' },
    { name: 'POIDS LOURDS ARTICULÉS', value: 'C+E' },
  ];

    // variables des filtres
    filtreMatricule: string = "";
    filtreCategorie: string = "";
    filtreDisponibilte: string = "";

  //constructeur
  constructor(private dialog: MatDialog, public service: VehiculeService, public _router: Router) {
    sessionStorage.setItem('Utilisateur', '' + "tms2");
    sessionStorage.setItem('Acces', "1004400");

    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.tms = Number( arrayOfDigits[3])
   }

  ngOnInit(): void {
    this.form.get('carb').setValidators([Validators.required]);
    this.form.get('prix').setValidators([Validators.required, Validators.pattern("(^[0-9]{1,9})+(\.[0-9]{1,4})?$")]);
    this.form.controls.prix.disable();
    this.chargerVehicules();
    this.chargerCarburants();
  }
  
  //charger la liste des vehicules
  async chargerVehicules() {
    this.vehicules = await this.service.vehicules().toPromise();
  }

  async chargerCarburants() {
    this.carburants = await this.service.carburants().toPromise()
  }

  async chargerVehicule(id: any) {
    this.vehicule = await this.service.vehicule(id).toPromise();
  }

  //afficher kilometrage restant pour le prochain entretien
  calculerKilometrageProchainEntretien(vehicule: any) {
    let listeEntretien = [
      {
        type: 'Vidange huile moteur',
        kilometrage: vehicule.kilometrageProchainVidangeHuileMoteur
      },
      {
        type: 'Vidange liquide de refroidissement',
        kilometrage: vehicule.kilometrageProchainVidangeLiquideRefroidissement
      },
      {
        type: 'Vidange huile boite de vitesse',
        kilometrage: vehicule.kilometrageProchainVidangeHuileBoiteVitesse
      },
      {
        type: 'Changement filtre climatiseur',
        kilometrage: vehicule.kilometrageProchainChangementFiltreClimatiseur
      },
      {
        type: 'Changement filtre essence/gazoil',
        kilometrage: vehicule.kilometrageProchainChangementFiltreCarburant
      },
      {
        type: 'Changement bougies',
        kilometrage: vehicule.kilometrageProchainChangementBougies
      },
      {
        type: 'Changement courroies',
        kilometrage: vehicule.kilometrageProchainChangementCourroies
      },
      {
        type: 'Changement pneus',
        kilometrage: vehicule.kilometrageProchainChangementPneus
      }
    ]

    var result = listeEntretien.reduce(function (res, obj) {
      return (obj.kilometrage < res.kilometrage) ? obj : res;
    });
    return result.type + ': ' + (result.kilometrage - vehicule.kmactuel);
  }

  //bouton de detail vehicule
  ouvrirDetailVehicule(id: any): void { //ouvrir la boite de dialogue de détails vehicule
    const dialogRef = this.dialog.open(DetailVehiculeComponent, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
      data: {id: id}
    });
  }

  // bouton de mise a jour de vehicule
  ouvrirMiseAJourVehicule(id: any): void { //ouvrir la boite de dialogue de mise a jour vehicule
    const dialogRef = this.dialog.open(MajVehiculeComponent, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
      data: {id: id}
    });
    dialogRef.afterClosed().subscribe(result => {
      this.chargerVehicules();
    });
  }

  //bouton de mise a jour du consommation du vehicule
  ouvrirMiseAJourConsommation(id: any): void { //ouvrir la boite de dialogue de mise a jour de kilometrage et prix carburant
    const dialogRef = this.dialog.open(MiseAJourConsommationComponent, {
      width: '600px',
      autoFocus: false,
      data: { id: id }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.chargerVehicules();
    })
  }

  // bouton de reclamation
  ouvrirReclamation(id: any): void { //ouvrir la boite de dialogue de reclamation
    const dialogRef = this.dialog.open(ReclamationComponent, {
      width: '500px',
      autoFocus: false,
      data: {id: id}
    });
    dialogRef.afterClosed().subscribe(res => {
      this.chargerVehicules();
    })
  }

  // Bouton pour ajouter nouvelle vehicule
  ouvrirAjouterVehicule(): void { //ouvrir la boite de dialogue Ajouter nouvelle vehicule
    
  }

  // bouton de notification
  ouvrirNotifications(id: any): void { //ouvrir la boite de dialogue de notification
    this.chargerVehicule(id);
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '600px',
      autoFocus: false,
      data: {id: id }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.chargerVehicules();
    })
  }

  //Bouton ouvrir dialogue entretien
  ouvrirEntretien(vehicule: any) {
    const dialogRef = this.dialog.open(BoiteDialogueEntretien, {
      width: '600px',
      data: { vehicule: vehicule }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.chargerVehicules();
    });
  }

  //Bouton supprimer vehicule
  async supprimerVehicule(id: any) { //supprimer vehicule
    Swal.fire({
      title: 'Mot de passe',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'ok',
      showLoaderOnConfirm: true,
      preConfirm: (pass) => {
        if(pass !== "infonet") {
          Swal.showValidationMessage(
            `Mot de passe incorrecte`)
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Êtes-vous sûr?',
          text: "Vous allez supprimer le vehicul!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Supprimer!',
          cancelButtonText: 'Annuler'
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this.service.supprimerVehicule(id).toPromise();
            this.chargerVehicules();
            Swal.fire(
              'Supprimé!',
              'Le vehicul a été supprimé.',
              'success'
            )
          }
        })
      }
    })

  }

  //Badge rouge de notification
  afficherBadgeDeNotification(vehicule: any) { //affiche le badge rouge de existance du notification
    let entretien = vehicule.kmprochainentretien - vehicule.kmactuel;
    let dateVisite = new Date(vehicule.datevisite);
    let dateAssurance = new Date(vehicule.dateassurance);
    let dateTaxe = new Date(vehicule.datetaxe);
    var DifferenceVisite = dateVisite.getTime() - this.datePresent.getTime();
    var DifferenceVisiteJ = DifferenceVisite / (1000 * 3600 * 24);    //calculer nombre de jours restants pour la prochaine visite technique
    var DifferenceAssurance = dateAssurance.getTime() - this.datePresent.getTime();
    var DifferenceAssuranceJ = DifferenceAssurance / (1000 * 3600 * 24);  //calculer nombre de jours restants pour l'expiration de l'assurance
    var DifferenceTaxe = dateTaxe.getTime() - this.datePresent.getTime();
    var DifferenceTaxeJ = DifferenceTaxe / (1000 * 3600 * 24);  //calculer nombre de jours restants pour l'expiration des taxes
    let carburant = this.carburants.filter((x: any) => x.nom == vehicule.carburant);
    let prixCarburant = carburant[0].prixCarburant;
    let consommationActuelle = (((vehicule.montantConsomme / prixCarburant) / vehicule.distanceparcourie) * 100).toFixed(2);
    if (entretien < 1000 || vehicule.sujet !== "" || DifferenceVisiteJ < 30 || DifferenceAssuranceJ < 30 || DifferenceTaxeJ < 30 || vehicule.consommationNormale + 1 < consommationActuelle) {   //tester la condition pour afficher le badge de notification
      this.notification = false;
    } else {
      this.notification = true;
    }
    return this.notification;
  }


  // fonction pour filtrer mission
  filtrerMission(){
    this.filtreMatricule == undefined ? this.filtreMatricule = "": "";
    this.filtreCategorie == undefined ? this.filtreCategorie = "": "";
    this.filtreDisponibilte == undefined ? this.filtreDisponibilte = "": "";
    this.service.filtrerVehicule(this.filtreMatricule,this.filtreCategorie,this.filtreDisponibilte).subscribe((result) => {
      this.vehicules = result;
    })
  }


  //partie de modification carburant
  selectionnerCarburant() { //selectionner le type de carburant et afficher son prix
    this.form.controls.prix.enable();
    this.form.controls['prix'].setValue(this.carburant.prixCarburant);
  }
  ouvrirAjouterCarburant() { //ouvrir la boite de dialogue ajouter carburant
    const dialogRef = this.dialog.open(AjouterCarburantComponent, {
      width: '400px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.chargerCarburants();
    });
  }
  async miseAJourCarburant() { //modifier prix carburant
    var formData: any = new FormData();
    formData.append("id", this.carburant.id);
    formData.append("nom", this.carburant.nom);
    formData.append("prixCarburant", this.form.get('prix').value);
    await this.service.modifierCarburant(formData).toPromise();
    this.chargerCarburants();
    this.form.controls.prix.setValue("");
    this.form.controls.prix.disable();
  }

  // fin partie de modification carburant
}



/*
Liste des méthodes:
* date: creation du formControl date d'une facon dynamique selon le longueur du liste de vehicule.
* nouveauDate: creation nouveaux formControls dateDebut et dateFin.
* ajouterDatePicker: ajout du nouveaux dateDebut et dateFin au formControl array date.
* supprimerDate: supprimer formControl date qui a était crée dynamiquement.
* majControlleur: pour chaque vehicul on ajoute un fomControll date.
* chargerVehicules: get liste vehicules.
* ouvrirDetailVehiculeLoue: ouvrir la boite de dialogue de détails vehicule loué.
* supprimerVehiculeLoue: supprimer vehicule Loue.
* changerDate: changengemetn date debut et fin de location.
* filtrerVehicule: filtrer vehicule par matricule, proprietaire et disponibilité.
* chargerVehicule: charger vehicule par ID.
* ouvrirModifier: ouvrire component modifier vehicule loue.
* ouvrirMiseAJourConsommation: ouvrir boite dialog de mise a jour du consommation du vehicule.
*/
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../../services/vehicule.service';
import {
  DetailVehiculeLoueComponent,
  MiseAJourConsommationComponent,
} from '../../dialogs/dialogs.component';
import { StompService } from 'src/app/services/stomp.service';

@Component({
  selector: 'app-lister-vehicules',
  templateUrl: './lister-vehicules-loue.component.html',
  styleUrls: ['./lister-vehicules-loue.component.scss'],
})
export class ListerVehiculesLoueComponent implements OnInit {
  vehiculesLoues: any;
  disponibility: any;
  minDate = new Date(); //desactiver les dates passées
  form: FormGroup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  // variables des filtres
  filtreMatricule: string = '';
  filtreProprietaire: string = '';
  filtreDisponibilte: string = '';

  // pour activer et desactiver le progress bar de chargement
  chargementEnCours = true;

  constructor(
    public service: VehiculeService,
    private dialog: MatDialog,
    public _router: Router,
    public _location: Location,
    public fb: FormBuilder,
    private stompService: StompService
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: this.fb.array([]),
    });
    this.chargerVehicules();
    this.stompService.subscribe('/topic/vehicule-loue', (): void => {
      this.chargerVehicules();
    });
  }

  ngOnDestroy(): void {
    this.stompService.unsubscribe();
  }

  //creation du formControl date d'une facon dynamique selon le longueur du liste de vehicule
  date(): FormArray {
    //get le formControl date
    return this.form.get('date') as FormArray;
  }

  //creation nouveaux formControls dateDebut et dateFin
  nouveauDate(dateDebut: any, dateFin: any): FormGroup {
    return this.fb.group({
      dateDebut: [dateDebut, Validators.required],
      dateFin: [dateFin, Validators.required],
    });
  }

  // ajout du nouveaux dateDebut et dateFin au formControl array date
  ajouterDatePicker(dateDebut: any, dateFin: any) {
    this.date().push(this.nouveauDate(dateDebut, dateFin));
  }

  // supprimer formControl date qui a était crée dynamiquement
  supprimerDate() {
    this.date().clear();
  }

  //pour chaque vehicul on ajoute un fomControll date
  majControlleur() {
    this.supprimerDate();
    this.vehiculesLoues.forEach((vehicule: any) => {
      this.ajouterDatePicker(
        new Date(vehicule.date_debut_location),
        new Date(vehicule.date_fin_location)
      );
    });
  }
  //Fin creation du formControl date

  //get liste vehicules
  async chargerVehicules() {
    this.chargementEnCours = true;
    this.vehiculesLoues = await this.service.vehiculesLoues().toPromise();
    this.majControlleur();
    this.chargementEnCours = false;
  }

  //charger vehicule par ID
  chargerVehicule(id: any): any {
    this.service.vehiculeLoue(id).subscribe((data) => {
      return data;
    });
  }

  //ouvrir la boite de dialogue de détails vehicule loué
  ouvrirDetailVehiculeLoue(id: any): void {
    const dialogRef = this.dialog.open(DetailVehiculeLoueComponent, {
      width: '450px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      data: { id: id },
    });
  }

  //supprimer vehicule Loue
  supprimerVehiculeLoue(id: any): void {
    Swal.fire({
      title: 'Mot de passe',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'ok',
      showLoaderOnConfirm: true,
      preConfirm: (pass) => {
        if (pass !== 'infonet') {
          Swal.showValidationMessage(`Mot de passe incorrecte`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        //supprimer vehicule
        Swal.fire({
          title: 'Êtes-vous sûr?',
          text: 'Vous allez supprimer le vehicul!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Supprimer!',
          cancelButtonText: 'Annuler',
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this.service.supprimerVehiculeLoue(id).toPromise();
            this.chargerVehicules();
            Swal.fire('Supprimé!', 'Le vehicul a été supprimé.', 'success');
          }
        });
      }
    });
  }

  //Utilisé dans le date picker de modification
  //changengemetn date debut et fin de location
  async changerDate(id: any, index: any) {
    var formData: any = new FormData();
    formData.append('id', id);
    formData.append(
      'date_debut_location',
      this.form.get('date').value[index].dateDebut
    );
    formData.append(
      'date_fin_location',
      this.form.get('date').value[index].dateFin
    );
    Swal.fire({
      title: 'Voulez vous enregistrer les modifications?',
      showDenyButton: true,
      confirmButtonText: 'Enregistrer',
      denyButtonText: `Annuler`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.majDateLocation(formData).toPromise();
        this.chargerVehicules();
        Swal.fire('Modifications enregistrées!', '', 'success');
      }
    });
  }

  //filtrer vehicule par matricule, proprietaire et disponibilité
  filtrerVehicule() {
    this.chargementEnCours = true;
    this.filtreMatricule == undefined ? (this.filtreMatricule = '') : '';
    this.filtreProprietaire == undefined ? (this.filtreProprietaire = '') : '';
    this.filtreDisponibilte == undefined ? (this.filtreDisponibilte = '') : '';
    this.service
      .filtrerVehiculeLoues(
        this.filtreMatricule,
        this.filtreProprietaire,
        this.filtreDisponibilte
      )
      .subscribe((result) => {
        this.vehiculesLoues = result;
        this.chargementEnCours = false;
      });
  }

  //ouvrire component modifier vehicule loue
  ouvrirModifier(vehicule: any) {
    this.service.vehiculeLoueAModifier = vehicule;
    this._router.navigateByUrl(
      '/Menu/TMS/Parc/Vehicules/Vehicules-Loues/modifier-vehicule'
    );
  }

  //ouvrir boite dialog de mise a jour du consommation du vehicule
  ouvrirMiseAJourConsommation(vehicule: any): void {
    //ouvrir la boite de dialogue de mise a jour de kilometrage et prix carburant
    const dialogRef = this.dialog.open(MiseAJourConsommationComponent, {
      width: '1000px',
      autoFocus: false,
      data: { vehicule: vehicule },
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.chargerVehicules();
    });
  }
}

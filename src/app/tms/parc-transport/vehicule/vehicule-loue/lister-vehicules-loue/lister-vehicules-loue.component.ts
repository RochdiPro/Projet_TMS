import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../../services/vehicule.service';
import { DetailVehiculeLoueComponent } from '../../dialogs/dialogs.component';

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
  constructor(
    public service: VehiculeService,
    private dialog: MatDialog,
    public _router: Router,
    public _location: Location,
    public fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: this.fb.array([]),
    });
    this.chargerVehicules();
  }

  //creation du formControl date d'une facon dynamique selon la longue du liste de vehicule
  date(): FormArray {
    //get le formControl date
    return this.form.get('date') as FormArray;
  }

  nouveauDate(dateDebut: any, dateFin: any): FormGroup {
    //creation nouveaux formControls dateDebut et dateFin
    return this.fb.group({
      dateDebut: [dateDebut, Validators.required],
      dateFin: [dateFin, Validators.required],
    });
  }

  ajouterDatePicker(dateDebut: any, dateFin: any) {
    // ajout du nouveaux dateDebut et dateFin au formControl array date
    this.date().push(this.nouveauDate(dateDebut, dateFin));
  }

  supprimerDate() {
    this.date().clear();
  }

  majControlleur() {
    //creation des formControls date d'une facon dynamique
    this.supprimerDate();
    this.vehiculesLoues.forEach((vehicule: any) => {
      this.ajouterDatePicker(
        new Date(vehicule.date_debut_location),
        new Date(vehicule.date_fin_location)
      );
    });
  }
  //Fin creation du formControl date

  //charger liste vehicules
  async chargerVehicules() {
    this.vehiculesLoues = await this.service.vehiculesLoues().toPromise();
    this.majControlleur();
  }

  //charger vehicule par ID
  chargerVehicule(id: any): any {
    this.service.vehiculeLoue(id).subscribe((data) => {
      return data;
    });
  }

  //bouton de detail vehicule loué
  ouvrirDetailVehiculeLoue(id: any): void {
    //ouvrir la boite de dialogue de détails vehicule loué
    const dialogRef = this.dialog.open(DetailVehiculeLoueComponent, {
      width: '450px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      data: {id: id}
    });
  }

  //Bouton supprimer vehicule Loue
  supprimerVehiculeLoue(id: any): void {
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

  //Utilisé dans le date picker de modification
  async changerDate(id: any, index: any) {
    //changengemetn date debut et fin de location
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
}

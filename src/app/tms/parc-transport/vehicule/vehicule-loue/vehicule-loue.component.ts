import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ParcTransportService } from 'src/app/parc-transport.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../services/vehicule.service';

@Component({
  selector: 'app-vehicule-loue',
  templateUrl: './vehicule-loue.component.html',
  styleUrls: ['./vehicule-loue.component.scss']
})
export class VehiculeLoueComponent implements OnInit {

  vehiculesLoues: any;
  disponibility: any;
  minDate = new Date(); //desactiver les dates passées
  form: FormGroup;
  constructor(public service: VehiculeService, private dialog: MatDialog, public _router: Router, public _location: Location, public fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: this.fb.array([])
    });
    this.chargerVehicules();
  }

  //creation du formControl date d'une facon dynamique selon la longue du liste de vehicule
  date(): FormArray { //get le formControl date
    return this.form.get("date") as FormArray
  }

  nouveauDate(dateDebut: any, dateFin: any): FormGroup { //creation nouveaux formControls dateDebut et dateFin   
    return this.fb.group({
      dateDebut: [dateDebut, Validators.required],
      dateFin: [dateFin, Validators.required],
    })
  }

  ajouterDatePicker(dateDebut: any, dateFin: any) { // ajout du nouveaux dateDebut et dateFin au formControl array date
    this.date().push(this.nouveauDate(dateDebut, dateFin));
  }

  supprimerDate() {
    this.date().clear();
  }

  majControlleur() { //creation des formControls date d'une facon dynamique
    this.supprimerDate();
    this.vehiculesLoues.forEach((vehicule: any) => {
      this.ajouterDatePicker(new Date(vehicule.date_debut_location), new Date(vehicule.date_fin_location))
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
  // appelée dans le Bouton ajouter nouvelle vehicule Loué
  ouvrirAjouterVehicule(): void { //ouvrir la boite de dialogue Ajouter nouvelle vehicule Loué
    const dialogRef = this.dialog.open(AjouterVehiculeLoueComponent, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(res => {
      this.chargerVehicules();
    })
  }


  //bouton de detail vehicule loué
  ouvrirDetailVehiculeLoue(id: any): void { //ouvrir la boite de dialogue de détails vehicule loué
    localStorage.setItem('idV', id);
    const dialogRef = this.dialog.open(DetailVehiculeLoueComponent, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
    });
  }

  //Bouton supprimer vehicule Loue
  supprimerVehiculeLoue(id: any): void { //supprimer vehicule
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
        await this.service.supprimerVehiculeLoue(id).toPromise();
        this.chargerVehicules();
        Swal.fire(
          'Supprimé!',
          'Le vehicul a été supprimé.',
          'success'
        )
      }
    })
  }

  //Utilisé dans le date picker de modification
  async changerDate(id: any, index: any) { //changengemetn date debut et fin de location
    var formData: any = new FormData();
    formData.append("id", id);
    formData.append("date_debut_location", this.form.get('date').value[index].dateDebut);
    formData.append("date_fin_location", this.form.get('date').value[index].dateFin);
    Swal.fire({
      title: 'Voulez vous enregistrer les modifications?',
      showDenyButton: true,
      confirmButtonText: 'Enregistrer',
      denyButtonText: `Annuler`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.majDateLocation(formData).toPromise();
        this.chargerVehicules();
        Swal.fire('Modifications enregistrées!', '', 'success')
      }
    })


  }

}

// *************************************Boite de dialogue ajouter vehicule loue***************************
@Component({
  selector: 'app-ajouter-vehicule-loue',
  templateUrl: './ajouter-vehicule-loue.html',
  styleUrls: ['./ajouter-vehicule-loue.scss']
})
export class AjouterVehiculeLoueComponent implements OnInit {
  typematricules = [           //les types de matricules tunisiennes
    { name: 'TUN', value: 'TUN' },
    { name: 'RS', value: 'RS' },
  ];
  carosserie = [        //types de carosserie des véhicules et leur catégories de permis accordées
    { name: 'DEUX ROUES', value: 'A/A1/B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'VOITURES PARTICULIÈRES', value: 'B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'POIDS LOURDS', value: 'C/C+E' },
    { name: 'POIDS LOURDS ARTICULÉS', value: 'C+E' },
  ];
  form: FormGroup;
  inputMatriculeTunEstAffiche = false;   //pour afficher le inputField des matricules TUN ou RS
  inputMatriculeRsEstAffiche = false;
  matricule = "";
  typeMatriculeSelectionne = 'TUN' //pour enregistrer le type de matricule choisi
  categorie: String; //pour enregistrer la categorie de permis qui peuvent conduire le vehicule
  minDate = new Date(); //utilisé pour la desactivation des dates passées dans le datePicker

  constructor(public dialogRef: MatDialogRef<AjouterVehiculeLoueComponent>, public fb: FormBuilder, public service: VehiculeService, public _router: Router, public _location: Location) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      typematricule: ['TUN', [Validators.required]],
      matriculetun1: [''],
      matriculetun2: [''],
      matriculers: [''],
      marque: ['', [Validators.required]],
      modele: ['', [Validators.required]],
      couleur: ['', [Validators.required]],
      carosserie: ['', [Validators.required]],
      proprietaire: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      chargeUtile: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      longueur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      largeur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      hauteur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      dateDebut: [''],
      dateFin: [''],
    });
    this.testTypeMatricule();
  }

  testTypeMatricule(): void { //tester le type de matricule si elle est TUN ou RS
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) { //si le type de matricule est TUN on definie les validateurs de ses inputFields et on supprime les validateurs du type RS
      this.inputMatriculeTunEstAffiche = true;
      this.inputMatriculeRsEstAffiche = false;

      this.form.get('matriculetun1').setValidators([Validators.required, Validators.pattern("^[0-9]*$")])
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form.get('matriculetun2').setValidators([Validators.required, Validators.pattern("^[0-9]*$")])
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.get('matriculers').setValidators([])
      this.form.get('matriculers').updateValueAndValidity();
      this.form.patchValue({ matriculers: '' })
    }
    else if (typeMatriculeEstRS) { //si le type de matricule est RS on definie les validateurs de son inputField et on supprime les validateurs du type TUN
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = true;
      this.form.get('matriculers').setValidators([Validators.required, Validators.pattern("^[0-9]*$")])
      this.form.get('matriculers').updateValueAndValidity();
      this.form.get('matriculetun1').setValidators([])
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form.get('matriculetun2').setValidators([])
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.patchValue({ matriculetun1: '', matriculetun2: '' })
    } else { //si aucun type selectionné on supprime les validateurs du type
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = false;
      this.form.get('matriculetun1').setValidators([])
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form.get('matriculetun2').setValidators([])
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.get('matriculers').setValidators([])
      this.form.get('matriculers').updateValueAndValidity();
      this.form.patchValue({ matriculetun1: '', matriculetun2: '', matriculers: '' })
    }
  }

  //bouton Annuler
  fermerAjouterVehicule(): void { //fermer la boite de dialogue
    this.dialogRef.close();

  }

  async enregistrerVehicule() { //enregistrer les données
    var formData: any = new FormData();
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {  //tester le type de matricule selectionné pour l'enregistrer
      this.matricule = "";
      this.matricule = this.form.get('matriculetun1').value.toString().concat("TUN");
      this.matricule = this.matricule.concat(this.form.get('matriculetun2').value.toString());
    } else if (typeMatriculeEstRS) {
      this.matricule = "";
      var rsstr = "RS";
      this.matricule = rsstr.concat(this.form.get('matriculers').value);
    }
    formData.append("matricule", this.matricule);
    formData.append("marque", this.form.get('marque').value);
    formData.append("modele", this.form.get('modele').value);
    formData.append("couleur", this.form.get('couleur').value);
    formData.append("proprietaire", this.form.get('proprietaire').value);
    formData.append("num_proprietaire", this.form.get('telephone').value);
    formData.append("categories", this.categorie);
    formData.append("charge_utile", this.form.get('chargeUtile').value);
    formData.append("longueur", this.form.get('longueur').value);
    formData.append("largeur", this.form.get('largeur').value);
    formData.append("hauteur", this.form.get('hauteur').value);
    formData.append("etat_vehicule", "Disponible");
    formData.append("position_vehicule", "Sfax");
    formData.append("date_debut_location", new Date(this.form.get('dateDebut').value));
    formData.append("date_fin_location", new Date(this.form.get('dateFin').value));
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      denyButtonText: `Ne pas enregistrer`,
      cancelButtonText: 'Annuler',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.creerVehiculeLoue(formData).toPromise();
        this.dialogRef.close();
        Swal.fire('Vehicul enregistré!', '', 'success')
      } else if (result.isDenied) {
        this.dialogRef.close();
      }
    })


  }
}

// ********************************************Detail Vehicule***********************************************

@Component({
  selector: 'app-detail-vehicule-loue',
  templateUrl: './detail-vehicule-loue.html',
  styleUrls: ['./detail-vehicule-loue.scss']
})
export class DetailVehiculeLoueComponent implements OnInit {
  //declaration des variables
  vehicule: any;
  idVehicule: number;
  tun = false;
  rs = false;
  serie: String;
  numCar: String;
  matRS: String;
  matricule: String;
  constructor(public dialogRef: MatDialogRef<DetailVehiculeLoueComponent>, public service: VehiculeService) { }

  async ngOnInit() {
    this.idVehicule = Number(localStorage.getItem('idV')); // ID du vehicule selectionné
    await this.chargerVehiculeLoue();
    this.testerTypeMatricule();

  }

  async chargerVehiculeLoue() { //charger les données du vehicule selectionné
    this.vehicule = await this.service.vehiculeLoue(this.idVehicule).toPromise();
  }

  testerTypeMatricule() { //teste le type de matricule
    this.matricule = this.vehicule.matricule;
    if (this.vehicule.matricule.includes('TUN')) {
      this.tun = true;
      this.rs = false;
      this.serie = this.matricule.split('TUN')[0];
      this.numCar = this.matricule.split('TUN')[1];
    }
    if (this.vehicule.matricule.includes('RS')) {
      this.tun = false;
      this.rs = true;
      this.matRS = this.matricule.replace('RS', '');
    }
  }

  //Bouton Fermer
  fermerDetailVehiculeLoue(): void { //fermer la boite de dialogue
    this.dialogRef.close();
  }
}

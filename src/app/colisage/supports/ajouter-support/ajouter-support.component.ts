/**
 * Constructeur: get droit d'accées depuis sessionStorage.
 Liste des méthodes:
 * calculVolume: calculer le volume de l'emballage.
 * creerSupport: ajout du support dans le tableau.
 * testType: teste du type de support pour savaoir activer les champs de dimensions ou le champ du volume.
 * focusNextElement: aprés saisie du code a barre on passe au input suivant.
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SupportService } from '../services/support.service';

@Component({
  selector: 'app-ajouter-support',
  templateUrl: './ajouter-support.component.html',
  styleUrls: ['./ajouter-support.component.scss'],
})
export class AjouterSupportComponent implements OnInit {
  form: FormGroup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  constructor(
    private formBuilder: FormBuilder,
    private serviceSupport: SupportService,
    public _router: Router
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit() {
    //construction du formGroup form
    this.form = this.formBuilder.group({
      nom_Support: ['', Validators.required],
      type_Support: ['', Validators.required],
      poids_Emballage: ['', Validators.required],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required],
      code_Barre: ['', Validators.required],
    });
  }

  //calculer le volume de l'emballage
  calculVolume() {
    let dimensionsSontNull =
      this.form.get('hauteur').value === '' ||
      this.form.get('longueur').value === '' ||
      this.form.get('largeur').value === '';

    if (!dimensionsSontNull) {
      //volume = longueur * largeur * hauteur
      let volume =
        Number(this.form.get('hauteur').value) *
        Number(this.form.get('longueur').value) *
        Number(this.form.get('largeur').value) *
        0.000001; //pour convertir de cm3 vers m3
      this.form.get('volume').setValue(Number(volume).toFixed(3)); //afficher resultat calcul dans le champ volume
    }
  }

  // ajout du support dans le tableau
  async creerSupport() {
    var formData = new FormData();
    formData.append('nomSupport', this.form.get('nom_Support').value);
    formData.append('typeSupport', this.form.get('type_Support').value);
    formData.append('poidsEmballage', Number(this.form.get('poids_Emballage').value).toFixed(3));
    formData.append('longueur', Number(this.form.get('longueur').value).toFixed(3));
    formData.append('largeur', Number(this.form.get('largeur').value).toFixed(3));
    formData.append('hauteur', Number(this.form.get('hauteur').value).toFixed(3));
    formData.append('volume', Number(this.form.get('volume').value).toFixed(3));
    formData.append('codeBarre', this.form.get('code_Barre').value);
    await this.serviceSupport.creerSupport(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support']); //naviguer vers liste support aprés l'enregistrement
    Swal.fire({
      icon: 'success',
      title: 'Support bien ajouté',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  //teste du type de support pour savaoir activer les champs de dimensions ou le champ du volume
  testType() {
    let typeEstCarton = this.form.get('type_Support').value === 'Carton';
    let typeEstPalette = this.form.get('type_Support').value === 'Palette';
    if (typeEstCarton || typeEstPalette) {
      this.form.get('volume').disable();
      this.form.get('longueur').enable();
      this.form.get('largeur').enable();
      this.form.get('hauteur').enable();
    } else {
      this.form.get('volume').enable();
      this.form.get('longueur').disable();
      this.form.get('largeur').disable();
      this.form.get('hauteur').disable();
    }
  }

  // aprés saisie du code a barre on passe au input suivant
  focusNextElement(event: any){
    let element = document.getElementById('long');
    if (event.code === 'Enter') {
      element.focus();
    }
  }
}

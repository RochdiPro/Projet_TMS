/**
 * Constructeur: get droit d'accées depuis sessionStorage.
 Liste des méthodes:
 * calculVolume: calculer le volume de l'emballage.
 * modifierSupport: faire la modification du support de chargement.
 * annuler: annuler la modification.
 * testType: teste du type de support pour savaoir activer les champs de dimensions ou le champ du volume.
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SupportService } from '../services/support.service';

@Component({
  selector: 'app-modifier-support',
  templateUrl: './modifier-support.component.html',
  styleUrls: ['./modifier-support.component.scss'],
})
export class ModifierSupportComponent implements OnInit {
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

  async ngOnInit() {
    // construction du formGroup form
    this.form = this.formBuilder.group({
      nom_Support: [this.support.nomSupport, Validators.required],
      type_Support: [this.support.typeSupport, Validators.required],
      poids_Emballage: [this.support.poidsEmballage, Validators.required],
      longueur: [this.support.longueur, Validators.required],
      largeur: [this.support.largeur, Validators.required],
      hauteur: [this.support.hauteur, Validators.required],
      volume: [this.support.volume, Validators.required],
      code_Barre: [this.support.codeBarre, Validators.required],
    });
    this.testType();
  }

  get support() {
    return this.serviceSupport.supp;
  }

  //calculer le volume de l'emballage
  calculVolume() {
    let dimensionsSontNull =
      this.form.get('hauteur').value === '' ||
      this.form.get('longueur').value === '' ||
      this.form.get('largeur').value === '';
    if (!dimensionsSontNull) {
      let volume =
        Number(this.form.get('hauteur').value) *
        Number(this.form.get('longueur').value) *
        Number(this.form.get('largeur').value) *
        0.000001; //pour convertir du cm3 vers le m3
      this.form.get('volume').setValue(volume);
    }
  }

  // faire la modification du support de chargement
  async modifierSupport() {
    var formData = new FormData();
    formData.append('id', this.support.id);
    formData.append('nomSupport', this.form.get('nom_Support').value);
    formData.append('typeSupport', this.form.get('type_Support').value);
    formData.append('poidsEmballage', this.form.get('poids_Emballage').value);
    formData.append('longueur', this.form.get('longueur').value);
    formData.append('largeur', this.form.get('largeur').value);
    formData.append('hauteur', this.form.get('hauteur').value);
    formData.append('volume', this.form.get('volume').value);
    formData.append('codeBarre', this.form.get('code_Barre').value);
    await this.serviceSupport.modifierSupport(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support']); //naviguer vers liste des supports aprés enregistrement
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  //annuler la modification
  annuler() {
    Swal.fire({
      title: 'Êtes vous sûr?',
      text: 'Les modifications ne seront pas enregistrées!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then((result) => {
      if (result.isConfirmed) {
        this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support']);
      }
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
}

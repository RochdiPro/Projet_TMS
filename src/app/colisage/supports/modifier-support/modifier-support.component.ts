import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SupportService } from '../services/support.service';

@Component({
  selector: 'app-modifier-support',
  templateUrl: './modifier-support.component.html',
  styleUrls: ['./modifier-support.component.scss']
})
export class ModifierSupportComponent implements OnInit {
  form: FormGroup;
  support: any
  constructor(private formBuilder : FormBuilder, private serviceSupport : SupportService, public _router: Router) { }

  async ngOnInit() { 
    this.support = await this.serviceSupport.supp;
    this.form = this.formBuilder.group({
      nom_Support: [this.support.nom_support, Validators.required],
      type_Support: [this.support.type_support, Validators.required],
      poids_Emballage: [this.support.poids_emballage, Validators.required],
      longueur: [this.support.longueur, Validators.required],
      largeur: [this.support.largeur, Validators.required],
      hauteur: [this.support.hauteur, Validators.required],
      volume: [this.support.volume, Validators.required],
      code_Barre: [this.support.code_barre, Validators.required],
    })
    this.testType();
  }
  calculVolume() { //calculer le volume de l'emballage
    if (this.form.get('hauteur').value !== "" && this.form.get('longueur').value !== "" && this.form.get('largeur').value !== "") {
      let volume = Number(this.form.get('hauteur').value) * Number(this.form.get('longueur').value) * Number(this.form.get('largeur').value) * 0.000001;
      this.form.get('volume').setValue(volume);
    }
  }
  async modifierSupport(){
    var formData = new FormData();
    formData.append("id", this.support.id_support);
    formData.append("nom_support", this.form.get('nom_Support').value);
    formData.append("type_support", this.form.get('type_Support').value);
    formData.append("poids_emballage", this.form.get('poids_Emballage').value);
    formData.append("longueur", this.form.get('longueur').value);
    formData.append("largeur", this.form.get('largeur').value);
    formData.append("hauteur", this.form.get('hauteur').value);
    formData.append("volume", this.form.get('volume').value);
    formData.append( "code_barre", this.form.get('code_Barre').value);
    await this.serviceSupport.modifierSupport(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }

  annuler(){
    Swal.fire({
      title: 'Êtes vous sûr?',
      text: "Les modifications ne seront pas enregistrées!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support'])
      }
    })
    
  }

  testType(){
    if(this.form.get("type_Support").value === "Carton" || this.form.get("type_Support").value === "Palette"){
      this.form.get("volume").disable();
      this.form.get("longueur").enable();
      this.form.get("largeur").enable();
      this.form.get("hauteur").enable();
    } else {
      this.form.get("volume").enable();
      this.form.get("longueur").disable();
      this.form.get("largeur").disable();
      this.form.get("hauteur").disable();
    }
  }

}

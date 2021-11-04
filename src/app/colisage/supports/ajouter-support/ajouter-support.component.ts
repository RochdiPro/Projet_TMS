import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SupportService } from '../services/support.service';


@Component({
  selector: 'app-ajouter-support',
  templateUrl: './ajouter-support.component.html',
  styleUrls: ['./ajouter-support.component.scss']
})
export class AjouterSupportComponent implements OnInit {
  form: FormGroup;
  constructor(private formBuilder : FormBuilder, private serviceSupport : SupportService, public _router: Router) { }

  ngOnInit() { 
    this.form = this.formBuilder.group({
      nom_Support: ['', Validators.required],
      type_Support: ['', Validators.required],
      poids_Emballage: ['', Validators.required],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required],
      code_Barre: ['', Validators.required],
    })
  }
  calculVolume() { //calculer le volume de l'emballage
    if (this.form.get('hauteur').value !== "" && this.form.get('longueur').value !== "" && this.form.get('largeur').value !== "") {
      let volume = Number(this.form.get('hauteur').value) * Number(this.form.get('longueur').value) * Number(this.form.get('largeur').value) * 0.000001;
      this.form.get('volume').setValue(volume);
    }
  }
  async creerSupport(){
    var formData = new FormData();
    formData.append("nom_support", this.form.get('nom_Support').value);
    formData.append("type_support", this.form.get('type_Support').value);
    formData.append("poids_emballage", this.form.get('poids_Emballage').value);
    formData.append("longueur", this.form.get('longueur').value);
    formData.append("largeur", this.form.get('largeur').value);
    formData.append("hauteur", this.form.get('hauteur').value);
    formData.append("volume", this.form.get('volume').value);
    formData.append( "code_barre", this.form.get('code_Barre').value);
    await this.serviceSupport.creerSupport(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
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

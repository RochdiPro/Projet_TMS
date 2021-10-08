import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ColisageService } from 'src/app/colisage.service';
import Swal from 'sweetalert2';

// ******************************************************************************************
// ************************************* Interface Supports *********************************
// ******************************************************************************************
@Component({
  selector: 'app-supports',
  templateUrl: './supports.component.html',
  styleUrls: ['./supports.component.scss']
})
export class SupportsComponent implements OnInit {
  listerEstActive = false;
  ajouterEstActive = false;
  constructor(public router: Router) { }

  ngOnInit(): void {
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Liste_Support') this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Ajouter_Support') this.activerAjouter();
  }

  activerLister() {
    this.listerEstActive = true;
    this.ajouterEstActive = false;
  }

  activerAjouter() {
    this.listerEstActive = false;
    this.ajouterEstActive = true;
  }


}

// ******************************************************************************************
// ************************************* Interface Lister Supports *********************************
// ******************************************************************************************
@Component({
  selector: 'app-lister-supports',
  templateUrl: './lister-supports.html',
  styleUrls: ['./lister-supports.scss']
})
export class ListerSupportsComponent implements OnInit {
  listeSupports : any;
  constructor(private service : ColisageService) { }

  ngOnInit(): void {
    this.chargerListeSupports();
   }

  async chargerListeSupports(){
    this.listeSupports = await this.service.supports().toPromise()
  }
}

// ******************************************************************************************
// ************************************* Ajouter Support *********************************
// ******************************************************************************************
@Component({
  selector: 'app-ajouter-support',
  templateUrl: './ajouter-support.html',
  styleUrls: ['./ajouter-support.scss']
})
export class AjouterSupportComponent implements OnInit {
  form: FormGroup;
  constructor(private formBuilder : FormBuilder, private service : ColisageService, public _router: Router) { }

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
    await this.service.creerSupport(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Supports/Liste_Support'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }

}


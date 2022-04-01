import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Produit } from '../classes/produit';
import { ProduitService } from '../services/produit.service';

@Component({
  selector: 'app-ajouter-produit',
  templateUrl: './ajouter-produit.component.html',
  styleUrls: ['./ajouter-produit.component.scss'],
})
export class AjouterProduitsComponent implements OnInit {
  produitFormGroup: FormGroup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  dimensionsActive = true;
  volumeActive = true;

  constructor(private fb: FormBuilder, private service: ProduitService) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1004400');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    this.produitFormGroup = this.fb.group({
      marque: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      unite: ['', [Validators.required]],
      valeurUnite: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      codeBarre: ['', [Validators.required]],
      longueur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      largeur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      hauteur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      volume: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      poids: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  get marque() {
    return this.produitFormGroup.get('marque');
  }

  get nomProduit() {
    return this.produitFormGroup.get('nom');
  }

  get unite() {
    return this.produitFormGroup.get('unite');
  }

  get valeurUnite() {
    return this.produitFormGroup.get('valeurUnite');
  }

  get codeBarre() {
    return this.produitFormGroup.get('codeBarre');
  }

  get longueur() {
    return this.produitFormGroup.get('longueur');
  }

  get largeur() {
    return this.produitFormGroup.get('largeur');
  }

  get hauteur() {
    return this.produitFormGroup.get('hauteur');
  }

  get volume() {
    return this.produitFormGroup.get('volume');
  }

  get poids() {
    return this.produitFormGroup.get('poids');
  }

  activerDimensions() {
    // let dimensionsSontVides =
    //   this.longueur.value === '' &&
    //   this.largeur.value === '' &&
    //   this.hauteur.value === '';
    // if (dimensionsSontVides) {
    //   this.volume.enable();
    // } else {
    //   this.volume.disable();
    // }
  }

  activerVolume() {
    // if (this.volume.value === '') {
    //   this.longueur.enable();
    //   this.largeur.enable();
    //   this.hauteur.enable();
    // } else {
    //   this.longueur.disable();
    //   this.largeur.disable();
    //   this.hauteur.disable();
    // }
  }

  calculerVolume() {
    return (
      Number(this.longueur.value) *
      Number(this.largeur.value) *
      Number(this.hauteur.value)
    );
  }

  enregistrer() {
    let produit = new Produit(
      this.nomProduit.value,
      this.marque.value,
      this.unite.value,
      this.valeurUnite.value,
      this.codeBarre.value,
      this.longueur.value,
      this.largeur.value,
      this.hauteur.value,
      this.volume.value,
      this.poids.value
    );
    this.service.creerProduit(produit).subscribe((result) => {
      Swal.fire({
        icon: 'success',
        title: 'Produit ajouté avec succée',
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Produit } from '../classes/produit';
import { ProduitService } from '../services/produit.service';

@Component({
  selector: 'app-modifier-produit',
  templateUrl: './modifier-produit.component.html',
  styleUrls: ['./modifier-produit.component.scss'],
})
export class ModifierProduitComponent implements OnInit {
  produitFormGroup: FormGroup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  dimensionsActive = true;
  volumeActive = true;

  produit: Produit;

  constructor(private fb: FormBuilder, private service: ProduitService, private router: Router) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1004400');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    this.produit = this.service.prod;
    this.produitFormGroup = this.fb.group({
      marque: [this.produit.marque, [Validators.required]],
      nom: [this.produit.nom, [Validators.required]],
      unite: [this.produit.unite, [Validators.required]],
      valeurUnite: [
        this.produit.valeurUnite,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      codeBarre: [this.produit.codeBarre, [Validators.required]],
      longueur: [
        this.produit.longueur,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      largeur: [
        this.produit.largeur,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      hauteur: [
        this.produit.hauteur,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      volume: [
        this.produit.volume,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      poids: [
        this.produit.poids,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
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
    this.dimensionsActive = true;
    this.volumeActive = false;
  }

  activerVolume() {
    this.dimensionsActive = false;
    this.volumeActive = true;
  }

  //bouton annuler
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
        this.router.navigate(['/Menu/Menu_Colisage/Produits/liste-produits']);
      }
    });
  }

  enregistrer() {
    this.produit.nom = this.nomProduit.value;
    this.produit.marque = this.marque.value;
    this.produit.unite = this.unite.value;
    this.produit.valeurUnite = this.valeurUnite.value;
    this.produit.codeBarre = this.codeBarre.value;
    this.produit.longueur = this.longueur.value;
    this.produit.largeur = this.largeur.value;
    this.produit.hauteur = this.hauteur.value;
    this.produit.volume = this.volume.value;
    this.produit.poids = this.poids.value;

    this.service.modifierProduit(this.produit).subscribe((result) => {
      Swal.fire({
        icon: 'success',
        title: 'Produit modifié avec succée',
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }
}

import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ConfigurationExcelProduit } from '../classes/configuration-excel-produit';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

@Component({
  selector: 'app-configuration-produit',
  templateUrl: './configuration-produit.component.html',
  styleUrls: ['./configuration-produit.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('300ms', style({ opacity: 1, top: '30px' })),
      ]),
    ]),
  ],
})
export class ConfigurationProduitComponent implements OnInit {
  formParametreExcel: FormGroup;
  parametreExcel: ConfigurationExcelProduit;
  constructor(
    private fb: FormBuilder,
    private service: ConfigurationTmsService
  ) {}

  ngOnInit(): void {
    this.creerForm();
    this.service.getConfigurationProduit().subscribe((result) => {
      this.parametreExcel = result;
      if (this.parametreExcel) {
        this.id.setValue(this.parametreExcel.idProduit);
        this.nom.setValue(this.parametreExcel.nom);
        this.marque.setValue(this.parametreExcel.marque);
        this.unite.setValue(this.parametreExcel.unite);
        this.valeurUnite.setValue(this.parametreExcel.valeurUnite);
        this.codeBarre.setValue(this.parametreExcel.codeBarre);
        this.longueur.setValue(this.parametreExcel.longueur);
        this.largeur.setValue(this.parametreExcel.largeur);
        this.hauteur.setValue(this.parametreExcel.hauteur);
        this.volume.setValue(this.parametreExcel.volume);
        this.poids.setValue(this.parametreExcel.poids);
      }
    });
  }

  //création du formGroup
  creerForm() {
    this.formParametreExcel = this.fb.group({
      id: ['', Validators.required],
      nom: ['', Validators.required],
      marque: ['', Validators.required],
      unite: ['', Validators.required],
      valeurUnite: ['', Validators.required],
      codeBarre: ['', Validators.required],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required],
      poids: ['', Validators.required],
    });
  }

  //get le formControl id
  get id() {
    return this.formParametreExcel.get('id');
  }

  //get le formControl nom
  get nom() {
    return this.formParametreExcel.get('nom');
  }

  //get le formControl marque
  get marque() {
    return this.formParametreExcel.get('marque');
  }

  //get le formControll unite
  get unite() {
    return this.formParametreExcel.get('unite');
  }

  //get le formControl valeurUnite
  get valeurUnite() {
    return this.formParametreExcel.get('valeurUnite');
  }

  //get le formControl codeBarre
  get codeBarre() {
    return this.formParametreExcel.get('codeBarre');
  }

  //get le formControl longueur
  get longueur() {
    return this.formParametreExcel.get('longueur');
  }

  //get le formControl largeur
  get largeur() {
    return this.formParametreExcel.get('largeur');
  }

  // get le formControl hauteur
  get hauteur() {
    return this.formParametreExcel.get('hauteur');
  }

  // get le formControl volume
  get volume() {
    return this.formParametreExcel.get('volume');
  }

  // get le formControl poids
  get poids() {
    return this.formParametreExcel.get('poids');
  }

  // enregistrer les paramétres des fichiers excel
  enregistrerParametreExcel() {
    let nouveauParametreExcel = new ConfigurationExcelProduit(
      this.id.value,
      this.nom.value,
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
    // si les paramétres fichiers excel sont deja existantes on les modifie si non en créent des nouvelles coefficients
    if (this.parametreExcel) {
      this.service
        .modifierConfigurationProduit(nouveauParametreExcel)
        .subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Configuration bien enregistrée',
              showConfirmButton: false,
              timer: 1500,
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: "Une erreur est survenue lors de l'enregistrement de vos modifications!",
            });
          }
        );
    } else {
      this.service.createConfigurationProduit(nouveauParametreExcel).subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Configuration bien enregistrée',
            showConfirmButton: false,
            timer: 1500,
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Une erreur est survenue lors de l'enregistrement de vos modifications!",
          });
        }
      );
    }
  }
}

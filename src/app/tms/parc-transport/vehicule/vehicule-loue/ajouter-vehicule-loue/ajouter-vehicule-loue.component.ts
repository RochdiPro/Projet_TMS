/*  Constructeur: get droit d'accées depuis sessionStorage
Liste Méthodes:
* enregistrerVehicule: créer nouveau vehicule.
* annuler: retour a la liste de vehicules sans enregistrer.
* testTypeMatricule: tester le type de matricule si elle est TUN ou RS.
* chargerCarburants: get liste carburants.
* fermerAjouterVehicule: retourner vers fenetre lister.
* getListeMatricules: get liste des matricules enregistrés
* verifierMatricule: verifier existance matricule.
*/
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../../services/vehicule.service';

@Component({
  selector: 'app-ajouter-vehicule-loue',
  templateUrl: './ajouter-vehicule-loue.component.html',
  styleUrls: ['./ajouter-vehicule-loue.component.scss'],
})
export class AjouterVehiculeLoueComponent implements OnInit {
  typematricules = [
    //les types de matricules tunisiennes
    { name: 'TUN', value: 'TUN' },
    { name: 'RS', value: 'RS' },
  ];
  carosserie = [
    //types de carosserie des véhicules et leur catégories de permis accordées
    { name: 'DEUX ROUES', value: 'A/A1/B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'VOITURES PARTICULIÈRES', value: 'B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'POIDS LOURDS', value: 'C/C+E' },
    { name: 'POIDS LOURDS ARTICULÉS', value: 'C+E' },
  ];
  form: FormGroup;
  inputMatriculeTunEstAffiche = false; //pour afficher le inputField des matricules TUN ou RS
  inputMatriculeRsEstAffiche = false;
  matricule = '';
  typeMatriculeSelectionne = 'TUN'; //pour enregistrer le type de matricule choisi
  categorie: String; //pour enregistrer la categorie de permis qui peuvent conduire le vehicule
  minDate = new Date(); //utilisé pour la desactivation des dates passées dans le datePicker
  matriculeExiste = false;
  matricules: string[];
  carburants: any;
  carburant: any;

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  constructor(
    public fb: FormBuilder,
    public service: VehiculeService,
    public router: Router,
    public _location: Location
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
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
      chargeUtile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      longueur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      largeur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      hauteur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      dateDebut: [''],
      dateFin: [''],
      kmactuel: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      carburant: ['', [Validators.required]],
      consommationnormale: [
        '',
        [Validators.required, Validators.pattern('[+]?([0-9]*[.])?[0-9]+')],
      ],
      capaciteReservoir: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
    });
    this.testTypeMatricule();
    this.getListeMatricules();
    this.chargerCarburants();
  }
  // get liste carburants
  async chargerCarburants() {
    this.carburants = await this.service.carburants().toPromise();
  }

  //tester le type de matricule si elle est TUN ou RS
  testTypeMatricule(): void {
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //si le type de matricule est TUN on definie les validateurs de ses inputFields et on supprime les validateurs du type RS
      this.inputMatriculeTunEstAffiche = true;
      this.inputMatriculeRsEstAffiche = false;

      this.form
        .get('matriculetun1')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form
        .get('matriculetun2')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.get('matriculers').setValidators([]);
      this.form.get('matriculers').updateValueAndValidity();
      this.form.patchValue({ matriculers: '' });
    } else if (typeMatriculeEstRS) {
      //si le type de matricule est RS on definie les validateurs de son inputField et on supprime les validateurs du type TUN
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = true;
      this.form
        .get('matriculers')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.form.get('matriculers').updateValueAndValidity();
      this.form.get('matriculetun1').setValidators([]);
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form.get('matriculetun2').setValidators([]);
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.patchValue({ matriculetun1: '', matriculetun2: '' });
    } else {
      //si aucun type selectionné on supprime les validateurs du type
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = false;
      this.form.get('matriculetun1').setValidators([]);
      this.form.get('matriculetun1').updateValueAndValidity();
      this.form.get('matriculetun2').setValidators([]);
      this.form.get('matriculetun2').updateValueAndValidity();
      this.form.get('matriculers').setValidators([]);
      this.form.get('matriculers').updateValueAndValidity();
      this.form.patchValue({
        matriculetun1: '',
        matriculetun2: '',
        matriculers: '',
      });
    }
  }

  //retourner vers fenetre lister
  fermerAjouterVehicule(): void {
    this.router.navigateByUrl(
      '/Menu/TMS/Parc/Vehicules/Vehicules-Loues/lister-vehicules'
    );
  }

  //créer nouveau vehicule
  async enregistrerVehicule() {
    var formData: any = new FormData();
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //tester le type de matricule selectionné pour l'enregistrer
      this.matricule = '';
      this.matricule = this.form
        .get('matriculetun1')
        .value.toString()
        .concat('TUN');
      this.matricule = this.matricule.concat(
        this.form.get('matriculetun2').value.toString()
      );
    } else if (typeMatriculeEstRS) {
      this.matricule = '';
      var rsstr = 'RS';
      this.matricule = rsstr.concat(this.form.get('matriculers').value);
    }
    formData.append('matricule', this.matricule);
    formData.append('marque', this.form.get('marque').value);
    formData.append('modele', this.form.get('modele').value);
    formData.append('couleur', this.form.get('couleur').value);
    formData.append('proprietaire', this.form.get('proprietaire').value);
    formData.append('num_proprietaire', this.form.get('telephone').value);
    formData.append('categories', this.categorie);
    formData.append('charge_utile', this.form.get('chargeUtile').value);
    formData.append('longueur', this.form.get('longueur').value);
    formData.append('largeur', this.form.get('largeur').value);
    formData.append('hauteur', this.form.get('hauteur').value);
    formData.append('etat_vehicule', 'Disponible');
    formData.append('position_vehicule', 'Sfax');
    formData.append(
      'date_debut_location',
      new Date(this.form.get('dateDebut').value)
    );
    formData.append(
      'date_fin_location',
      new Date(this.form.get('dateFin').value)
    );
    formData.append(
      'kmactuel',
      this.form.get('kmactuel').value
    );
    formData.append('carburant', this.carburant.nom);
    formData.append(
      'consommationNormale',
      this.form.get('consommationnormale').value
    );
    formData.append(
      'capaciteReservoir',
      this.form.get('capaciteReservoir').value
    );
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
        this.router.navigateByUrl(
          '/Menu/TMS/Parc/Vehicules/Vehicules-Loues/lister-vehicules'
        );
        Swal.fire('Vehicul enregistré!', '', 'success');
      } else if (result.isDenied) {
        this.router.navigateByUrl(
          '/Menu/TMS/Parc/Vehicules/Vehicules-Loues/lister-vehicules'
        );
      }
    });
  }

  // get liste des matricules enregistrés
  getListeMatricules() {
    this.service
      .getMatriculesVehiculesPrives()
      .subscribe((matriculesPrives: any) => {
        this.service
          .getMatriculesVehiculesLoues()
          .subscribe((matriculesLoues: any) => {
            this.matricules = matriculesPrives.concat(matriculesLoues);
          });
      });
  }

  // verifier existance matricule
  verifierMatricule() {
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //tester le type de matricule selectionné pour l'enregistrer
      this.matricule = '';
      this.matricule = (this.form.get('matriculetun1').value + '').concat(
        'TUN'
      );
      this.matricule = this.matricule.concat(
        this.form.get('matriculetun2').value
      );
    } else if (typeMatriculeEstRS) {
      this.matricule = '';
      var rsstr = 'RS';
      this.matricule = rsstr.concat(this.form.get('matriculers').value);
    }
    let matriculesTrouvees = this.matricules.filter(
      (matricule) => matricule == this.matricule
    );
    if (matriculesTrouvees.length > 0) {
      this.matriculeExiste = true;
    } else {
      this.matriculeExiste = false;
    }
  }
}

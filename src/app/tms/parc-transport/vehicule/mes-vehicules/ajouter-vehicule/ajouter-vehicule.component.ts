import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../../services/vehicule.service';

@Component({
  selector: 'app-ajouter-vehicule',
  templateUrl: './ajouter-vehicule.component.html',
  styleUrls: ['./ajouter-vehicule.component.scss'],
})
export class AjouterVehiculeComponent implements OnInit {
  //Declaration des variables
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
  caracteristiquesFormGroup: FormGroup;
  entretienEtPapierFormGroup: FormGroup;
  inputMatriculeTunEstAffiche = false; //pour afficher le inputField des matricules TUN ou RS
  inputMatriculeRsEstAffiche = false;
  matricule = '';
  typeMatriculeSelectionne = 'TUN'; //pour enregistrer le type de matricule choisi
  categorie: String; //pour enregistrer la categorie de permis qui peuvent conduire le vehicule
  carburant: any;
  prixCarburant: any;
  minDate = new Date(); //utilisé pour la desactivation des dates passées dans le datePicker
  carburants: any;

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  // constructeur
  constructor(
    public fb: FormBuilder,
    public service: VehiculeService,
    public router: Router
  ) {
    sessionStorage.setItem('Utilisateur', '' + "tms2");
    sessionStorage.setItem('Acces', "1004400");

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }
  ngOnInit(): void {
    this.caracteristiquesFormGroup = this.fb.group({
      typematricule: ['TUN', [Validators.required]],
      serieVoiture: [''],
      numeroVoiture: [''],
      matriculeRS: [''],
      marque: ['', [Validators.required]],
      modele: ['', [Validators.required]],
      couleur: ['', [Validators.required]],
      car: ['', [Validators.required]],
      consommationnormale: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      carburant: ['', [Validators.required]],
      chargeUtile: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      longueur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      largeur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      hauteur: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
    this.entretienEtPapierFormGroup = this.fb.group({
      kmactuel: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      kmProchainVidangeHuileMoteur: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainVidangeLiquideRefroidissement: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainVidangeHuileBoiteVitesse: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainChangementFiltreClimatiseur: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainChangementFiltreCarburant: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainChangementBougies: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainChangementCourroies: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      kmProchainChangementPneus: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      datevisite: ['', [Validators.required]],
      dateassurance: ['', [Validators.required]],
      datetaxe: ['', [Validators.required]],
    });
    this.chargerCarburants();
    this.testTypeMatricule();
  }

  async chargerCarburants() {
    this.carburants = await this.service.carburants().toPromise();
  }

  // Bouton Enregistrer
  async enregistrerVehicule() {
    //enregistrer les données
    var formData: any = new FormData();
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //tester le type de matricule selectionné pour l'enregistrer
      this.matricule = '';
      this.matricule = this.caracteristiquesFormGroup
        .get('serieVoiture')
        .value.toString()
        .concat('TUN');
      this.matricule = this.matricule.concat(
        this.caracteristiquesFormGroup.get('numeroVoiture').value.toString()
      );
    } else if (typeMatriculeEstRS) {
      this.matricule = '';
      this.matricule = 'RS'.concat(
        this.caracteristiquesFormGroup.get('matriculeRS').value
      );
    }
    formData.append('matricule', this.matricule);
    formData.append(
      'marque',
      this.caracteristiquesFormGroup.get('marque').value
    );
    formData.append(
      'modele',
      this.caracteristiquesFormGroup.get('modele').value
    );
    formData.append(
      'couleur',
      this.caracteristiquesFormGroup.get('couleur').value
    );
    formData.append('categories', this.categorie);
    formData.append(
      'kmactuel',
      this.entretienEtPapierFormGroup.get('kmactuel').value
    );
    formData.append(
      'kilometrageProchainVidangeHuileMoteur',
      this.entretienEtPapierFormGroup.get('kmProchainVidangeHuileMoteur').value
    );
    formData.append(
      'kilometrageProchainVidangeLiquideRefroidissement',
      this.entretienEtPapierFormGroup.get(
        'kmProchainVidangeLiquideRefroidissement'
      ).value
    );
    formData.append(
      'kilometrageProchainVidangeHuileBoiteVitesse',
      this.entretienEtPapierFormGroup.get('kmProchainVidangeHuileBoiteVitesse')
        .value
    );
    formData.append(
      'kilometrageProchainChangementFiltreClimatiseur',
      this.entretienEtPapierFormGroup.get(
        'kmProchainChangementFiltreClimatiseur'
      ).value
    );
    formData.append(
      'kilometrageProchainChangementFiltreCarburant',
      this.entretienEtPapierFormGroup.get('kmProchainChangementFiltreCarburant')
        .value
    );
    formData.append(
      'kilometrageProchainChangementBougies',
      this.entretienEtPapierFormGroup.get('kmProchainChangementBougies').value
    );
    formData.append(
      'kilometrageProchainChangementCourroies',
      this.entretienEtPapierFormGroup.get('kmProchainChangementCourroies').value
    );
    formData.append(
      'kilometrageProchainChangementPneus',
      this.entretienEtPapierFormGroup.get('kmProchainChangementPneus').value
    );
    formData.append(
      'consommationNormale',
      this.caracteristiquesFormGroup.get('consommationnormale').value
    );
    formData.append('montantConsomme', 0);
    formData.append('carburant', this.carburant.nom);
    formData.append(
      'charge_utile',
      this.caracteristiquesFormGroup.get('chargeUtile').value
    );
    formData.append(
      'longueur',
      this.caracteristiquesFormGroup.get('longueur').value
    );
    formData.append(
      'largeur',
      this.caracteristiquesFormGroup.get('largeur').value
    );
    formData.append(
      'hauteur',
      this.caracteristiquesFormGroup.get('hauteur').value
    );
    formData.append(
      'charge_restante',
      this.caracteristiquesFormGroup.get('chargeUtile').value
    );
    formData.append(
      'surface_restante',
      Number(this.caracteristiquesFormGroup.get('longueur').value) *
        Number(this.caracteristiquesFormGroup.get('largeur').value) *
        Number(this.caracteristiquesFormGroup.get('hauteur').value)
    );
    formData.append(
      'datevisite',
      new Date(this.entretienEtPapierFormGroup.get('datevisite').value)
    );
    formData.append(
      'dateassurance',
      new Date(this.entretienEtPapierFormGroup.get('dateassurance').value)
    );
    formData.append(
      'datetaxe',
      new Date(this.entretienEtPapierFormGroup.get('datetaxe').value)
    );
    formData.append('sujet', '');
    formData.append('description', '');
    formData.append('etatVehicule', 'Disponible');
    formData.append('positionVehicule', 'Sfax');
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.createvehicule(formData).toPromise();
        Swal.fire('Vehicul enregistré!', '', 'success');
        this.router.navigateByUrl(
          '/Menu/TMS/Parc/Vehicules/Mes-Vehicules/lister-vehicules'
        );
      }
    });
  }
  annuler() {
    this.router.navigateByUrl(
      '/Menu/TMS/Parc/Vehicules/Mes-Vehicules/lister-vehicules'
    );
  }

  testTypeMatricule(): void {
    //tester le type de matricule si elle est TUN ou RS
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //si le type de matricule est TUN on definie les validateurs de ses inputFields et on supprime les validateurs du type RS
      this.inputMatriculeTunEstAffiche = true;
      this.inputMatriculeRsEstAffiche = false;

      this.caracteristiquesFormGroup
        .get('serieVoiture')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.caracteristiquesFormGroup
        .get('serieVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup
        .get('numeroVoiture')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.caracteristiquesFormGroup
        .get('numeroVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.get('matriculeRS').setValidators([]);
      this.caracteristiquesFormGroup
        .get('matriculeRS')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.patchValue({ matriculeRS: '' });
    } else if (typeMatriculeEstRS) {
      //si le type de matricule est RS on definie les validateurs de son inputField et on supprime les validateurs du type TUN
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = true;
      this.caracteristiquesFormGroup
        .get('matriculeRS')
        .setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      this.caracteristiquesFormGroup
        .get('matriculeRS')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.get('serieVoiture').setValidators([]);
      this.caracteristiquesFormGroup
        .get('serieVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.get('numeroVoiture').setValidators([]);
      this.caracteristiquesFormGroup
        .get('numeroVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.patchValue({
        serieVoiture: '',
        matriculetun2: '',
      });
    } else {
      //si aucun type selectionné on supprime les validateurs du type
      this.inputMatriculeTunEstAffiche = false;
      this.inputMatriculeRsEstAffiche = false;
      this.caracteristiquesFormGroup.get('serieVoiture').setValidators([]);
      this.caracteristiquesFormGroup
        .get('serieVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.get('numeroVoiture').setValidators([]);
      this.caracteristiquesFormGroup
        .get('numeroVoiture')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.get('matriculeRS').setValidators([]);
      this.caracteristiquesFormGroup
        .get('matriculeRS')
        .updateValueAndValidity();
      this.caracteristiquesFormGroup.patchValue({
        serieVoiture: '',
        numeroVoiture: '',
        matriculeRS: '',
      });
    }
  }
}

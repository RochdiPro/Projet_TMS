/*  Constructeur: get droit d'accées depuis sessionStorage
Liste Méthodes:
* chargerCarburants: get liste carburants;
* enregistrerVehicule: créer nouveau vehicule.
* annuler: retour a la liste de vehicules sans enregistrer.
* testTypeMatricule: tester le type de matricule si elle est TUN ou RS.
* getListeMatricules: get liste des matricules deja enregistrés.
* verifierMatricule: verifier l'existance du matricule saisie.
*/
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VehiculeService } from '../../services/vehicule.service';

@Component({
  selector: 'app-modifier-vehicule',
  templateUrl: './modifier-vehicule.component.html',
  styleUrls: ['./modifier-vehicule.component.scss'],
})
export class ModifierVehiculeComponent implements OnInit {
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
  matriculeExiste = false;
  matricules: string[];

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;
  vehicule: any;
  constructor(
    public fb: FormBuilder,
    public service: VehiculeService,
    public router: Router
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  ngOnInit(): void {
    this.vehicule = this.service.vehiculeAModifier;
    if (this.vehicule) {
      this.caracteristiquesFormGroup = this.fb.group({
        typematricule: ['TUN', [Validators.required]],
        serieVoiture: [''],
        numeroVoiture: [''],
        matriculeRS: [''],
        marque: [this.vehicule.marque, [Validators.required]],
        modele: [this.vehicule.modele, [Validators.required]],
        couleur: [this.vehicule.couleur, [Validators.required]],
        car: [this.vehicule.categories, [Validators.required]],
        consommationnormale: [
          this.vehicule.consommationNormale,
          [Validators.required, Validators.pattern('[+]?([0-9]*[.])?[0-9]+')],
        ],
        capaciteReservoir: [
          this.vehicule.capaciteReservoir,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        carburant: ['', [Validators.required]],
        chargeUtile: [
          this.vehicule.charge_utile,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        longueur: [
          this.vehicule.longueur,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        largeur: [
          this.vehicule.largeur,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        hauteur: [
          this.vehicule.hauteur,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
      });
      let matricule = [];
      if (this.vehicule.matricule[0] === 'R') {
        this.typeMatriculeSelectionne = 'RS';
        matricule = this.vehicule.matricule.split('RS');
        this.caracteristiquesFormGroup.get('typematricule').setValue('RS');
        this.caracteristiquesFormGroup
          .get('matriculeRS')
          .setValue(matricule[1]);
        this.caracteristiquesFormGroup
          .get('matriculeRS')
          .setValidators([Validators.required]);
      } else {
        this.typeMatriculeSelectionne = 'TUN';
        matricule = this.vehicule.matricule.split('TUN');
        this.caracteristiquesFormGroup.get('typematricule').setValue('TUN');
        this.caracteristiquesFormGroup
          .get('serieVoiture')
          .setValue(matricule[0]);
        this.caracteristiquesFormGroup
          .get('serieVoiture')
          .setValidators([Validators.required]);
        this.caracteristiquesFormGroup
          .get('numeroVoiture')
          .setValue(matricule[1]);
        this.caracteristiquesFormGroup
          .get('numeroVoiture')
          .setValidators([Validators.required]);
      }
      this.categorie = this.vehicule.categories;
      this.entretienEtPapierFormGroup = this.fb.group({
        kmactuel: [
          this.vehicule.kmactuel,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainVidangeHuileMoteur: [
          this.vehicule.kilometrageProchainVidangeHuileMoteur,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainVidangeLiquideRefroidissement: [
          this.vehicule.kilometrageProchainVidangeLiquideRefroidissement,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainVidangeHuileBoiteVitesse: [
          this.vehicule.kilometrageProchainVidangeHuileBoiteVitesse,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainChangementFiltreClimatiseur: [
          this.vehicule.kilometrageProchainChangementFiltreClimatiseur,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainChangementFiltreCarburant: [
          this.vehicule.kilometrageProchainChangementFiltreCarburant,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainChangementBougies: [
          this.vehicule.kilometrageProchainChangementBougies,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainChangementCourroies: [
          this.vehicule.kilometrageProchainChangementCourroies,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        kmProchainChangementPneus: [
          this.vehicule.kilometrageProchainChangementPneus,
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        datevisite: [new Date(this.vehicule.datevisite), [Validators.required]],
        dateassurance: [
          new Date(this.vehicule.dateassurance),
          [Validators.required],
        ],
        datetaxe: [new Date(this.vehicule.datetaxe), [Validators.required]],
      });
      this.testTypeMatricule();
      this.chargerCarburants();
      this.getListeMatricules();
    }
  }

  // get liste carburants
  async chargerCarburants() {
    this.carburants = await this.service.carburants().toPromise();
    let carburant = this.carburants.filter(
      (carb: any) => carb.nom === this.vehicule.carburant
    );
    this.caracteristiquesFormGroup.get('carburant').setValue(carburant[0]);
    this.carburant = carburant[0];
  }

  // Bouton Enregistrer
  //créer nouveau vehicule
  async enregistrerVehicule() {
    Swal.fire({
      title: 'Êtes vous sûr?',
      text: 'Ces données sont trés sensibles! Les changements ne sont pas recommandés',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then((result) => {
      if (result.isConfirmed) {
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
        formData.append('id', this.vehicule.id);
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
          this.entretienEtPapierFormGroup.get('kmProchainVidangeHuileMoteur')
            .value
        );
        formData.append(
          'kilometrageProchainVidangeLiquideRefroidissement',
          this.entretienEtPapierFormGroup.get(
            'kmProchainVidangeLiquideRefroidissement'
          ).value
        );
        formData.append(
          'kilometrageProchainVidangeHuileBoiteVitesse',
          this.entretienEtPapierFormGroup.get(
            'kmProchainVidangeHuileBoiteVitesse'
          ).value
        );
        formData.append(
          'kilometrageProchainChangementFiltreClimatiseur',
          this.entretienEtPapierFormGroup.get(
            'kmProchainChangementFiltreClimatiseur'
          ).value
        );
        formData.append(
          'kilometrageProchainChangementFiltreCarburant',
          this.entretienEtPapierFormGroup.get(
            'kmProchainChangementFiltreCarburant'
          ).value
        );
        formData.append(
          'kilometrageProchainChangementBougies',
          this.entretienEtPapierFormGroup.get('kmProchainChangementBougies')
            .value
        );
        formData.append(
          'kilometrageProchainChangementCourroies',
          this.entretienEtPapierFormGroup.get('kmProchainChangementCourroies')
            .value
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
        formData.append('consommationActuelle', 0);
        formData.append('historiqueConsommation', '');
        formData.append(
          'capaciteReservoir',
          this.caracteristiquesFormGroup.get('capaciteReservoir').value
        );
        Swal.fire({
          title: 'Voulez vous enregistrer?',
          showCancelButton: true,
          confirmButtonText: 'Oui',
          cancelButtonText: 'Non',
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this.service.modifierVehicule(formData).toPromise();
            Swal.fire('Vehicul enregistré!', '', 'success');
            this.router.navigateByUrl(
              '/Menu/TMS/Parc/Vehicules/Mes-Vehicules/lister-vehicules'
            );
          }
        });
      }
    });
  }

  // retour a la liste de vehicules sans enregistrer
  annuler() {
    this.router.navigateByUrl(
      '/Menu/TMS/Parc/Vehicules/Mes-Vehicules/lister-vehicules'
    );
  }

  //tester le type de matricule si elle est TUN ou RS
  testTypeMatricule(): void {
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

  // get liste des matricules deja enregistrés
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

  // verifier l'existance du matricule saisie
  verifierMatricule() {
    let typeMatriculeEstTUN = this.typeMatriculeSelectionne === 'TUN';
    let typeMatriculeEstRS = this.typeMatriculeSelectionne === 'RS';
    if (typeMatriculeEstTUN) {
      //tester le type de matricule selectionné pour l'enregistrer
      this.matricule = '';
      this.matricule = (
        this.caracteristiquesFormGroup.get('serieVoiture').value + ''
      ).concat('TUN');
      this.matricule = this.matricule.concat(
        this.caracteristiquesFormGroup.get('numeroVoiture').value + ''
      );
    } else if (typeMatriculeEstRS) {
      this.matricule = '';
      this.matricule = 'RS'.concat(
        this.caracteristiquesFormGroup.get('matriculeRS').value
      );
    }
    let matriculesTrouvees = this.matricules.filter(
      (matricule) => matricule == this.matricule
    );
    if (
      matriculesTrouvees.length > 0 &&
      this.vehicule.matricule != this.matricule
    ) {
      this.matriculeExiste = true;
    } else {
      this.matriculeExiste = false;
    }
  }
}

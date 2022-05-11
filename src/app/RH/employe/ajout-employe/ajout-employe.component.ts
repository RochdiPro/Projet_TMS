import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import Swal from 'sweetalert2';
import { EmployeServiceService } from '../Service/employe-service.service';
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-ajout-employe',
  templateUrl: './ajout-employe.component.html',
  styleUrls: ['./ajout-employe.component.scss'],
})
export class AjoutEmployeComponent implements OnInit {
  //passage d'une étape à une autre uniquement si l'étape est validée
  passage_etape = false;
  pays: string;
  ville: string;
  region: string;
  categorie_region: any;
  categorie_ville: any;
  categorie_pays: any;
  categorie_banque: any;
  roles: any;
  categorie_piece: any;
  Acces: any;
  choix_Categorie_Fiscale: any;
  Informations_Generales_Form: FormGroup;
  Informations_Banques_Form: FormGroup;
  ContactForm: FormGroup;
  Recapitulation_Form: FormGroup;
  modeleSrc: any;
  modele: any;
  image_par_defaut_blob: any;
  imageSrc: any;
  date: any;
  locals: any;
  constructor(
    private http: HttpClient,
    public service: EmployeServiceService,
    private fb: FormBuilder,
    public datepipe: DatePipe
  ) {
    this.ChargementImage();
    this.sansChoixImage();
    this.chargementModel();
    this.modelePdfBase64();
    this.locals = [
      {
        id_Local: 1,
        nom_Local: 'principal',
        email: '',
        fax: '',
        adresse: '',
        largeur: 0.0,
        hauteur: 0.0,
        responsable: '',
        tel: '',
        date_Fin: '',
        date_Debut: '',
        surface: 0.0,
        detail: '',
        detail_Type: '',
        date_Creation: '',
        frais: 0.0,
        latitude: 0.0,
        profondeur: 0.0,
        nature_Frais: '',
        longitude: 0.0,
        categorie_Local: '',
        description_Local: '',
        nature_Contrat: '',
      },
    ];
    //   formulaire contenant les informations générales d'employé
    this.Informations_Generales_Form = this.fb.group({
      Nom_Employe: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      Role: ['', Validators.required],
      local: [{ value: 'principal', disabled: true }, Validators.required],
      Date_naissance: ['', [Validators.required]],
      Type_Piece_Identite: ['', Validators.required],
      N_Piece_Identite: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
        ],
      ],
      Date_Livraison_Identite: [],
      Description: [''],
      Date_embauche: [],
    });
    this.Acces = this.fb.group({
      Acces: ['1000000'],
      login: [''],
      pwd: [''],
      vente: ['0'],
      achat: ['0'],
      config: ['0'],
      rh: ['0'],
      tms: ['0'],
      wms: ['0'],
    });

    //   formulaire contenant les informations spécifique d' employe
    this.Informations_Banques_Form = this.fb.group({
      Image: [''],
      Email: ['', [Validators.required, Validators.email]],
      Banque1: [''],
      Rib1: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(20),
        ],
      ],
      Adresse: ['', [Validators.required]],
      Pays: ['' , Validators.required],
      Ville: [''],
      Tel1: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ],
      ],
      Cnss: [''],
      St_familliale: [''],
      Enfant_a_charge: [''],
      N_permis: [''],
      Date_permis: [''],
      Categorie_permis: [''],
    });

    this.Informations_Banques_Form.controls.Rib1.disable();

    // formulaire affichant la récapitulation des tous les champs
    this.Recapitulation_Form = this.fb.group({});

    // récupérer la liste des categories employé
    this.service.ListerCategorieEmploye().subscribe((reponse: Response) => {
      this.roles = reponse;
    });

    // récupérer la liste des categories pièce d'identité
    this.service.ListerCategoriePiece().subscribe((reponse: Response) => {
      this.categorie_piece = reponse;
    });

    // récupérer la liste des categories banques
    this.service.ListerBanques().subscribe((reponse: Response) => {
      this.categorie_banque = reponse;
    });
    // récupérer la liste des pays
    this.service.ListerPays().subscribe((reponse: Response) => {
      this.categorie_pays = reponse;
    });
  }

  ChoixBanque2(event: MatSelectChange) {
    this.Informations_Banques_Form.controls.Rib2.enable();
  }
  // reactiver saisi rib1

  ChoixBanque1(event: MatSelectChange) {
    this.Informations_Banques_Form.controls.Rib1.enable();
  }

  // fonction activée lors de choix du pays pour récupérer la liste des villes dans ce dernier
ChoixPays(event: MatSelectChange) {
  this.pays = event.value;
  this.service.ListerVille(this.pays).subscribe((reponse: Response) => {
    this.categorie_ville = reponse;
  });
}

// fonction activée lors de choix de la ville pour récupérer la liste des régions dans cette dernière
ChoixVille(event: MatSelectChange) {
  this.ville = event.value;
  this.service.ListerRegion(this.ville).subscribe((reponse: Response) => {
    this.categorie_region = reponse;
  });
}

  //  création d' Employé
  creeremploye() {
    const nom_image_par_defaut = 'image_par_defaut.png';
    const Fichier_image_par_defaut = new File(
      [this.image_par_defaut_blob],
      nom_image_par_defaut,
      { type: 'image/png' }
    );
    var formData: any = new FormData();
    formData.append(
      'Nom',
      this.Informations_Generales_Form.get('Nom_Employe').value
    );
    formData.append('Role', this.Informations_Generales_Form.get('Role').value);
    formData.append('Acces', this.Acces.get('Acces').value);
    if (this.Informations_Banques_Form.get('Image').value === '') {
      formData.append('Image', Fichier_image_par_defaut);
    } else
      formData.append(
        'Image',
        this.Informations_Banques_Form.get('Image').value
      );
    formData.append(
      'Type_Piece_Identite',
      this.Informations_Generales_Form.get('Type_Piece_Identite').value
    );
    formData.append(
      'N_Piece_Identite',
      this.Informations_Generales_Form.get('N_Piece_Identite').value
    );
    if (
      this.Informations_Generales_Form.get('Date_Livraison_Identite').value ===
      null
    ) {
      formData.append('Date_Piece_Identite', '01/01/1900');
    } else
      formData.append(
        'Date_Piece_Identite',
        this.Informations_Generales_Form.get('Date_Livraison_Identite').value
      );
    formData.append(
      'Description',
      this.Informations_Generales_Form.get('Description').value
    );
    formData.append(
      'Local',
      this.Informations_Generales_Form.get('local').value
    );
    formData.append(
      'Banque',
      this.Informations_Banques_Form.get('Banque1').value
    );
    formData.append('Rib', this.Informations_Banques_Form.get('Rib1').value);
    formData.append(
      'Date_de_naissance',
      this.Informations_Generales_Form.get('Date_embauche').value
    );
    formData.append(
      'Date_de_embauche',
      this.Informations_Generales_Form.get('Date_naissance').value
    );
    formData.append(
      'Adresse',
      this.Informations_Banques_Form.get('Adresse').value
    );
    formData.append('Ville', this.Informations_Banques_Form.get('Ville').value);
    formData.append('Pays', this.Informations_Banques_Form.get('Pays').value);
    formData.append('Email', this.Informations_Banques_Form.get('Email').value);
    formData.append('Tel', this.Informations_Banques_Form.get('Tel1').value);

    formData.append('Cnss', this.Informations_Banques_Form.get('Cnss').value);
    formData.append(
      'Situation_Familiale',
      this.Informations_Banques_Form.get('St_familliale').value
    );
    if (this.Informations_Banques_Form.get('Enfant_a_charge').value === '') {
      formData.append('Enfant_A_Charge', '0');
    } else
      formData.append(
        'Enfant_A_Charge',
        this.Informations_Banques_Form.get('Enfant_a_charge').value
      );
    formData.append(
      'Permis',
      this.Informations_Banques_Form.get('N_permis').value
    );
    console.log(this.Informations_Banques_Form.get('Date_permis').value + '00');
    if (this.Informations_Banques_Form.get('Date_permis').value === '') {
      formData.append('Date_de_Permis', '01/01/1900');
    } else
      formData.append(
        'Date_de_Permis',
        this.Informations_Banques_Form.get('Date_permis').value
      );
    formData.append(
      'Categorie_Permis',
      this.Informations_Banques_Form.get('Categorie_permis').value
    );
    formData.append('Login', this.Acces.get('login').value);
    formData.append('Pwd', this.Acces.get('pwd').value);
    this.service.ajouterEmployes(formData).subscribe(
      (reponse) => {
        Swal.fire({
          icon: 'success',
          title: 'Employé ajouté avec succès',
          showConfirmButton: false,
          timer: 1500,
        });
        return reponse;
      },
      (err) => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'erreur d' + "'" + 'ajout',
          showConfirmButton: false,
          timer: 1500,
        });
        throw err;
      }
    );
  }
  //fonction activée lors de choix d'une image pour la convertir en base 64
  choixImage() {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imageSrc = reader.result;
      this.imageSrc = btoa(this.imageSrc);
      this.imageSrc = atob(this.imageSrc);
      this.imageSrc = this.imageSrc.replace(/^data:image\/[a-z]+;base64,/, '');
    };
    reader.readAsDataURL(this.Informations_Banques_Form.get('Image').value);
  }

  changeracces() {
    let codeacces =
      '1' +
      this.Acces.get('vente').value +
      '' +
      this.Acces.get('achat').value +
      '' +
      this.Acces.get('tms').value +
      '' +
      this.Acces.get('wms').value +
      '' +
      this.Acces.get('config').value +
      '' +
      this.Acces.get('rh').value +
      '';
    this.Acces.get('Acces').value = codeacces;
  }

  // generer PDF
  genererPdf() {
    var d = this.Informations_Banques_Form.get('Date_permis').value;

    this.date = '';
    if (this.Informations_Banques_Form.get('Image').value === null) {
      this.date = this.datepipe.transform(d, 'dd/MM/yyyy');
    }
    // tester si l'image n'est pas inserée pour mettre une image par défaut
    if (this.Informations_Banques_Form.get('Image').value === '') {
      this.sansChoixImage();
    }

    let dd = {
      footer: function (currentPage: any, pageCount: any) {
        return {
          margin: 35,
          columns: [
            {
              fontSize: 9,
              text: [
                {
                  text: currentPage.toString() + '/' + pageCount,
                },
              ],
              alignment: 'center',
            },
          ],
        };
      },

      pageMargins: [30, 125, 40, 60],
      background: [
        {
          image: 'data:image/jpeg;base64,' + this.modeleSrc,
          width: 600,
        },
      ],
      content: [
        {
          columns: [
            {
              image: 'data:image/jpeg;base64,' + this.imageSrc,
              width: 150,
              height: 170,
            },
            {
              width: '80%',
              text:
                '\n\n' +
                'Nom du Employé : ' +
                this.Informations_Generales_Form.get('Nom_Employe').value +
                '\n\n' +
                'Rôle : ' +
                this.Informations_Generales_Form.get('Role').value +
                '\n\n' +
                'Accès : ' +
                this.Acces.get('Acces').value +
                '\n\n' +
                'Email : ' +
                this.Informations_Banques_Form.get('Email').value +
                '\n\n' +
                'Téléphones : ' +
                '\t' +
                this.Informations_Banques_Form.get('Tel1').value,
            },
          ],
          columnGap: 40,
        },

        {
          columns: [
            {
              width: '50%',
              text:
                '\n\n\n' +
                'Pays : ' +
                this.Informations_Banques_Form.get('Pays').value,
            },

            {
              width: '50%',
              text:
                '\n\n\n' +
                'Ville : ' +
                this.Informations_Banques_Form.get('Ville').value,
            },
          ],
        },

        {
          columns: [
            {
              width: '50%',
              text:
                '\n\n' +
                'Type de la pièce d' +
                "'" +
                ' identité : ' +
                this.Informations_Generales_Form.get('Type_Piece_Identite')
                  .value,
            },

            {
              width: '50%',
              text:
                '\n\n' +
                'Numéro de la pièce d' +
                "'" +
                ' identité : ' +
                this.Informations_Generales_Form.get('N_Piece_Identite').value,
            },
          ],
        },

        {
          columns: [
            {
              width: '50%',
              text:
                '\n\n' +
                'Banque 1 : ' +
                this.Informations_Banques_Form.get('Banque1').value,
            },

            {
              width: '50%',
              text:
                '\n\n' +
                'Rib 1 : ' +
                this.Informations_Banques_Form.get('Rib1').value,
            },
          ],
        },

        {
          columns: [
            {
              width: '40%',
              text:
                '\n\n' +
                'Code Cnss : ' +
                this.Informations_Banques_Form.get('Cnss').value,
            },

            {
              width: '40%',
              text:
                '\n\n' +
                'Situation Familiale : ' +
                this.Informations_Banques_Form.get('St_familliale').value,
            },

            {
              width: '20%',
              text:
                '\n\n' +
                'Enfant a Charge : ' +
                this.Informations_Banques_Form.get('Enfant_a_charge').value,
            },
          ],
        },

        /////666666
        {
          columns: [
            {
              width: '40%',
              text: '\n\n' + 'Date de permis : ' + this.date,
            },

            {
              width: '40%',
              text:
                '\n\n' +
                'Numéro de permis : ' +
                this.Informations_Banques_Form.get('N_permis').value,
            },

            {
              width: '20%',
              text:
                '\n\n' +
                'Categorie de permis : ' +
                this.Informations_Banques_Form.get('Categorie_permis').value,
            },
          ],
        },

        {
          text:
            '\n\n' +
            'Description : ' +
            '\t' +
            this.Informations_Generales_Form.get('Description').value,
        },
      ],
    };

    pdfMake.createPdf(dd).open();
  }
  // message d'erreur lorsque le nom saisi ne respecte pas les conditions prédifinis
  MessageErreurNom() {
    if (
      this.Informations_Generales_Form.get('Nom_Employe').hasError('required')
    ) {
      return 'Vous devez entrer le nom du Employe!';
    }

    if (
      this.Informations_Generales_Form.get('Nom_Employe').hasError('minlength')
    ) {
      return 'Nom du Client non valide! (Min 3 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('Nom_Employe').hasError('maxlength')
    ) {
      return 'Nom du Client non valide! (Max 30 caractères)';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque le representant saisi ne respecte pas les conditions prédifinis
  MessageErreurRepresentant() {
    if (
      this.Informations_Generales_Form.get('Representant').hasError('required')
    ) {
      return 'Vous devez entrer le representant du Client!';
    }

    if (
      this.Informations_Generales_Form.get('Representant').hasError('minlength')
    ) {
      return 'Representant non valide! (Min 3 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('Representant').hasError('maxlength')
    ) {
      return 'Representant non valide! (Max 30 caractères)';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Categorie Client saisi ne respecte pas les conditions prédifinis
  MessageErreurrole() {
    if (this.Informations_Generales_Form.get('Role').hasError('required')) {
      return 'Vous devez entrer choisir le role !';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Categorie Fiscale saisi ne respecte pas les conditions prédifinis
  MessageErreurAcces() {
    if (this.Informations_Generales_Form.get('Acces').hasError('required')) {
      return 'Vous devez Effecter un Accès!';
    } else {
      return '';
    }
  }

  // message d'erreur lorsque CategorieP iece saisi ne respecte pas les conditions prédifinis
  MessageErreurCategoriePiece() {
    if (
      this.Informations_Generales_Form.get('Type_Piece_Identite').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer le type de la piece Identité!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque le numero de piece d'identité saisi ne respecte pas les conditions prédifinis
  MessageErreurNPieceIdentite() {
    if (
      this.Informations_Generales_Form.get('N_Piece_Identite').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer le numéro de pièce identité!';
    }
    if (
      this.Informations_Generales_Form.get('N_Piece_Identite').hasError(
        'minlength'
      )
    ) {
      return 'Numéro de pièce identité non valide! (Min 8 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('N_Piece_Identite').hasError(
        'maxlength'
      )
    ) {
      return 'Numéro de pièce identité non valide! (Max 15 caractères)';
    } else {
      return '';
    }
  }

  // message d'erreur lorsque banque saisi ne respecte pas les conditions prédifinis
  MessageErreurBanque() {
    if (this.Informations_Banques_Form.get('Banque1').hasError('required')) {
      return 'Vous devez choisir une Banque!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Rib1 saisi ne respecte pas les conditions prédifinis
  MessageErreurRib() {
    if (this.Informations_Banques_Form.get('Rib1').hasError('required')) {
      return 'Vous devez entrer Rib';
    }
    if (this.Informations_Banques_Form.get('Rib1').hasError('minlength')) {
      return 'Rib non valide! (20 numéro)';
    }
    if (this.Informations_Banques_Form.get('Rib1').hasError('maxlength')) {
      return 'Rib non valide! (20 numéro)';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Contact saisi ne respecte pas les conditions prédifinis
  MessageErreurContact() {
    if (this.Informations_Banques_Form.get('Contact').hasError('required')) {
      return 'Vous devez saisir un contact';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque l'adresse saisi ne respecte pas les conditions prédifinis
  MessageErreurAdresse() {
    if (this.Informations_Banques_Form.get('Adresse').hasError('required')) {
      return 'Vous devez entrer Adresse';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque pays saisi ne respecte pas les conditions prédifinis
  MessageErreurPays() {
    if (this.Informations_Banques_Form.get('Pays').hasError('required')) {
      return 'Vous devez choisir un  Pays!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque l'email' saisi ne respecte pas les conditions prédifinis
  MessageErreurEmail() {
    if (this.Informations_Banques_Form.get('Email').hasError('required')) {
      return 'Vous devez saisir un  email!';
    }
    if (this.Informations_Banques_Form.get('Email').hasError('email')) {
      return 'saisir un email valide!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque tel saisi ne respecte pas les conditions prédifinis
  MessageErreurTel() {
    if (this.Informations_Banques_Form.get('Tel1').hasError('required')) {
      return 'Vous devez saisir un  numéro du téléphone!';
    } else {
      return '';
    }
  }
  ngOnInit(): void {}
  // temps d'attente pour le traitement de fonction
  delai(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // conversion de modele de pdf  en base 64
  async modelePdfBase64() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.modeleSrc = lecteur.result;
      this.modeleSrc = btoa(this.modeleSrc);
      this.modeleSrc = atob(this.modeleSrc);
      this.modeleSrc = this.modeleSrc.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
    };
    lecteur.readAsDataURL(this.modele);
  }
  // récupération de modele pour créer le pdf
  async chargementModel() {
    this.http
      .get('.././assets/images/employee.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.modele = reponse;
          return this.modele;
        },
        (err) => console.error(err),
        () => console.log(this.modele)
      );
  }
  // récupération d'image par défaut de l'assets
  async ChargementImage() {
    this.http
      .get('.././assets/images/image_par_defaut.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.image_par_defaut_blob = reponse;
          return this.image_par_defaut_blob;
        },
        (err) => console.error(err),
        () => console.log(this.image_par_defaut_blob)
      );
  }
  // conversion d'image par défaut en base 64
  async sansChoixImage() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.imageSrc = lecteur.result;
      this.imageSrc = btoa(this.imageSrc);
      this.imageSrc = atob(this.imageSrc);
      this.imageSrc = this.imageSrc.replace(/^data:image\/[a-z]+;base64,/, '');
    };
    lecteur.readAsDataURL(this.image_par_defaut_blob);
  }
}

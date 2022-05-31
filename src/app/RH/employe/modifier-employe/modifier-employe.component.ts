import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EmployeServiceService } from '../Service/employe-service.service';

@Component({
  selector: 'app-modifier-employe',
  templateUrl: './modifier-employe.component.html',
  styleUrls: ['./modifier-employe.component.scss'],
})
export class ModifierEmployeComponent implements OnInit {
  //passage d'une étape à une autre uniquement si l'étape est validée
  id_emp: any;
  Data: any;
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
  Recapitulation_Form: FormGroup;
  modeleClientSrc: any;
  modele_Client: any;
  image_Client_par_defaut_blob: any;
  imageClientSrc: any;
  Date_embauche: any;
  Date_naissance: any;
  Date_Livraison_Identite: any;
  Date_permis: any;
  locals: any;
  liste_acces: any = [
    { acces: 10 },
    { acces: 20 },
    { acces: 30 },
    { acces: 40 },
    { acces: 50 },
    { acces: 60 },
    { acces: 70 },
    { acces: 80 },
    { acces: 90 },
  ];
  Fichier_image: any;
  Fichier_image_Client: any;
  achat: any;
  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public serviceClient: EmployeServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
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
    this.id_emp = this.route.snapshot.params.id;

    this.serviceClient.Employe(this.id_emp).subscribe((resp: any) => {
      this.Data = resp;
      this.Date_embauche = new Date(this.Data.date_de_embauche);
      this.Date_naissance = new Date(this.Data.date_de_naissance);
      this.Date_Livraison_Identite = new Date(this.Data.date_Piece_Identite);
      this.Date_permis = new Date(this.Data.date_de_Permis);
      this.serviceClient
        .ListerVille(this.Data.pays)
        .subscribe((reponse: Response) => {
          this.categorie_ville = reponse;
        });

      const numToSeparate = this.Data.acces;
      const arrayOfDigits = Array.from(String(numToSeparate), Number);
      this.Acces.get('vente').value = arrayOfDigits[1] + '';
      this.Acces.get('achat').value = arrayOfDigits[2] + '';
      this.Acces.get('tms').value = arrayOfDigits[3] + '';
      this.Acces.get('wms').value = arrayOfDigits[4] + '';
      this.Acces.get('config').value = arrayOfDigits[5] + '';
      this.Acces.get('rh').value = arrayOfDigits[6] + '';
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

      // sel les valeurs initiales
      this.Informations_Generales_Form.get('Nom_Employe').setValue(this.Data.nom)
      this.Informations_Generales_Form.get('Role').setValue(this.Data.role)
      this.Informations_Generales_Form.get('Date_naissance').setValue(this.Date_naissance)
      this.Informations_Generales_Form.get('Type_Piece_Identite').setValue(this.Data.type_Piece_Identite)
      this.Informations_Generales_Form.get('N_Piece_Identite').setValue(this.Data.n_Piece_Identite)
      this.Informations_Generales_Form.get('Date_Livraison_Identite').setValue(this.Date_Livraison_Identite)
      this.Informations_Generales_Form.get('Description').setValue(this.Data.description)
      this.Informations_Generales_Form.get('Date_embauche').setValue(this.Date_embauche)

      this.Informations_Banques_Form.get('Image').setValue(this.Data.image)
      this.Informations_Banques_Form.get('Email').setValue(this.Data.email)
      this.Informations_Banques_Form.get('Banque1').setValue(this.Data.banque)
      this.Informations_Banques_Form.get('Rib1').setValue(this.Data.rib)
      this.Informations_Banques_Form.get('Adresse').setValue(this.Data.adresse)
      this.Informations_Banques_Form.get('Pays').setValue(this.Data.pays)
      this.Informations_Banques_Form.get('Ville').setValue(this.Data.ville)
      this.Informations_Banques_Form.get('Tel1').setValue(this.Data.tel)
      this.Informations_Banques_Form.get('Cnss').setValue(this.Data.cnss)
      this.Informations_Banques_Form.get('St_familliale').setValue(this.Data.situation_Familiale)
      this.Informations_Banques_Form.get('Enfant_a_charge').setValue(this.Data.enfant_A_Charge)
      this.Informations_Banques_Form.get('N_permis').setValue(this.Data.permis)
      this.Informations_Banques_Form.get('Date_permis').setValue(this.Date_permis)
      this.Informations_Banques_Form.get('Categorie_permis').setValue(this.Data.categorie_Permis)
      

      this.Acces.get('login').setValue(this.Data.login)
      this.Acces.get('pwd').setValue(this.Data.password)
    });

    this.Image_Client(this.id_emp);
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
      Date_Livraison_Identite: ['', Validators.required],
      Description: [''],
      Date_embauche: ['', Validators.required],
    });
    this.Acces = this.fb.group({
      Acces: ['1000000'],
      login: ['', Validators.required],
      pwd: ['', Validators.required],
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
      Banque1: ['', Validators.required],
      Rib1: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(20),
        ],
      ],
      Adresse: ['', [Validators.required]],
      Pays: ['', Validators.required],
      Ville: ['', Validators.required],
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


    // formulaire affichant la récapitulation des tous les champs
    this.Recapitulation_Form = this.fb.group({});

    // récupérer la liste des categories employé
    this.serviceClient
      .ListerCategorieEmploye()
      .subscribe((reponse: Response) => {
        this.roles = reponse;
      });

    // récupérer la liste des categories pièce d'identité
    this.serviceClient.ListerCategoriePiece().subscribe((reponse: Response) => {
      this.categorie_piece = reponse;
    });

    // récupérer la liste des categories banques
    this.serviceClient.ListerBanques().subscribe((reponse: Response) => {
      this.categorie_banque = reponse;
    });
    // récupérer la liste des pays
    this.serviceClient.ListerPays().subscribe((reponse: Response) => {
      this.categorie_pays = reponse;
    });
  }

  Image_Client(id_emp: any) {
    this.serviceClient.Image_Employe(id_emp).subscribe((baseImage: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.Fichier_image = reader.result;
        this.Fichier_image_Client = this.Fichier_image;
        this.Fichier_image = new File([baseImage], 'image_Client', {
          type: 'image/png',
        });
      };
      reader.readAsDataURL(baseImage);
    });
  }
  // reactiver saisi rib1

  ChoixBanque1(event: MatSelectChange) {
    this.Informations_Banques_Form.controls.Rib1.enable();
  }

  // fonction activée lors de choix du pays pour récupérer la liste des villes dans ce dernier
  ChoixPays(event: MatSelectChange) {
    this.pays = event.value;
    this.serviceClient.ListerVille(this.pays).subscribe((reponse: Response) => {
      this.categorie_ville = reponse;
      this.Informations_Banques_Form.get('Ville').setValue('')
    });
  }
  // fonction activée lors de choix de la ville pour récupérer la liste des régions dans cette dernière
  ChoixVille(event: MatSelectChange) {
    this.ville = event.value;
    this.serviceClient
      .ListerRegion(this.ville)
      .subscribe((reponse: Response) => {
        this.categorie_region = reponse;
      });
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

  //  création d' Employé
  ModifierEmploye() {
    const nom_image_par_defaut = 'image_par_defaut.png';
    const Fichier_image_par_defaut = new File(
      [this.image_Client_par_defaut_blob],
      nom_image_par_defaut,
      { type: 'image/png' }
    );
    var formData: any = new FormData();
    formData.append('Id', this.id_emp);
    formData.append(
      'Nom',
      this.Informations_Generales_Form.get('Nom_Employe').value
    );
    formData.append('Role', this.Informations_Generales_Form.get('Role').value);
    formData.append('Acces', this.Acces.get('Acces').value);
    formData.append(
      'Local',
      this.Informations_Generales_Form.get('local').value
    );

    formData.append(
      'Date_Piece_Identite',
      this.Informations_Generales_Form.get('Date_Livraison_Identite').value
    );
    formData.append(
      'Type_Piece_Identite',
      this.Informations_Generales_Form.get('Type_Piece_Identite').value
    );
    formData.append(
      'N_Piece_Identite',
      this.Informations_Generales_Form.get('N_Piece_Identite').value
    );
    formData.append(
      'Description',
      this.Informations_Generales_Form.get('Description').value
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
    formData.append('Image', this.Informations_Banques_Form.get('Image').value);
    formData.append('Image', this.Fichier_image);
    formData.append('Cnss', this.Informations_Banques_Form.get('Cnss').value);
    formData.append(
      'Situation_Familiale',
      this.Informations_Banques_Form.get('St_familliale').value
    );
    console.log(
      '-' + this.Informations_Banques_Form.get('Enfant_a_charge').value + '-'
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
    formData.append('login', this.Acces.get('login').value);
    formData.append('password', this.Acces.get('pwd').value);
    //demande de confirmation de la modification
    Swal.fire({
      title: 'Êtes-vous sûr?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifiez-le',
      cancelButtonText: 'Non',
    }).then((result) => {
      if (result.value) {
        this.serviceClient.ModifierEmployes(formData).subscribe(
          (data) => {
            //lorsque la modification est realisé, redirection à la page lister-Client

            this.router.navigate(['Menu/Menu-RH/Menu-employee/Lister-employee']);
            Swal.fire('Employé modifié avec succès!', '', 'success');
            return data;
          },
          (err) => {
            Swal.fire({
              icon: 'error',
              title: 'erreur de modification !',
              showConfirmButton: false,
              timer: 1500,
            });
            throw err;
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Annulé', '', 'error');
        this.router.navigate(['Menu/Menu-RH/Menu-employee/Lister-employee']);
      }
    });
  }

  // boite dialogue
  afficherImage(id2: any): void {
    const dialogueImage = this.dialog.open(VisualiserImageEmploye, {
      data: { Id: id2 },
    });
    dialogueImage.afterClosed().subscribe((result) => {});
  }

  //fonction activée lors de choix d'une image
  choixImage() {
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.Fichier_image = lecteur.result;
      this.Fichier_image = btoa(this.Fichier_image);
      this.Fichier_image = atob(this.Fichier_image);
      this.Fichier_image = this.Fichier_image.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
      this.Fichier_image = new File([this.Data.image], 'image_Client', {
        type: 'image/png',
      });
    };
    lecteur.readAsDataURL(this.Informations_Banques_Form.get('Image').value);
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
      return 'Nom du Employé non valide! (Min 3 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('Nom_Employe').hasError('maxlength')
    ) {
      return 'Nom du Employé non valide! (Max 30 caractères)';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque le representant saisi ne respecte pas les conditions prédifinis
  MessageErreurRepresentant() {
    if (
      this.Informations_Generales_Form.get('Representant').hasError('required')
    ) {
      return 'Vous devez entrer le representant du Employé!';
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
      return 'Vous devez  confirmer le role svp  !';
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
  async modelePdfClientBase64() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.modeleClientSrc = lecteur.result;
      this.modeleClientSrc = btoa(this.modeleClientSrc);
      this.modeleClientSrc = atob(this.modeleClientSrc);
      this.modeleClientSrc = this.modeleClientSrc.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
    };
    lecteur.readAsDataURL(this.modele_Client);
  }
  // récupération de modele pour créer le pdf
  async chargementModelClient() {
    this.http
      .get('.././assets/images/Fiche_Employe.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.modele_Client = reponse;
          return this.modele_Client;
        },
        (err) => console.error(err),
        () => console.log(this.modele_Client)
      );
  }
  // récupération d'image par défaut de l'assets
  async ChargementImage() {
    this.http
      .get('.././assets/images/image_par_defaut.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.image_Client_par_defaut_blob = reponse;
          return this.image_Client_par_defaut_blob;
        },
        (err) => console.error(err),
        () => console.log(this.image_Client_par_defaut_blob)
      );
  }
  // conversion d'image par défaut en base 64
  async sansChoixImage() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.imageClientSrc = lecteur.result;
      this.imageClientSrc = btoa(this.imageClientSrc);
      this.imageClientSrc = atob(this.imageClientSrc);
      this.imageClientSrc = this.imageClientSrc.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
    };
    lecteur.readAsDataURL(this.image_Client_par_defaut_blob);
  }
}

@Component({
  selector: 'visualiser-image-employe',
  templateUrl: 'visualiser-image-employe.html',
})
export class VisualiserImageEmploye {
  photo: any;

  constructor(
    private serviceClient: EmployeServiceService,
    public dialogueImage: MatDialogRef<VisualiserImageEmploye>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.serviceClient.Image_Employe(data.Id).subscribe((baseImage: any) => {
      const lecteur = new FileReader();
      lecteur.onloadend = () => {
        this.photo = lecteur.result;
      };
      lecteur.readAsDataURL(baseImage);
    });
  }
  Fermer(): void {
    this.dialogueImage.close();
  }
}

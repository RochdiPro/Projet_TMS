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
import { ClientServiceService } from '../Service/client-service.service';

@Component({
  selector: 'app-modifier-client',
  templateUrl: './modifier-client.component.html',
  styleUrls: ['./modifier-client.component.scss'],
})
export class ModifierClientComponent implements OnInit {
  Identifiant_Client: any;
  ClientData: any;
  pays: string;
  ville: string;
  region: string;
  categorie_region: any;
  categorie_ville: any;
  categorie_pays: any;
  categorie_banque: any;
  categorie_Client: any;
  categorie_piece: any;
  categorie_fiscale: any;
  choix_Categorie_Fiscale: any;
  Informations_Generales_Form: FormGroup;
  Informations_Banques_Form: FormGroup;
  ContactForm: FormGroup;
  Recapitulation_Form: FormGroup;
  Fichier_image: any;
  Fichier_image_Client: any;
  date_livraison_Cin: any;
  debut_exoneration_tva: any;
  fin_exoneration_tva: any;
  constructor(
    public dialog: MatDialog,
    public serviceClient: ClientServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.Identifiant_Client = this.route.snapshot.params.id;
    //Client recuperé de la base
    this.Client();

    //image recuperée de la base
    this.Image_Client();

    // premiere formulaire contenant les informations generales du Client avec les controles sur les champs
    this.Informations_Generales_Form = this.fb.group({
      Nom_Client: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      Categorie_Client: [''],
      Categorie_Fiscale: [''],
      Identification_Fiscale: [
        '',
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(15),
        ],
      ],
      Representant: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      Type_Piece_Identite: [''],
      N_Piece_Identite: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
        ],
      ],
      Date_Livraison_Identite: [''],
      Description: [''],
      N_Attestation_Exoneration: [''],
      Etablie_Le: [''],
      Valable_Au: [''],
      Taux_Reduction_Tva: [],
    });
    // deuxieme formulaire contenant les informations financieres du Client avec les controles sur les champs

    this.Informations_Banques_Form = this.fb.group({
      Banque1: [''],
      Rib1: ['', [Validators.required ,Validators.minLength(20), Validators.maxLength(20)]],
      Banque2: [''],
      Rib2: ['', [Validators.minLength(20), Validators.maxLength(20)]],
      Solde_Facture: [],
      Risque: [],
      Plafond: [],
      Bloque_Vente: [],
      Timbre_Fiscal: [],
    });
    // troisieme formulaire contenant les contacts du Client avec les controles sur les champs

    this.ContactForm = this.fb.group({
      Pays: ['', Validators.required],
      Region: ['', Validators.required],
      Ville: ['', Validators.required],
      Email: ['', [Validators.email, Validators.required]],
      Tel1: ['', Validators.required],
      Tel2: [''],
      Fax: [''],
      Site_Web: [''],
      Contact: ['', Validators.required],
      Adresse: ['', Validators.required],
      Image: [''],
    });
    // formulaire affichant la recapitulation des tous les champs saisies et contenant le bouton de sauvegarde
    this.Recapitulation_Form = this.fb.group({});

    // liste des categories client
    this.Categorie_Client();

    // liste Categorie piece d'identité
    this.Categorie_Piece_Identite();

    // liste Categorie fiscale
    this.Categorie_fiscale();

    // liste banques
    this.Categorie_Banques();

    // liste pays
    this.Categorie_pays();
  }

  // boite dialogue
  afficherImage(id: any): void {
    const dialogueImage = this.dialog.open(VisualiserImageClient, {
      data: { id_Clt: id },
    });
    dialogueImage.afterClosed().subscribe((result) => {});
  }
  // récupérer la liste des pays
  Categorie_pays() {
    this.serviceClient.ListerPays().subscribe((reponse: Response) => {
      this.categorie_pays = reponse;
    });
  }

  // récupérer la liste des categories banques
  Categorie_Banques() {
    this.serviceClient.ListerBanques().subscribe((reponse: Response) => {
      let banques: any = reponse;
      this.categorie_banque = banques.sort(function (a: any, b: any) {
        return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
      });
    });
  }

  // récupérer la liste des categories fiscale
  Categorie_fiscale() {
    this.serviceClient
      .ListerCategorieFiscale()
      .subscribe((reponse: Response) => {
        this.categorie_fiscale = reponse;
      });
  }

  // récupérer la liste des categories pièce d'identité
  Categorie_Piece_Identite() {
    this.serviceClient.ListerCategoriePiece().subscribe((reponse: Response) => {
      this.categorie_piece = reponse;
    });
  }

  // récupérer la liste des categories Clients
  Categorie_Client() {
    this.serviceClient
      .ListerCategorieClient()
      .subscribe((reponse: Response) => {
        this.categorie_Client = reponse;
      });
  }

  //récupérer image de la base
  Image_Client() {
    this.serviceClient
      .Image_Client(this.Identifiant_Client)
      .subscribe((baseImage: any) => {
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

  // récupérer les données du Client par son identifiant
  Client() {
    this.serviceClient
      .Client(this.Identifiant_Client)
      .subscribe((reponse: Response) => {
        this.ClientData = reponse;
        // tester les dates pour afficher uniquement les dates valides
        if (this.ClientData.date_Livraison_Identite > '1900-01-30') {
          this.date_livraison_Cin = new Date(
            this.ClientData.date_Livraison_Identite
          );
        }
        if (this.ClientData.debut_Exoneration > '1900-01-30') {
          this.debut_exoneration_tva = new Date(
            this.ClientData.debut_Exoneration
          );
        }
        if (this.ClientData.fin_Exoneration > '1900-01-30') {
          this.fin_exoneration_tva = new Date(this.ClientData.fin_Exoneration);
        }
        // afficher ville selon pays
        this.serviceClient
          .ListerVille(this.ClientData.pays)
          .subscribe((reponse: Response) => {
            let villes: any = reponse;
            this.categorie_ville = villes.sort(function (a: any, b: any) {
              return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
            });
          });
        // afficher région selon ville
        // afficher région selon ville
        this.serviceClient
          .ListerRegion(this.ClientData.ville)
          .subscribe((reponse: Response) => {
            this.categorie_region = reponse;
            this.categorie_region = this.categorie_region.sort(function (
              a: any,
              b: any
            ) {
              return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
            });
          });
      });
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
      this.Fichier_image = new File([this.ClientData.image], 'image_Client', {
        type: 'image/png',
      });
    };
    lecteur.readAsDataURL(this.ContactForm.get('Image').value);
  }

  // fonction activée lors de choix du categorie fiscale
  CategorieFiscaleSelectionner(event: MatSelectChange) {
    this.choix_Categorie_Fiscale = event.value;
  }

  // fonction activée lors de choix du pays
  ChoixPays(event: MatSelectChange) {
    this.pays = event.value;
    // récupérer la liste des ville du pays choisi
    this.serviceClient.ListerVille(this.pays).subscribe((reponse: Response) => {
      let villes: any = reponse;
      this.categorie_ville = villes.sort(function (a: any, b: any) {
        return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
      });
      this.ContactForm.get("Ville").setValue("")
    });
  }

  // fonction activée lors de choix du ville
  ChoixVille(event: MatSelectChange) {
    this.ville = event.value;
    // récupérer la liste des regions du ville choisie

    this.serviceClient
      .ListerRegion(this.ville)
      .subscribe((reponse: Response) => {
        this.categorie_region = reponse;
      });
  }

  // message d'erreur lorsque le nom saisi ne respecte pas les conditions prédifinis
  MessageErreurNom() {
    if (
      this.Informations_Generales_Form.get('Nom_Client').hasError('required')
    ) {
      return 'Vous devez entrer le nom du Client!';
    }

    if (
      this.Informations_Generales_Form.get('Nom_Client').hasError('minlength')
    ) {
      return 'Nom du Client non valide! (Min 3 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('Nom_Client').hasError('maxlength')
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
  MessageErreurCategorieClient() {
    if (
      this.Informations_Generales_Form.get('Categorie_Client').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer la  Categorie du Client!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Categorie Fiscale saisi ne respecte pas les conditions prédifinis
  MessageErreurCategorieFiscale() {
    if (
      this.Informations_Generales_Form.get('Categorie_Fiscale').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer la  Categorie Fiscale!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque l'identifiant fiscal saisi ne respecte pas les conditions prédifinis
  MessageErreurIdentificationFiscale() {
    if (
      this.Informations_Generales_Form.get('Identification_Fiscale').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer Identification Fiscale!';
    }
    if (
      this.Informations_Generales_Form.get('Identification_Fiscale').hasError(
        'minlength'
      )
    ) {
      return 'Identification Fiscale non valide! (Min 13 caractères)';
    }
    if (
      this.Informations_Generales_Form.get('Identification_Fiscale').hasError(
        'maxlength'
      )
    ) {
      return 'Identification Fiscale non valide! (Max 15 caractères)';
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
  // message d'erreur de numéro d'exoneration
  MessageErreurNAttestationExoneration() {
    if (
      this.Informations_Generales_Form.get(
        'N_Attestation_Exoneration'
      ).hasError('required')
    ) {
      return 'Vous devez entrer numero attestaion!';
    } else {
      return '';
    }
  }
  // message d'erreur de date debut d'exoneration
  MessageErreurEtablieLe() {
    if (
      this.Informations_Generales_Form.get('Etablie_Le').hasError('required')
    ) {
      return 'Vous devez entrer date exoneration tva!';
    } else {
      return '';
    }
  }
  // message d'erreur de date fin d'exoneration
  MessageErreurValableAu() {
    if (
      this.Informations_Generales_Form.get('Valable_Au').hasError('required')
    ) {
      return 'Vous devez entrer date exoneration tva!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque Taux Reduction Tva saisi ne respecte pas les conditions prédifinis
  MessageErreurTauxReductionTva() {
    if (
      this.Informations_Generales_Form.get('Taux_Reduction_Tva').hasError(
        'required'
      )
    ) {
      return 'Vous devez entrer Taux du Reduction tva!';
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
    if (this.ContactForm.get('Contact').hasError('required')) {
      return 'Vous devez saisir un contact';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque l'adresse saisi ne respecte pas les conditions prédifinis
  MessageErreurAdresse() {
    if (this.ContactForm.get('Adresse').hasError('required')) {
      return 'Vous devez entrer Adresse';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque pays saisi ne respecte pas les conditions prédifinis
  MessageErreurPays() {
    if (this.ContactForm.get('Pays').hasError('required')) {
      return 'Vous devez choisir un  Pays!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque l'email' saisi ne respecte pas les conditions prédifinis
  MessageErreurEmail() {
    if (this.ContactForm.get('Email').hasError('required')) {
      return 'Vous devez saisir un  email!';
    }
    if (this.ContactForm.get('Email').hasError('email')) {
      return 'saisir un email valide!';
    } else {
      return '';
    }
  }
  // message d'erreur lorsque tel saisi ne respecte pas les conditions prédifinis
  MessageErreurTel() {
    if (this.ContactForm.get('Tel1').hasError('required')) {
      return 'Vous devez saisir un  numéro du téléphone!';
    } else {
      return '';
    }
  }

  // fonction activer en cliquant sur le button valider pour modifier un Client
  ModifierClient() {
    var formData: any = new FormData();
    formData.append('Id_Clt', this.Identifiant_Client);
    formData.append(
      'Nom_Client',
      this.Informations_Generales_Form.get('Nom_Client').value
    );
    formData.append(
      'Categorie_Client',
      this.Informations_Generales_Form.get('Categorie_Client').value
    );
    formData.append(
      'Categorie_Fiscale',
      this.Informations_Generales_Form.get('Categorie_Fiscale').value
    );
    formData.append(
      'Code_Tva',
      this.Informations_Generales_Form.get('Identification_Fiscale').value
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
      this.Informations_Generales_Form.get('Date_Livraison_Identite').value ==
      null
    ) {
      formData.append('Date_Livraison_Identite', '01/01/1900');
    } else
      formData.append(
        'Date_Livraison_Identite',
        this.Informations_Generales_Form.get('Date_Livraison_Identite').value
      );
    formData.append(
      'Representant',
      this.Informations_Generales_Form.get('Representant').value
    );
    formData.append(
      'Description',
      this.Informations_Generales_Form.get('Description').value
    );
    if (
      this.Informations_Generales_Form.get('N_Attestation_Exoneration').value
        .length == 0
    ) {
      formData.append(
        'N_Attestation_Exoneration',
        this.ClientData.n_Attestation_Exoneration
      );
    } else
      formData.append(
        'N_Attestation_Exoneration',
        this.Informations_Generales_Form.get('N_Attestation_Exoneration').value
      );
    if (this.Informations_Generales_Form.get('Etablie_Le').value.length == 0) {
      formData.append('Debut_Exoneration', '01/01/1900');
    } else
      formData.append(
        'Debut_Exoneration',
        this.Informations_Generales_Form.get('Etablie_Le').value
      );
    if (this.Informations_Generales_Form.get('Valable_Au').value.length == 0) {
      formData.append('Fin_Exoneration', '01/01/1900');
    } else
      formData.append(
        'Fin_Exoneration',
        this.Informations_Generales_Form.get('Valable_Au').value
      );
    if (
      this.Informations_Generales_Form.get('Taux_Reduction_Tva').value == null
    ) {
      formData.append('Reduction_Tva', this.ClientData.reduction_Tva);
    } else
      formData.append(
        'Reduction_Tva',
        this.Informations_Generales_Form.get('Taux_Reduction_Tva').value
      );
    formData.append(
      'Banque1',
      this.Informations_Banques_Form.get('Banque1').value
    );
    formData.append('Rib1', this.Informations_Banques_Form.get('Rib1').value);
    formData.append(
      'Banque2',
      this.Informations_Banques_Form.get('Banque2').value
    );
    formData.append('Rib2', this.Informations_Banques_Form.get('Rib2').value);
    formData.append(
      'Timbre_Fiscal',
      this.Informations_Banques_Form.get('Timbre_Fiscal').value
    );
    formData.append(
      'Bloque_Vente',
      this.Informations_Banques_Form.get('Bloque_Vente').value
    );
    formData.append(
      'Solde_Facture',
      this.Informations_Banques_Form.get('Solde_Facture').value
    );
    formData.append(
      'Risque',
      this.Informations_Banques_Form.get('Risque').value
    );
    formData.append(
      'Plafond',
      this.Informations_Banques_Form.get('Plafond').value
    );
    formData.append('Contact', this.ContactForm.get('Contact').value);
    formData.append('Adresse', this.ContactForm.get('Adresse').value);
    formData.append('Region', this.ContactForm.get('Region').value);
    formData.append('Ville', this.ContactForm.get('Ville').value);
    formData.append('Pays', this.ContactForm.get('Pays').value);
    formData.append('Email', this.ContactForm.get('Email').value);
    formData.append('Site_Web', this.ContactForm.get('Site_Web').value);
    formData.append('Tel1', this.ContactForm.get('Tel1').value);
    formData.append('Tel2', this.ContactForm.get('Tel2').value);
    formData.append('Fax', this.ContactForm.get('Fax').value);
    formData.append('Image', this.Fichier_image);

    //demande de confirmation de la modification
    Swal.fire({
      title: 'Êtes-vous sûr?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifiez-le',
      cancelButtonText: 'Non',
    }).then((result) => {
      if (result.value) {
        this.serviceClient.ModifierClient(formData).subscribe(
          (data) => {
            //lorsque la modification est realisé, redirection à la page lister-Client

            this.router.navigate(['/Menu/Menu-client/Lister-client']);
            Swal.fire('Client modifié avec succès!', '', 'success');
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
        this.router.navigate(['Menu/Menu-client/Lister-client']);
      }
    });
  }

  ngOnInit(): void {}
}

@Component({
  selector: 'visualiser-image-client',
  templateUrl: 'visualiser-image-client.html',
})
export class VisualiserImageClient {
  photo: any;

  constructor(
    private serviceClient: ClientServiceService,
    public dialogueImage: MatDialogRef<VisualiserImageClient>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.serviceClient.Image_Client(data.id_Clt).subscribe((baseImage: any) => {
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

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ClientServiceService } from '../Service/client-service.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-ajout-client',
  templateUrl: './ajout-client.component.html',
  styleUrls: ['./ajout-client.component.scss']
})
export class AjoutClientComponent implements OnInit {

  //passage d'une étape à une autre uniquement si l'étape est validée 
  passage_etape = false;
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
  modeleClientSrc: any;
  modele_Client: any;
  image_Client_par_defaut_blob: any;
  imageClientSrc: any;
  constructor(private http: HttpClient, public serviceClient: ClientServiceService, private fb: FormBuilder ,public router: Router) {
    this.ChargementImage();
    this.sansChoixImage();
    this.chargementModelClient();
    this.modelePdfClientBase64();
    // premiere formulaire contenant les informations générales du Client avec les contrôles sur les champs
    this.Informations_Generales_Form = this.fb.group({
      Nom_Client: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      Categorie_Client: ['', Validators.required],
      Categorie_Fiscale: ['Assujetti_tva', Validators.required],
      Identification_Fiscale: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(15)]],
      Representant: ['',  ],
      Type_Piece_Identite: ['', Validators.required],
      N_Piece_Identite: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      Date_Livraison_Identite: [],
      Description: [''],
      N_Attestation_Exoneration: [''],
      Etablie_Le: [],
      Valable_Au: [],
      Taux_Reduction_Tva: []
    });
    // deuxieme formulaire contenant les informations financières du Client avec les contrôles sur les champs
    this.Informations_Banques_Form = this.fb.group({
      Banque1: ['', Validators.required],
      Rib1: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(20)]],
      Banque2: [''],
      Rib2: ['', [Validators.minLength(20), Validators.maxLength(20)]],
      Solde_Facture: [],
      Risque: [],
      Plafond: [],
      Bloque_Vente: [],
      Timbre_Fiscal: [true]
    });
    this.Informations_Banques_Form.controls.Rib2.disable();
    this.Informations_Banques_Form.controls.Rib1.disable();
    // troisième formulaire contenant les contacts du Client avec les contrôles sur les champs
    this.ContactForm = this.fb.group({
      Pays: ['', Validators.required],
      Region: [''],
      Ville: [''],
      Email: ['', [ Validators.required, Validators.email,]],
      Tel1: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      Tel2: [''],
      Fax: [''],
      Site_Web: [''],
      Contact: ['', [Validators.required]],
      Adresse: ['', [Validators.required]],
      Image: [''],
    });
    // formulaire affichant la récapitulation des tous les champs saisis et contenant le bouton de sauvegarde
    this.Recapitulation_Form = this.fb.group({});
    // récupérer la liste des categories Clients
    this.serviceClient.ListerCategorieClient().subscribe((reponse: Response) => {

      this.categorie_Client = reponse;
    });
    // récupérer la liste des categories pièce d'identité
    this.serviceClient.ListerCategoriePiece().subscribe((reponse: Response) => {

      this.categorie_piece = reponse;
    });
    // récupérer la liste des categories fiscale
    this.serviceClient.ListerCategorieFiscale().subscribe((reponse: Response) => {

      this.categorie_fiscale = reponse;
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
  // reactiver saisi rib2

  ChoixBanque2(event: MatSelectChange){
    this.Informations_Banques_Form.controls.Rib2.enable();
  }
  // reactiver saisi rib1

  ChoixBanque1(event: MatSelectChange){
    this.Informations_Banques_Form.controls.Rib1.enable();
  }
  // fonction activée lors de choix de la categorie fiscale pour récupérer la valeur selectionnée
  CategorieFiscaleSelectionner(event: MatSelectChange) {
    this.choix_Categorie_Fiscale = event.value;
  }
  // fonction activée lors de choix du pays pour récupérer la liste des villes dans ce dernier
  ChoixPays(event: MatSelectChange) {
    this.pays = event.value;
    this.serviceClient.ListerVille(this.pays).subscribe((reponse: Response) => {

      this.categorie_ville = reponse;

    });
  }
  // fonction activée lors de choix de la ville pour récupérer la liste des régions dans cette dernière
  ChoixVille(event: MatSelectChange) {
    this.ville = event.value;
    this.serviceClient.ListerRegion(this.ville).subscribe((reponse: Response) => {
      this.categorie_region = reponse;
    });
  }
  client_data:any;
 // méthode activée pour la création du client
  creerClient() {
    const nom_image_par_defaut = 'image_par_defaut.png';
    const Fichier_image_par_defaut = new File([this.image_Client_par_defaut_blob], nom_image_par_defaut, { type: 'image/png' });
    var formData: any = new FormData();
    formData.append('Nom_Client', this.Informations_Generales_Form.get('Nom_Client').value);
    formData.append('Categorie_Client', this.Informations_Generales_Form.get('Categorie_Client').value);
    formData.append('Categorie_Fiscale', this.Informations_Generales_Form.get('Categorie_Fiscale').value);
    formData.append('Code_Tva', this.Informations_Generales_Form.get('Identification_Fiscale').value);
    if (this.ContactForm.get('Image').value === '') {
      formData.append('Image', Fichier_image_par_defaut);
    } else formData.append('Image', this.ContactForm.get('Image').value);
    formData.append('Type_Piece_Identite', this.Informations_Generales_Form.get('Type_Piece_Identite').value);
    formData.append('N_Piece_Identite', this.Informations_Generales_Form.get('N_Piece_Identite').value);
    if (this.Informations_Generales_Form.get('Date_Livraison_Identite').value === null) {
      formData.append('Date_Livraison_Identite', '01/01/1900');
    } else formData.append('Date_Livraison_Identite', this.Informations_Generales_Form.get('Date_Livraison_Identite').value);
    formData.append('Representant', this.Informations_Generales_Form.get('Representant').value);
    formData.append('Description', this.Informations_Generales_Form.get('Description').value);
    formData.append('N_Attestation_Exoneration', this.Informations_Generales_Form.get('N_Attestation_Exoneration').value);
    if (this.Informations_Generales_Form.get('Etablie_Le').value === null) {
      formData.append('Debut_Exoneration', '01/01/1900');
    } else formData.append('Debut_Exoneration', this.Informations_Generales_Form.get('Etablie_Le').value);
    if (this.Informations_Generales_Form.get('Valable_Au').value === null) {
      formData.append('Fin_Exoneration', '01/01/1900');
    } else formData.append('Fin_Exoneration', this.Informations_Generales_Form.get('Valable_Au').value);
     // test sur valeur Taux_Reduction_Tva , si n'est pas saisi mettre par defaut 0
    if (this.Informations_Generales_Form.get('Taux_Reduction_Tva').value == null) {
      formData.append('Reduction_Tva', 0);
    }
    else formData.append('Reduction_Tva', this.Informations_Generales_Form.get('Taux_Reduction_Tva').value);
    formData.append('Banque1', this.Informations_Banques_Form.get('Banque1').value);
    formData.append('Rib1', this.Informations_Banques_Form.get('Rib1').value);
    formData.append('Banque2', this.Informations_Banques_Form.get('Banque2').value);
    formData.append('Rib2', this.Informations_Banques_Form.get('Rib2').value);
    // test sur valeur Timbre_Fiscal , si n'est pas saisi mettre par defaut false (sans timbre)
    if (this.Informations_Banques_Form.get('Timbre_Fiscal').value == null) {
      formData.append('Timbre_Fiscal', false);
    }
    else formData.append('Timbre_Fiscal', this.Informations_Banques_Form.get('Timbre_Fiscal').value);
    // test sur valeur Bloque_Vente , si n'est pas saisi mettre par defaut false (nn bloquer)
    if (this.Informations_Banques_Form.get('Bloque_Vente').value == null) {
      formData.append('Bloque_Vente', false);
    }
    else formData.append('Bloque_Vente', this.Informations_Banques_Form.get('Bloque_Vente').value);
    // test sur valeur Solde_Facture , si n'est pas saisi mettre par defaut 0
    if (this.Informations_Banques_Form.get('Solde_Facture').value == null) {
      formData.append('Solde_Facture', 0);
    }
    else formData.append('Solde_Facture', this.Informations_Banques_Form.get('Solde_Facture').value);
    // test sur valeur Risque , si n'est pas saisi mettre par defaut 0
    if (this.Informations_Banques_Form.get('Risque').value == null) {
      formData.append('Risque', 0);
    }
    else formData.append('Risque', this.Informations_Banques_Form.get('Risque').value);
    // test sur valeur plafond , si n'est pas saisi mettre par defaut 0
    if (this.Informations_Banques_Form.get('Plafond').value == null) {
      formData.append('Plafond', 0);
    }
    else formData.append('Plafond', this.Informations_Banques_Form.get('Plafond').value);
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
    this.serviceClient.ajouterClient(formData).subscribe(reponse => {
      this.client_data = reponse.body;
      Swal.fire(       
        'success',
        'Client ajouté avec succès',
        'success'
      ).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Voulez vous imprimer ce Client',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
          }).then((result) => {
            if (result.isConfirmed) {
  
              this.genererPdfClient(this.client_data.id_Clt);
              
            } else if (result.isDismissed) {
              console.log('erreur  ');
            }
            this.router.navigate(['/Menu/Menu-init/Menu-fournisseur/Lister-fournisseur']);
          });
        }
       
      
      }, (err) => {
  
  
  
      });
    });
    }
  //fonction activée lors de choix d'une image pour la convertir en base 64
  choixImageClient() {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imageClientSrc = reader.result;
      this.imageClientSrc = btoa(this.imageClientSrc);
      this.imageClientSrc = atob(this.imageClientSrc);
      this.imageClientSrc = this.imageClientSrc.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    reader.readAsDataURL(this.ContactForm.get('Image').value);
  }

  // generer PDF contenant details du Client ajouté  
  genererPdfClient(id:any) {
    // tester si l'image de client n'est pas inserée pour mettre une image par défaut
    if (this.ContactForm.get('Image').value === '') {
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
                }
              ],
              alignment: 'center'
            }
          ]
        };
      },

      pageMargins: [30, 125, 40, 60],
      background: [{
        image: 'data:image/jpeg;base64,' + this.modeleClientSrc, width: 600
      }],
      content: [
        {
          image: 'data:image/jpeg;base64,' + this.imageClientSrc,
              width: 150,
              height: 170,
       
              relativePosition: {x:20, y:25}
        },
        {   text: 'Code Client   '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:30}	  , },
        {   text: '' + id  , fontSize: 15,   color: 'black',    decoration :'underline',     bold: true,    relativePosition: {x:360, y:27}	  , },
        {   text: ': ' ,    fontSize: 12,   color: 'black',           relativePosition: {x:350, y:30}	  , },
        {   text: 'Nom du Client  '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:55}	  , },
        {   text: '' + this.Informations_Generales_Form.get('Nom_Client').value, fontSize: 15,   color: 'black',    decoration :'underline',     bold: true,    relativePosition: {x:360, y:52}	  , },
        {   text: ': ' ,    fontSize: 12,   color: 'black',           relativePosition: {x:350, y:55}	  , },

         {   text: 'Categorie du Client : '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:80}	  , },
        {   text: ': ' + this.Informations_Generales_Form.get('Categorie_Client').value, fontSize: 12,   color: 'black',       relativePosition: {x:350, y:80}	  , },

        {   text: 'Adresse   '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:105}	  , },
        {   text: ': ' + this.ContactForm.get('Adresse').value , fontSize: 12,   color: 'black',     relativePosition: {x:350, y:105}	  , },
     
        {   text: ' Site Web   '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:130}	  , },
        {   text: ': ' + this.ContactForm.get('Site_Web').value , fontSize: 12,   color: 'black',      relativePosition: {x:350, y:130}	  , },
      
        {   text: ' Representant   '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:155}	  , },
        {   text: ': ' +  this.Informations_Generales_Form.get('Representant').value , fontSize: 12,   color: 'black',      relativePosition: {x:350, y:155}	  , },
      
        {   text: ' Tel /Fax  '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:180}	  , },
        {   text: ': ' + this.ContactForm.get('Tel1').value + ' / ' + this.ContactForm.get('Tel2').value +' / '+ this.ContactForm.get('Fax').value, fontSize: 12,   color: 'black',      relativePosition: {x:350, y:180}	  , },
      

        {   text: ' Pays :  '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:220}	  , },
        {   text: '' + this.ContactForm.get('Pays').value, fontSize: 12,   color: 'black',      relativePosition: {x:60, y:220}	  , },
      
        {   text: ' Ville :  '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:200, y:220}	  , },
        {   text: '' + this.ContactForm.get('Ville').value , fontSize: 12,   color: 'black',      relativePosition: {x:240, y:220}	  , },
      
        {   text: ' Region  '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:350, y:220}	  , },
        {   text: ': ' +this.ContactForm.get('Region').value , fontSize: 12,   color: 'black',      relativePosition: {x:390, y:220}	  , },

        {   text: ' Type de la pièce d' + "'" + ' identité : '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:255}	  , },
        {   text: '' + this.Informations_Generales_Form.get('Type_Piece_Identite').value , fontSize: 12,   color: 'black',      relativePosition: {x:180, y:255}	  , },
      
        {   text: ' Numéro de la pièce d' + "'" + ' identité   '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:250, y:255}	  , },
        {   text: ': ' +  this.Informations_Generales_Form.get('N_Piece_Identite').value , fontSize: 12,   color: 'black',      relativePosition: {x:415, y:255}	  , },

        {   text: ' Categorie Fiscale : '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:290}	  , },
        {   text: '' + this.Informations_Generales_Form.get('Categorie_Fiscale').value , fontSize: 12,   color: 'black',      relativePosition: {x:140, y:290}	  , },
      
        {   text: ' Identification Fiscale  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:250, y:290}	  , },
        {   text: ': ' +  this.Informations_Generales_Form.get('Identification_Fiscale').value , fontSize: 12,   color: 'black',      relativePosition: {x:380, y:290}	  , },

        
        {   text: ' Banque 1  : '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:325}	  , },
          {   text: '' +  this.Informations_Banques_Form.get('Banque1').value , fontSize: 12,   color: 'black',      relativePosition: {x:140, y:325}	  , },
        
          {   text: ' Rib 1  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:250, y:325}	  , },
          {   text: ': ' + this.Informations_Banques_Form.get('Rib1').value , fontSize: 12,   color: 'black',      relativePosition: {x:380, y:325}	  , },


          {   text: ' Banque 2  : '   ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:360}	  , },
          {   text: '' +  this.Informations_Banques_Form.get('Banque2').value, fontSize: 12,   color: 'black',      relativePosition: {x:140, y:360}	  , },
        
          {   text: ' Rib 2  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:250, y:360}	  , },
          {   text: ': ' +  this.Informations_Banques_Form.get('Rib2').value, fontSize: 12,   color: 'black',      relativePosition: {x:380, y:360}	  , },
 
          {   text: ' Contact  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:395}	  , },
          {   text: ' : ' +  this.ContactForm.get('Contact').value , fontSize: 12,   color: 'black',      relativePosition: {x:100, y:395}	  , },

          {   text: ' Email  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:250, y:395}	  , },
          {   text: ' : ' + this.ContactForm.get('Email').value, fontSize: 12,   color: 'black',      relativePosition: {x:380, y:395}	  , },
  
          
          {   text: ' Description  '  ,    fontSize: 12,   color: 'black',  relativePosition: {x:20, y:430}	  , },
          {   text: ' : ' + this.Informations_Generales_Form.get('Description').value, fontSize: 12,   color: 'black',      relativePosition: {x:100, y:430}	  , },


    
      ],
      // content: [
      //   {
      //     columns: [

      //       {

      //         image: 'data:image/jpeg;base64,' + this.imageClientSrc,
      //         width: 150,
      //         height: 170
             

      //       },
      //       {
      //         width: '80%',
      //         text: '\n\n' +
      //           'Nom du Client : ' + this.Informations_Generales_Form.get('Nom_Client').value + '\n\n' + 'Adresse : ' + this.ContactForm.get('Adresse').value + '\n\n' + 'Contact : ' + this.ContactForm.get('Contact').value
      //           + '\n\n' + 'Email : ' + this.ContactForm.get('Email').value + '\n\n' + 'Site Web : ' + '\t' + this.ContactForm.get('Site_Web').value
      //       },


      //     ], columnGap: 40,

      //   },
      //   {
      //     columns: [

      //       {
      //         width: '50%',
      //         text: '\n\n' + 'Téléphones : ' + this.ContactForm.get('Tel1').value + ' / ' + this.ContactForm.get('Tel2').value
      //       },

      //       {
      //         width: '50%',
      //         text: '\n\n' + 'Fax : ' + this.ContactForm.get('Fax').value
      //       }
      //     ]
      //   },
      //   {
      //     columns: [

      //       {
      //         width: '33%',
      //         text: '\n' + 'Pays : ' + this.ContactForm.get('Pays').value,
      //       },

      //       {
      //         width: '33%',
      //         text: '\n' + 'Ville : ' + this.ContactForm.get('Ville').value,
      //       },

      //       {
      //         width: '33%',
      //         text: '\n' + 'Region : ' + this.ContactForm.get('Region').value,
      //       }
      //     ]
      //   },
      //   {
      //     columns: [

      //       {
      //         width: '50%',
      //         text: '\n' + 'Catégorie Fiscale : ' + this.Informations_Generales_Form.get('Categorie_Fiscale').value
      //       },

      //       {
      //         width: '50%',
      //         text: '\n' + 'Identification Fiscale : ' + this.Informations_Generales_Form.get('Identification_Fiscale').value
      //       }
      //     ]
      //   },
      //   {
      //     columns: [

      //       {
      //         width: '50%',
      //         text: '\n' + 'Type de la pièce d' + "'" + ' identité : ' + this.Informations_Generales_Form.get('Type_Piece_Identite').value
      //       },

      //       {
      //         width: '50%',
      //         text: '\n' + 'Numéro de la pièce d' + "'" + ' identité : ' + this.Informations_Generales_Form.get('N_Piece_Identite').value
      //       }
      //     ]
      //   },
      //   {
      //     text: '\n' + 'Catégorie du Client : ' + this.Informations_Generales_Form.get('Categorie_Client').value,

      //   },
      //   {
      //     text: '\n' + 'Representant : ' + this.Informations_Generales_Form.get('Representant').value,

      //   },

      //   {
      //     columns: [

      //       {
      //         width: '50%',
      //         text: '\n' + 'Banque 1 : ' + this.Informations_Banques_Form.get('Banque1').value
      //       },

      //       {
      //         width: '50%',
      //         text: '\n' + 'Rib 1 : ' + this.Informations_Banques_Form.get('Rib1').value,
      //       }
      //     ]
      //   },
      //   {
      //     columns: [

      //       {
      //         width: '50%',
      //         text: '\n' + 'Banque 2 : ' + this.Informations_Banques_Form.get('Banque2').value,
      //       },

      //       {
      //         width: '50%',
      //         text: '\n' + 'Rib 2 : ' + this.Informations_Banques_Form.get('Rib2').value,
      //       }
      //     ]
      //   },



      //   {
      //     text: '\n' + 'Description : ' + '\t' + this.Informations_Generales_Form.get('Description').value,



      //   },
      // ]
    };

    pdfMake.createPdf(dd).open();
  }
  // message d'erreur lorsque le nom saisi ne respecte pas les conditions prédifinis
  MessageErreurNom() {
    if (this.Informations_Generales_Form.get('Nom_Client').hasError('required')) {
      return 'Vous devez entrer le nom du Client!';
    }

    if (this.Informations_Generales_Form.get('Nom_Client').hasError('minlength')) {
      return 'Nom du Client non valide! (Min 3 caractères)';
    }
    if (this.Informations_Generales_Form.get('Nom_Client').hasError('maxlength')) {
      return 'Nom du Client non valide! (Max 30 caractères)';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque le representant saisi ne respecte pas les conditions prédifinis
  MessageErreurRepresentant() {
    if (this.Informations_Generales_Form.get('Representant').hasError('required')) {
      return 'Vous devez entrer le representant du Client!';
    }

    if (this.Informations_Generales_Form.get('Representant').hasError('minlength')) {
      return 'Representant non valide! (Min 3 caractères)';
    }
    if (this.Informations_Generales_Form.get('Representant').hasError('maxlength')) {
      return 'Representant non valide! (Max 30 caractères)';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque Categorie Client saisi ne respecte pas les conditions prédifinis
  MessageErreurCategorieClient() {
    if (this.Informations_Generales_Form.get('Categorie_Client').hasError('required')) {
      return 'Vous devez entrer la  Categorie du Client!';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque Categorie Fiscale saisi ne respecte pas les conditions prédifinis
  MessageErreurCategorieFiscale() {
    if (this.Informations_Generales_Form.get('Categorie_Fiscale').hasError('required')) {
      return 'Vous devez entrer la  Categorie Fiscale!';
    } else {
      return ""
    }

  }
  // message d'erreur lorsque l'identifiant fiscal saisi ne respecte pas les conditions prédifinis
  MessageErreurIdentificationFiscale() {
    if (this.Informations_Generales_Form.get('Identification_Fiscale').hasError('required')) {
      return 'Vous devez entrer Identification Fiscale!';
    }
    if (this.Informations_Generales_Form.get('Identification_Fiscale').hasError('minlength')) {
      return 'Identification Fiscale non valide! (Min 13 caractères)';
    }
    if (this.Informations_Generales_Form.get('Identification_Fiscale').hasError('maxlength')) {
      return 'Identification Fiscale non valide! (Max 15 caractères)';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque CategorieP iece saisi ne respecte pas les conditions prédifinis
  MessageErreurCategoriePiece() {
    if (this.Informations_Generales_Form.get('Type_Piece_Identite').hasError('required')) {
      return 'Vous devez entrer le type de la piece Identité!';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque le numero de piece d'identité saisi ne respecte pas les conditions prédifinis
  MessageErreurNPieceIdentite() {
    if (this.Informations_Generales_Form.get('N_Piece_Identite').hasError('required')) {
      return 'Vous devez entrer le numéro de pièce identité!';
    }
    if (this.Informations_Generales_Form.get('N_Piece_Identite').hasError('minlength')) {
      return 'Numéro de pièce identité non valide! (Min 8 caractères)';
    }
    if (this.Informations_Generales_Form.get('N_Piece_Identite').hasError('maxlength')) {
      return 'Numéro de pièce identité non valide! (Max 15 caractères)';
    } else {
      return ""
    }
  }
  // message d'erreur de numéro d'exoneration
  MessageErreurNAttestationExoneration() {
    if (this.Informations_Generales_Form.get('N_Attestation_Exoneration').hasError('required')) {
      return 'Vous devez entrer numero attestaion!';
    } else {
      return ""
    }
  }
  // message d'erreur de date debut d'exoneration
  MessageErreurEtablieLe() {
    if (this.Informations_Generales_Form.get('Etablie_Le').hasError('required')) {
      return 'Vous devez entrer date exoneration tva!';
    } else {
      return ""
    }
  }
  // message d'erreur de date fin d'exoneration
  MessageErreurValableAu() {
    if (this.Informations_Generales_Form.get('Valable_Au').hasError('required')) {
      return 'Vous devez entrer date exoneration tva!';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque Taux Reduction Tva saisi ne respecte pas les conditions prédifinis
  MessageErreurTauxReductionTva() {
    if (this.Informations_Generales_Form.get('Taux_Reduction_Tva').hasError('required')) {
      return 'Vous devez entrer Taux du Reduction tva!';
    } else {
      return ""
    }
  }
  // message d'erreur lorsque banque saisi ne respecte pas les conditions prédifinis
  MessageErreurBanque() {
    if (this.Informations_Banques_Form.get('Banque1').hasError('required')) {
      return 'Vous devez choisir une Banque!';
    } else {
      return ""
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
      return ""
    }
  }
  // message d'erreur lorsque Contact saisi ne respecte pas les conditions prédifinis
  MessageErreurContact() {
    if (this.ContactForm.get('Contact').hasError('required')) {
      return 'Vous devez saisir un contact';
    } else {
      return ""
    }
   
  }
  // message d'erreur lorsque l'adresse saisi ne respecte pas les conditions prédifinis
  MessageErreurAdresse() {
    if (this.ContactForm.get('Adresse').hasError('required')) {
      return 'Vous devez entrer Adresse';
    } else {
      return ""
    }
  
  }
  // message d'erreur lorsque pays saisi ne respecte pas les conditions prédifinis
  MessageErreurPays() {
    if (this.ContactForm.get('Pays').hasError('required')) {
      return 'Vous devez choisir un  Pays!';
    } else {
      return ""
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
      return ""
    }
  }
  // message d'erreur lorsque tel saisi ne respecte pas les conditions prédifinis
  MessageErreurTel() {
    if (this.ContactForm.get('Tel1').hasError('required')) {
      return 'Vous devez saisir un  numéro du téléphone!';
    } else {
      return ""
    }
  }
  ngOnInit(): void {
  }
  // temps d'attente pour le traitement de fonction 
  delai(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // conversion de modele de pdf  en base 64 
  async modelePdfClientBase64() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.modeleClientSrc = lecteur.result;
      this.modeleClientSrc = btoa(this.modeleClientSrc);
      this.modeleClientSrc = atob(this.modeleClientSrc);
      this.modeleClientSrc = this.modeleClientSrc.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    lecteur.readAsDataURL(this.modele_Client);
  }

  
  // récupération de modele pour créer le pdf
  async chargementModelClient() {
    this.http.get('.././assets/images/PDF_Fiche_Client.jpg', { responseType: 'blob' }).subscribe((reponse: any) => {
      this.modele_Client = reponse;
      return this.modele_Client;

    }, err => console.error(err),
      () => console.log(this.modele_Client))
  }
  // récupération d'image par défaut de l'assets
  async ChargementImage() {
    this.http.get('.././assets/images/image_par_defaut.jpg', { responseType: 'blob' }).subscribe((reponse: any) => {
      this.image_Client_par_defaut_blob = reponse;
      return this.image_Client_par_defaut_blob;

    }, err => console.error(err),
      () => console.log(this.image_Client_par_defaut_blob))

  }
  // conversion d'image par défaut en base 64
  async sansChoixImage() {
    await this.delai(4000);
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      this.imageClientSrc = lecteur.result;
      this.imageClientSrc = btoa(this.imageClientSrc);
      this.imageClientSrc = atob(this.imageClientSrc);
      this.imageClientSrc = this.imageClientSrc.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    lecteur.readAsDataURL(this.image_Client_par_defaut_blob);
  }
}
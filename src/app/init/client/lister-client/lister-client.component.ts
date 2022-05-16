import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClientServiceService } from '../Service/client-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableFilter } from 'mat-table-filter';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lister-client',
  templateUrl: './lister-client.component.html',
  styleUrls: ['./lister-client.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ListerClientComponent implements OnInit {
  typeFiltre: MatTableFilter;
  entiterFiltre: any;
  Clients: any;

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  contenu_developper: any | null;
  detailClient: any;
  recherche: any;
  valeurRecherche: string = '';
  filtre = '';
  liste_Filtres: any = [];
  base64Image: any;
  modele_Client: any;
  modeleClientSrc: any;
  chargementEnCours: any;
  displayedColumns: string[] = [
    'editer',
    'Image',
    'id_Clt',
    'nom_Client',
    'categorie_Client',
    'code_Tva',
    'email',
    'tel1',
    'sup',
  ];

  dataSource = new MatTableDataSource<table>();

  form = new FormGroup({
    id_Clt: new FormControl(''),
    nom_Client: new FormControl(''),
    code_Tva: new FormControl(''),
    categorie_Client: new FormControl(''),
    email: new FormControl(''),
    tel1: new FormControl(''),
  });

  constructor(
    private datePipe: DatePipe,
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    private serviceClient: ClientServiceService,
    private router: Router
  ) {
    this.ouvrirMessageChargement();
    this.chargementModeleClient();
    this.ListerClients();

    this.FiltresClient();
    this.modelePdfBase64();
    sessionStorage.setItem('Utilisateur', 'rochdi');
  }

  filtre_fr() {
    this.serviceClient
      .filtre_6champs(
        this.form.get('id_Clt')?.value,
        this.form.get('nom_Client')?.value,
        this.form.get('categorie_Client')?.value,
        this.form.get('code_Tva')?.value,
        this.form.get('email')?.value,
        this.form.get('tel1')?.value
      )
      .subscribe((data) => {
        this.dataSource.data = data as table[];
        this.Clients = data;
        this.Clients = this.Clients.sort((a: any, b: any) =>
          a.id_Fr > b.id_Fr ? -1 : 1
        );
        this.dataSource.data = data as table[];

        this.Clients.paginator = this.paginator;
        if (this.Clients.length == 0) {
          Swal.fire({
            title: 'aucun résultat trouvé',
            icon: 'warning',
          });
        }
      });
  }
  // message indiquant chargement de page
  ouvrirMessageChargement() {
    this._snackBar.open('Chargement!!', '', {
      duration: 500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  // liste des champs de client
  FiltresClient() {
    //recuperer la liste des champs du Client
    this.serviceClient
      .obtenirListeChampsClient()
      .subscribe((reponse: Response) => {
        this.liste_Filtres = reponse;
      });
  }
  validerRechercheTimbreFiscal(event: MatSelectChange) {
    this.valeurRecherche = event.value;
    this.serviceClient
      .filtrerClient(this.filtre, this.valeurRecherche)
      .subscribe((reponse: any) => {
        this.Clients = new MatTableDataSource(reponse);
      });
  }
  validerRechercheBloqueVente(event: MatSelectChange) {
    this.valeurRecherche = event.value;
    if (this.filtre != '') {
      this.serviceClient
        .filtrerClient(this.filtre, this.valeurRecherche)
        .subscribe((reponse: any) => {
          this.Clients = new MatTableDataSource(reponse);
        });
    }
  }
  // récuperer la liste des Clients
  ListerClients(): void {
    this.chargementEnCours = true;
    this.serviceClient.ListeClients().subscribe((data) => {
      this.Clients = data;
      this.Clients = this.Clients.sort((a: any, b: any) =>
        a.id_Clt > b.id_Clt ? -1 : 1
      );
      this.dataSource.data = data as table[];
      this.Clients.paginator = this.paginator;
      this.chargementEnCours = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // filter liste clients par date
  filtrerClientParDate() {
    this.valeurRecherche = this.datePipe.transform(
      this.valeurRecherche,
      'yyyy-MM-dd'
    );
    this.chargementEnCours = true;
    this.serviceClient
      .filtrerClient(this.filtre, this.valeurRecherche)
      .subscribe((data: any) => {
        this.Clients = data;
        this.Clients = this.Clients.sort((a: any, b: any) =>
          a.id_Clt > b.id_Clt ? -1 : 1
        );
        this.dataSource.data = data as table[];
        this.Clients.paginator = this.paginator;
        this.chargementEnCours = false;
        if (this.Clients.length == 0) {
          Swal.fire({
            title: 'aucun résultat trouvé',
            icon: 'warning',
          });
        }
      });
  }
  //supprimer Client par son identifiant
  supprimerClient(element: any) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimez-le',
      cancelButtonText: 'Non, garde le',
    }).then((result) => {
      if (result.value) {
        this.serviceClient.SupprimerClient(element);

        this.ListerClients();
        Swal.fire('Client Supprimé avec succès!', '', 'success');
        this.ListerClients();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Annulé', '', 'error');
      }
      this.ListerClients();
    });
  }
  // récuperer valeur du filtre choisi
  ChoixFiltre(event: MatSelectChange) {
    this.filtre = event.value;
    this.valeurRecherche = '';
  }
  //filtrer la liste du fournisseur
  filtrerClient() {
    if (this.filtre == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous devez choisir un filtre de recherche!',
      });
      this.ListerClients();
    } else if (this.valeurRecherche == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous n' + "'" + 'avez pas saisi une valeur de recherche!',
      });
      this.ListerClients();
    } else if (this.valeurRecherche == null) {
      Swal.fire({
        icon: 'error',
        text: 'Vous n' + "'" + 'avez pas saisi une valeur de recherche!',
      });
      this.ListerClients();
    } else {
      if (this.filtre != '') {
        if (
          this.filtre == 'date_livraison_identite' ||
          this.filtre == 'debut_exoneration' ||
          this.filtre == 'fin_exoneration' ||
          this.filtre == 'date_creation'
        ) {
          this.valeurRecherche = this.datePipe.transform(
            this.valeurRecherche,
            'yyyy-MM-dd'
          );
        }
        this.chargementEnCours = true;
        this.serviceClient
          .filtrerClient(this.filtre, this.valeurRecherche)
          .subscribe((reponse: any) => {
            this.Clients = new MatTableDataSource(reponse);
            this.Clients.sort = this.sort;
            this.Clients.paginator = this.paginator;
            this.chargementEnCours = false;
            if (this.Clients.length == 0) {
              Swal.fire({
                title: 'aucun résultat trouvé',
                icon: 'warning',
              });
            }
          });
      }
    }
  }
  //filtre activer par keyup
  filtrerClientParLettre() {
    if (this.valeurRecherche != '' && this.filtre == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous devez choisir un filtre de recherche!',
      });
      this.ListerClients();
    }
    if (this.filtre != '' && this.valeurRecherche != '') {
      this.serviceClient
        .filtrerClient(this.filtre, this.valeurRecherche)
        .subscribe((data: any) => {
          this.Clients = data;
          this.Clients = this.Clients.sort((a: any, b: any) =>
            a.id_Clt > b.id_Clt ? -1 : 1
          );
          this.dataSource.data = data as table[];
          this.Clients.paginator = this.paginator;
          this.chargementEnCours = false;
          if (this.Clients.length == 0) {
            Swal.fire({
              title: 'aucun résultat trouvé',
              icon: 'warning',
            });
          }
        });
    }
  }

  ngOnInit(): void {}
  // temps d'attente avant transformation d'image
  delai(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Transformer le modele au 64 et enlever le peremier code
  async modelePdfBase64() {
    await this.delai(2000);
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
  //definir template pour pdf
  async chargementModeleClient() {
    this.http
      .get('.././assets/images/PDF_Fiche_Client.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.modele_Client = reponse;
          return this.modele_Client;
        },
        (err) => console.error(err),
        () => console.log(this.modele_Client)
      );
  }

  // generer PDF contenant details du client
  genererPdfClient(id: any) {
    this.serviceClient.Client(id).subscribe((reponse: any) => {
      this.detailClient = reponse;

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
            image: 'data:image/jpeg;base64,' + this.modeleClientSrc,
            width: 600,
          },
        ],
        content: [
          {
            image: 'data:image/jpeg;base64,' + this.detailClient.image,
            width: 150,
            height: 170,

            relativePosition: { x: 20, y: 25 },
          },
          {
            text: 'Code Client  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 30 },
          },
          {
            text: '' + this.detailClient.id_Clt,
            fontSize: 15,
            color: 'black',
            decoration: 'underline',
            bold: true,
            relativePosition: { x: 360, y: 27 },
          },
          {
            text: ': ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 30 },
          },
          {
            text: 'Nom du Client  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 55 },
          },
          {
            text: '' + this.detailClient.nom_Client,
            fontSize: 15,
            color: 'black',
            decoration: 'underline',
            bold: true,
            relativePosition: { x: 360, y: 52 },
          },
          {
            text: ': ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 55 },
          },

          {
            text: 'Categorie du Client : ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 80 },
          },
          {
            text: ': ' + this.detailClient.categorie_Client,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 80 },
          },

          {
            text: 'Adresse   ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 105 },
          },
          {
            text: ': ' + this.detailClient.adresse,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 105 },
          },

          {
            text: ' Site Web   ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 130 },
          },
          {
            text: ': ' + this.detailClient.site_Web,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 130 },
          },

          {
            text: ' Representant   ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 155 },
          },
          {
            text: ': ' + this.detailClient.representant,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 155 },
          },

          {
            text: ' Tel /Fax  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 180 },
          },
          {
            text:
              ': ' +
              this.detailClient.tel1 +
              ' / ' +
              this.detailClient.tel2 +
              ' / ' +
              this.detailClient.fax,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 180 },
          },

          {
            text: ' Pays :  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 220 },
          },
          {
            text: '' + this.detailClient.pays,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 60, y: 220 },
          },

          {
            text: ' Ville :  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 200, y: 220 },
          },
          {
            text: '' + this.detailClient.ville,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 240, y: 220 },
          },

          {
            text: ' Region  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 350, y: 220 },
          },
          {
            text: ': ' + this.detailClient.region,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 390, y: 220 },
          },

          {
            text: ' Type de la pièce d' + "'" + ' identité : ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 255 },
          },
          {
            text: '' + this.detailClient.type_Piece_Identite,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 180, y: 255 },
          },

          {
            text: ' Numéro de la pièce d' + "'" + ' identité   ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 250, y: 255 },
          },
          {
            text: ': ' + this.detailClient.n_Piece_Identite,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 415, y: 255 },
          },

          {
            text: ' Categorie Fiscale : ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 290 },
          },
          {
            text: '' + this.detailClient.categorie_Fiscale,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 140, y: 290 },
          },

          {
            text: ' Identification Fiscale  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 250, y: 290 },
          },
          {
            text: ': ' + this.detailClient.code_Tva,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 380, y: 290 },
          },

          {
            text: ' Banque 1  : ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 325 },
          },
          {
            text: '' + this.detailClient.banque1,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 140, y: 325 },
          },

          {
            text: ' Rib 1  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 250, y: 325 },
          },
          {
            text: ': ' + this.detailClient.rib1,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 380, y: 325 },
          },

          {
            text: ' Banque 2  : ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 360 },
          },
          {
            text: '' + this.detailClient.banque2,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 140, y: 360 },
          },

          {
            text: ' Rib 2  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 250, y: 360 },
          },
          {
            text: ': ' + this.detailClient.rib2,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 380, y: 360 },
          },

          {
            text: ' Contact  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 395 },
          },
          {
            text: ' : ' + this.detailClient.contact,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 100, y: 395 },
          },

          {
            text: ' Email  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 250, y: 395 },
          },
          {
            text: ' : ' + this.detailClient.email,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 380, y: 395 },
          },

          {
            text: ' Description  ',
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 20, y: 430 },
          },
          {
            text: ' : ' + this.detailClient.description,
            fontSize: 12,
            color: 'black',
            relativePosition: { x: 100, y: 430 },
          },
        ],
      };

      pdfMake.createPdf(dd).open();
    });
  }
}

export class table {
  id_Fr: string;
  nom_Fournisseur: string;
  categorie_Fournisseur: string;
  code_Tva: string;
  email: string;
  tel1: string;
}

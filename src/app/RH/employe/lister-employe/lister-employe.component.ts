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
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableFilter } from 'mat-table-filter';
import { DatePipe } from '@angular/common';
import { EmployeServiceService } from '../Service/employe-service.service';
import { FormControl, FormGroup } from '@angular/forms';
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');

pdfMake.vfs = pdfFonts.pdfMake.vfs;
export class table {
  id_Employe: string;
  nom_Employe: string;
  role: string;
  acces: string;
  pays: string;
  ville: string;
}

@Component({
  selector: 'app-lister-employe',
  templateUrl: './lister-employe.component.html',
  styleUrls: ['./lister-employe.component.scss'],
})
export class ListerEmployeComponent implements OnInit {
  typeFiltre: MatTableFilter;
  entiterFiltre: any;
  Employes: any;
  dataSource = new MatTableDataSource<table>();
  displayedColumns: string[] = [
    'editer',
    'Image',
    'id_Employe',
    'nom',
    'role',
    'acces',
    'pays',
    'ville',
    'Supprimer',
  ];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  contenu_developper: any | null;
  detail: any;
  recherche: any;
  valeurRecherche: string = '';
  filtre = '';
  liste_Filtres: any = [];
  base64Image: any;
  modele: any;
  modeleSrc: any;
  chargementEnCours: any;

  date: any;

  form = new FormGroup({
    id_Employe: new FormControl(''),
    nom: new FormControl(''),
    role: new FormControl(''),
    acces: new FormControl(''),
    pays: new FormControl(''),
    ville: new FormControl(''),
  });
  constructor(
    private datePipe: DatePipe,
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    private serviceClient: EmployeServiceService,
    private router: Router,
    public datepipe: DatePipe
  ) {
    this.ouvrirMessageChargement();
    this.chargementModele();
    this.ListerEmployes();
    this.Filtres();
    this.modelePdfBase64();
    sessionStorage.setItem('Utilisateur', 'rochdi');
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // message indiquant chargement de page
  ouvrirMessageChargement() {
    this._snackBar.open('Chargement!!', '', {
      duration: 500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  // liste des champs de Employes
  Filtres() {
    //recuperer la liste des champs du Employes
    this.serviceClient
      .obtenirListeChampsClient()
      .subscribe((reponse: Response) => {
        this.liste_Filtres = reponse;
      });
  }

  filtre_emp() {
    this.serviceClient
      .filtre_6champs(
        this.form.get('id_Employe')?.value,
        this.form.get('nom')?.value,
        this.form.get('role')?.value,
        this.form.get('acces')?.value,
        this.form.get('pays')?.value,
        this.form.get('ville')?.value
      )
      .subscribe((data) => {
        this.dataSource.data = data as table[];
        this.Employes = data;
        this.Employes = this.Employes.sort((a: any, b: any) =>
          a.id_Employe > b.id_Employe ? -1 : 1
        );
        this.dataSource.data = data as table[];
        this.Employes.paginator = this.paginator;
      });
  }
  // récuperer la liste des Employes
  ListerEmployes(): void {
    this.chargementEnCours = true;
    this.serviceClient.ListeEmployes().subscribe((data) => {
      this.Employes = data;
      this.Employes = this.Employes.sort((a: any, b: any) =>
        a.id_Employe > b.id_Employe ? -1 : 1
      );
      this.dataSource.data = data as table[];
      this.Employes.paginator = this.paginator;
      console.log(this.Employes);
      this.chargementEnCours = false;
    });
  }
  // filter liste clients par date
  filtrerClientParDate() {
    this.valeurRecherche = this.datePipe.transform(
      this.valeurRecherche,
      'yyyy-MM-dd'
    );
    this.chargementEnCours = true;
    this.serviceClient
      .filtrerEmployes(this.filtre, this.valeurRecherche)
      .subscribe((data: any) => {
        this.Employes = data;
        this.Employes = this.Employes.sort((a: any, b: any) =>
          a.id_Employe > b.id_Employe ? -1 : 1
        );
        this.dataSource.data = data as table[];
        this.Employes.paginator = this.paginator;
        this.chargementEnCours = false;
      });
  }
  //supprimer Client par son identifiant
  supprimeremploye(element: any) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimez-le',
      cancelButtonText: 'Non, garde le',
    }).then((result) => {
      if (result.value) {
        this.serviceClient.SupprimerEmployes(element);
        this.ListerEmployes();
        Swal.fire('Employe Supprimé avec succès!', '', 'success');
        this.ListerEmployes();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Annulé', '', 'error');
      }
    });
  }
  // récuperer valeur du filtre choisi
  ChoixFiltre(event: MatSelectChange) {
    this.filtre = event.value;
    this.valeurRecherche = '';
  }
  //filtrer la liste du fournisseur
  filtrer() {
    if (this.filtre == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous devez choisir un filtre de recherche!',
      });
      this.ListerEmployes();
    } else if (this.valeurRecherche == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous n' + "'" + 'avez pas saisi une valeur de recherche!',
      });
      this.ListerEmployes();
    } else if (this.valeurRecherche == null) {
      Swal.fire({
        icon: 'error',
        text: 'Vous n' + "'" + 'avez pas saisi une valeur de recherche!',
      });
      this.ListerEmployes();
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
          .filtrerEmployes(this.filtre, this.valeurRecherche)
          .subscribe((data: any) => {
            this.Employes = data;
            this.Employes = this.Employes.sort((a: any, b: any) =>
              a.id_Employe > b.id_Employe ? -1 : 1
            );
            this.dataSource.data = data as table[];
            this.Employes.paginator = this.paginator;
            this.chargementEnCours = false;
          });
      }
    }
  }
  //filtre activer par keyup
  filtrerParLettre() {
    if (this.valeurRecherche != '' && this.filtre == '') {
      Swal.fire({
        icon: 'error',
        text: 'Vous devez choisir un filtre de recherche!',
      });
      this.ListerEmployes();
    }
    if (this.filtre != '' && this.valeurRecherche != '') {
      this.serviceClient
        .filtrerEmployes(this.filtre, this.valeurRecherche)
        .subscribe((reponse: any) => {
          this.Employes = new MatTableDataSource(reponse);
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
  //definir template pour pdf
  async chargementModele() {
    this.http
      .get('../../assets/images/employee.jpg', { responseType: 'blob' })
      .subscribe(
        (reponse: any) => {
          this.modele = reponse;
          return this.modele;
        },
        (err) => console.error(err),
        () => console.log(this.modele)
      );
  }

  // generer PDF
  genererPdf(id: any) {
    this.serviceClient.Employe(id).subscribe((reponse: any) => {
      this.detail = reponse;

      var d = this.detail.date_de_permis;

      this.date = '';
      if (d === null) {
        this.date = this.datepipe.transform(d, 'dd/MM/yyyy');
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
                image: 'data:image/jpeg;base64,' + this.detail.image,
                width: 150,
                height: 170,
              },
              {
                width: '80%',
                text:
                  '\n\n' +
                  'Nom du Employé : ' +
                  this.detail.nom +
                  '\n\n' +
                  'Rôle : ' +
                  this.detail.role +
                  '\n\n' +
                  'Accès : ' +
                  this.detail.acces +
                  '\n\n' +
                  'Email : ' +
                  this.detail.email +
                  '\n\n' +
                  'Téléphones : ' +
                  '\t' +
                  this.detail.tel,
              },
            ],
            columnGap: 40,
          },

          {
            columns: [
              {
                width: '50%',
                text: '\n\n\n' + 'Pays : ' + this.detail.pays,
              },

              {
                width: '50%',
                text: '\n\n\n' + 'Ville : ' + this.detail.ville,
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
                  this.detail.type_piece_identite,
              },

              {
                width: '50%',
                text:
                  '\n\n' +
                  'Numéro de la pièce d' +
                  "'" +
                  ' identité : ' +
                  this.detail.n_piece_identite,
              },
            ],
          },

          {
            columns: [
              {
                width: '50%',
                text: '\n\n' + 'Banque 1 : ' + this.detail.banque,
              },

              {
                width: '50%',
                text: '\n\n' + 'Rib 1 : ' + this.detail.rib,
              },
            ],
          },

          {
            columns: [
              {
                width: '40%',
                text: '\n\n' + 'Code Cnss : ' + this.detail.cnss,
              },

              {
                width: '40%',
                text:
                  '\n\n' +
                  'Situation Familiale : ' +
                  this.detail.situation_Familiale,
              },

              {
                width: '20%',
                text:
                  '\n\n' + 'Enfant a Charge : ' + this.detail.Enfant_A_Charge,
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
                text: '\n\n' + 'Numéro de permis : ' + this.detail.permis,
              },

              {
                width: '20%',
                text:
                  '\n\n' +
                  'Categorie de permis : ' +
                  this.detail.categorie_permis,
              },
            ],
          },

          {
            text: '\n\n' + 'Description : ' + '\t' + this.detail.description,
          },
        ],
      };

      pdfMake.createPdf(dd).open();
    });
  }
}

import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ChauffeurService } from './services/chauffeur.service';

@Component({
  selector: 'app-chauffeurs',
  templateUrl: './chauffeurs.component.html',
  styleUrls: ['./chauffeurs.component.scss'],
})
export class ChauffeursComponent implements OnInit {
  dataSource = new MatTableDataSource<tableChauffeur>();
  chauffeurs: any;
  employes: any;
  displayedColumns: string[] = ['id', 'nom'];
  panelOpenState = false;
  form = new FormGroup({
    nom: new FormControl(''),
    categorie: new FormControl(''),
  });
  url: any;

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  modeDeconnecte: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public service: ChauffeurService,
    public datepipe: DatePipe,
    public sanitizer: DomSanitizer
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.service.configurationApplication().subscribe((data) => {
      this.modeDeconnecte = data.modeManuel;
      if (this.modeDeconnecte) {
        this.service.employesManuel().subscribe((data) => {
          this.employes = data;
          this.chauffeurs = this.employes.filter((x: any) => x.role == 'chauffeur');
          this.dataSource.data = this.chauffeurs as tableChauffeur[];
        });
      } else {
        this.service.employes().subscribe((data) => {
          this.employes = data;
          this.chauffeurs = this.employes.filter((x: any) => x.role == 'chauffeur');
          this.dataSource.data = this.chauffeurs as tableChauffeur[];
        });
      }
    });
  }

  //filtrer les chauffeur par nom ou catégorie
  filtrer() {
    if (this.modeDeconnecte) {
      if (
        this.form.get('nom').value === '' &&
        this.form.get('categorie').value === ''
      ) {
        //si on n'a pas de filtrage
        this.service.employesManuel().subscribe((data) => {
          this.employes = data;
          this.chauffeurs = this.employes.filter(
            (x: any) => x.role == 'chauffeur'
          );
          this.dataSource.data = this.chauffeurs as tableChauffeur[];
        });
      } else if (
        this.form.get('nom').value !== '' &&
        this.form.get('categorie').value === ''
      ) {
        //si on a filtrage par nom
        this.service
          .filtrerChauffeurManuel('nom', this.form.get('nom').value)
          .subscribe((res) => {
            this.employes = res;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      } else if (
        this.form.get('nom').value === '' &&
        this.form.get('categorie').value !== ''
      ) {
        //si on a filtrage par catégorie de permis
        this.service
          .filtrerChauffeurManuel('categorie_Permis', this.form.get('categorie').value)
          .subscribe((res) => {
            this.employes = res;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      } else {
        //si on a filtrage par nom et catégorie de permis
        this.service
          .filtrerChauffeurManuel('nom', this.form.get('nom').value)
          .subscribe((data) => {
            this.employes = data;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.chauffeurs = this.employes.filter(
              (x: any) => x.categorie_Permis == this.form.get('categorie').value
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      }
    } else {
      if (
        this.form.get('nom').value === '' &&
        this.form.get('categorie').value === ''
      ) {
        //si on n'a pas de filtrage
        this.service.employes().subscribe((data) => {
          this.employes = data;
          this.chauffeurs = this.employes.filter(
            (x: any) => x.role == 'chauffeur'
          );
          this.dataSource.data = this.chauffeurs as tableChauffeur[];
        });
      } else if (
        this.form.get('nom').value !== '' &&
        this.form.get('categorie').value === ''
      ) {
        //si on a filtrage par nom
        this.service
          .filtrerChauffeur('nom', this.form.get('nom').value)
          .subscribe((res) => {
            this.employes = res;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      } else if (
        this.form.get('nom').value === '' &&
        this.form.get('categorie').value !== ''
      ) {
        //si on a filtrage par catégorie de permis
        this.service
          .filtrerChauffeur('categorie_Permis', this.form.get('categorie').value)
          .subscribe((res) => {
            this.employes = res;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      } else {
        //si on a filtrage par nom et catégorie de permis
        this.service
          .filtrerChauffeur('nom', this.form.get('nom').value)
          .subscribe((data) => {
            this.employes = data;
            this.chauffeurs = this.employes.filter(
              (x: any) => x.role == 'chauffeur'
            );
            this.chauffeurs = this.employes.filter(
              (x: any) => x.categorie_Permis == this.form.get('categorie').value
            );
            this.dataSource.data = this.chauffeurs as tableChauffeur[];
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
      }

    }
  }
  getUrl(url: any) {
    // pour avoir la photo du chauffeur
    this.url = this.sanitizer.bypassSecurityTrustUrl(
      'data:image/png;base64,' + url
    ); //pour pouvoir afficher la photo sans des problémes de sécurité
  }
}
export interface tableChauffeur {
  id: number;
  nom: string;
  dateNaisance: Date;
  tel: number;
  email: String;
  typeId: String;
  numId: number;
  categoriePermis: String;
  numPermis: number;
  datePermis: Date;
}

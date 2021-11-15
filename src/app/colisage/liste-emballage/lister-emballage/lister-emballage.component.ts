import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmballageService } from '../services/emballage.service';

@Component({
  selector: 'app-lister-emballage',
  templateUrl: './lister-emballage.component.html',
  styleUrls: ['./lister-emballage.component.scss'],
})
export class ListerEmballageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //Declaration des variables

  // formGroup des filtres
  form = new FormGroup({
    idEmballage: new FormControl(''),
    nomProduit: new FormControl(''),
    nomEmballage: new FormControl(''),
    typeEmballage: new FormControl(''),
    quantite: new FormControl(''),
    unite: new FormControl(''),
    poids: new FormControl(''),
    volume: new FormControl(''),
  });
  listeEmballage: any;

  //les colonne du tableau liste de colisage
  displayedColumns: string[] = [
    'id',
    'nomEmballage',
    'typeEmballage',
    'nomProduit',
    'qte',
    'unite',
    'poids',
    'volume',
  ];
  dataSource = new MatTableDataSource<tableEmballage>();

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(public service: EmballageService) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1000200');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }
  async ngOnInit() {
    await this.getListeColisage();
  }

  //pour filtrer la liste colisage selon nom du produit, nom d'emballage et type D'emballage
  filtrerListeColisage() {
    // si on selectionne l'option vide dans le select type emballage en filtre par une chaine vide pour annuler l'effet de filtrage
    if (this.form.get('typeEmballage').value === undefined)
      this.form.get('type_Emballage').setValue('');
    this.service
      .fltreListeEmballagePlusieursChammps(
        this.form.get('idEmballage').value,
        this.form.get('nomEmballage').value,
        this.form.get('typeEmballage').value,
        this.form.get('nomProduit').value,
        this.form.get('quantite').value,
        this.form.get('unite').value,
        this.form.get('poids').value,
        this.form.get('volume').value
      )
      .subscribe((data) => {
        this.dataSource.data = data as tableEmballage[];
        // tri par id descendant
        this.dataSource.data = this.dataSource.data.sort((a, b) =>
          a.id > b.id ? -1 : 1
        );
      });
  }

  async getListeColisage() {
    //get la liste de colisage
    this.dataSource.data = await this.service.listeEmballage().toPromise();
    // tri par ordre id descendant
    this.dataSource.data = this.dataSource.data.sort((a, b) =>
      a.id > b.id ? -1 : 1
    );
  }

  //recuperer la quantité de chaque produit
  getQuantiteProduit(produits: any) {
    let qte = produits.qte.split('/');
    return qte;
  }

  //get le nom de chaque produit
  getNomProduit(produits: any) {
    let nomProduit = produits.nomProduit.split('/');
    return nomProduit;
  }
}

//interface table Emballage
export interface tableEmballage {
  //interface pour recuperer les données du liste colisage entant qu data source pour l'afficher dans le tableau
  id: number;
  idProduit: number;
  nomProduit: String;
  nomEmballage: String;
  typeEmballage: String;
  qte: number;
  unite: String;
  categorie: String;
  poids_emballage_total: number;
}

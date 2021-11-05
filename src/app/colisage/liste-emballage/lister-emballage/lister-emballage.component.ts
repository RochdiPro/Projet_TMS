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
  form = new FormGroup({
    idEmballage: new FormControl(''),
    nom_Produit: new FormControl(''),
    nom_Emballage: new FormControl(''),
    type_Emballage: new FormControl(''),
    quantite: new FormControl(''),
    unite: new FormControl(''),
    poids: new FormControl(''),
    volume: new FormControl(''),
  });
  listeColisage: any;
  displayedColumns: string[] = [
    'id',
    'nomEmballage',
    'typeEmballage',
    'nomProduit',
    'qte',
    'unite',
    'poids',
    'volume',
  ]; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(public service: EmballageService) {}
  async ngOnInit() {
    await this.chargerListeColisage();
    console.log(this.dataSource.data);
  }

  filtrerListeColisage() {
    //pour filtrer la liste colisage selon nom du produit, nom d'emballage et type D'emballage
    if (this.form.get('type_Emballage').value === undefined)
      this.form.get('type_Emballage').setValue('');
    this.service
      .fltreListeproduit(
        'nom_produit',
        this.form.get('nom_Produit').value,
        'nom_emballage',
        this.form.get('nom_Emballage').value,
        'type_emballage',
        this.form.get('type_Emballage').value
      )
      .subscribe((data) => {
        this.dataSource.data = data as tableColisage[];
        this.dataSource.data = this.dataSource.data.sort((a, b) =>
          a.id > b.id ? -1 : 1
        );
      });
  }

  async chargerListeColisage() {
    //chargement du liste de colisage
    this.dataSource.data = await this.service.listeEmballage().toPromise();
    this.dataSource.data = this.dataSource.data.sort((a, b) =>
      a.id > b.id ? -1 : 1
    );
  }

  getQuantiteProduit(produits: any) {
    //recuperer la quantité de chaque produit
    let qte = produits.qte.split('/');
    return qte;
  }

  getNomProduit(produits: any) {
    //recuperer le nom de chaque produit
    let nomProduit = produits.nomProduit.split('/');

    return nomProduit;
  }
}

//interface table colisage
export interface tableColisage { //interface pour recuperer les données du liste colisage entant qu data source pour l'afficher dans le tableau
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
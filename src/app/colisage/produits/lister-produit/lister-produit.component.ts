import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Produit } from '../classes/produit';
import { ProduitService } from '../services/produit.service';

@Component({
  selector: 'app-lister-produit',
  templateUrl: './lister-produit.component.html',
  styleUrls: ['./lister-produit.component.scss'],
})
export class ListerProduitComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //les colonne du tableau liste de colisage
  displayedColumns: string[] = [
    'id',
    'marque',
    'nom',
    'unite',
    'valeurUnite',
    'codeBarre',
    'type1',
    'type2',
  ];
  dataSource = new MatTableDataSource<Produit>();

  // variable des filtres
  filtreId: string = '';
  filtreMarque: string = '';
  filtreNom: string = '';

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  // pour activer et desactiver le progress bar de chargement
  chargementEnCours = true;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(private service: ProduitService, private router: Router) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1004400');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    this.service.produits().subscribe((produits: any) => {
      this.dataSource.data = produits;
      this.chargementEnCours = false;
    });
  }

  filtrerProduits() {
    this.chargementEnCours = true;
    this.service
      .filtrerProduits(this.filtreId, this.filtreMarque, this.filtreNom)
      .subscribe((result) => {
        this.dataSource.data = result;
        this.chargementEnCours = false;
      });
  }

  modifierProduit(produit: Produit) {
    this.service.prod = produit; //on enregistre le produit dans une variable dans le ProduitService pour le passer a l'interface de modification
    this.router.navigate(['/Menu/Menu_Colisage/Produits/modifier-produit']); //navigation vers l'interface modifier produit
  }
}

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from 'src/app/colisage.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss']
})
export class ListerCommandeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['id', 'reference', 'idClient', 'nomClient', 'contact', 'telephone', 'ville', 'adresse', 'date', 'etat', 'actions'];
  dataSource = new MatTableDataSource;
  constructor(public service: ColisageService, public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  async ngOnInit() {
    await this.getListeCommandes();
  }

  async getListeCommandes() {
    this.dataSource = await this.service.getListeCommandes().toPromise()
  }

  ouvrirBoiteDialogueModifierCommande() {
    const dialogRef = this.dialog.open(ModifierCommande, {
      width: '600'
    })
  }

}

//************************************************* Boite de dialogue modifier *******************************

@Component({
  selector: 'modifier-commande',
  templateUrl: '../ajouter-commande/boite-dialogue-creer-commande.html'
})

export class ModifierCommande implements OnInit {
  indicateurTypeCommande: String;
  typeDocument: String;
  articles: any;
  listeArticlesDetail: any = [];
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  listeEmballageChoisi: any = [];

  latMap: any = 34.74056;
  lngMap: any = 10.76028;
  lat: any = 0;
  lng: any = 0;
  zoom: number = 5;
  positionExiste = false;
  positionClient: any = {
    latitude: 34.74056, longitude: 10.76028
  };
  positionsClientEnregistree: any = [];
  positionEstModifie: boolean = false;
  constructor(private fb: FormBuilder, public dialgRef: MatDialogRef<ModifierCommande>, @Inject(MAT_DIALOG_DATA) public data: any, public serviceColisage: ColisageService, public dialog: MatDialog) { }

  async ngOnInit() {
    this.firstFormGroup = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleAdresse: ''
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });

  }
}


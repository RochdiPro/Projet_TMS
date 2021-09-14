import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from '../../colisage.service';


//*************************************************************************************************************
//***********************************************INTERFACE LISTE DE COLISAGE **********************************
//*************************************************************************************************************
@Component({
  selector: 'app-liste-colisage',
  templateUrl: './liste-colisage.component.html',
  styleUrls: ['./liste-colisage.component.scss']
})
export class ListeColisageComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  displayedColumns: string[] = ['id', 'idProduit', 'typeEmballage', 'qte']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();
  liste_colisage: any ;

  constructor(public service: ColisageService, private dialog: MatDialog) { 
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  ouvrirAjouterProduit() { // ouvrir la boite de dialogue d'ajout de produit
    const dialogRef = this.dialog.open(AjouterProduitComponent, {
      width: 'auto;',
      panelClass: "custom-dialog",
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


}
export interface tableColisage {
  id: number;
  idProduit: number;
  typeEmballage: String;
  qte: number;
}

//******************************************************************************************************************
//*******************************************BOITE DE DIALOGUE AJOUTER PRODUIT**************************************
//******************************************************************************************************************

@Component({
  selector: 'ajouter-produit',
  templateUrl: 'ajouter-produit.html',
  styleUrls: ['ajouter-produit.scss'],
})
export class AjouterProduitComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  form = new FormGroup({ nom_Produit: new FormControl("")});
  displayedColumns: string[] = ['id_Produit', 'nom_Produit', 'marque', 'valeur_Unite', 'unite']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableProduits>();
  dataSourceUnitaire = new MatTableDataSource<tableProduits>();
  produitClicke = new Set<tableProduits>();
  produits : any;
  produitSelectionne : any = [];
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSourceUnitaire.paginator = this.paginator;
    this.dataSourceUnitaire.sort = this.sort;
  }
  constructor(public service: ColisageService, private _formBuilder: FormBuilder) {
    this.service.listeProduits().subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
      this.dataSourceUnitaire.data = this.produits as tableProduits[];
    });
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      validateur: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
      radio: ['', Validators.required]
    });
    
  }
  choisirProduit(p : any){
    this.produitClicke.clear();
    this.produitClicke.add(p);
    this.produitSelectionne=[];
    this.produitSelectionne.push(p);
    this.firstFormGroup.get('validateur').setValue("aze");
  }
  filtrerProduits(){
    
    this.service.filtreProduits("nom_Produit", this.form.get('nom_Produit').value).subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
    });

  }
  premierSuivant(){
    this.dataSourceUnitaire.data = this.produitSelectionne as tableProduits[];
  }
  radio(){
    console.log(    this.secondFormGroup.get('radio').value
    )
  }
}
export interface tableProduits {
  id_Produit : number;
  nom_Produit : String;
  marque : String;
  valeur_Unite : number;
  unite : String;
  
}
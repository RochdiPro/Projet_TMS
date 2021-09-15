import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from '../../colisage.service';
import Swal from 'sweetalert2'


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
  displayedColumns: string[] = ['id', 'idProduit', 'nomProduit', 'typeEmballage', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();
  liste_colisage: any;

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
  nomProduit: String;
  typeEmballage: String;
  qte: number;
  unite: String;
  categorie: String;
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
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  form = new FormGroup({ nom_Produit: new FormControl("") });
  displayedColumns: string[] = ['id_Produit', 'nom_Produit', 'marque', 'valeur_Unite', 'unite', 'typeProduit', 'sousType']; //les colonne du tableau liste de produits
  dataSource = new MatTableDataSource<tableProduits>();
  dataSourceUnitaire = new MatTableDataSource<tableProduits>();
  produitClicke = new Set<tableProduits>();
  produits: any;
  produitSelectionne: any = [];
  poidsToltal: number;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSourceUnitaire.paginator = this.paginator;
    this.dataSourceUnitaire.sort = this.sort;
  }
  constructor(public service: ColisageService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<AjouterProduitComponent>) {
    this.service.listeProduits().subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
      this.dataSourceUnitaire.data = this.produits as tableProduits[];
    });
  }

  ngOnInit() {
    this.premierFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required]
    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      type: ['', Validators.required],
      qte: ['', Validators.required],
      unite: ['', Validators.required],
      poids: ['', Validators.required],
      fragilite: [false],
      radio: ['', Validators.required],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required],
    });
    this.deuxiemeFormGroup.controls['longueur'].disable();
    this.deuxiemeFormGroup.controls['largeur'].disable();
    this.deuxiemeFormGroup.controls['hauteur'].disable();
    this.deuxiemeFormGroup.controls['volume'].disable();

  }
  choisirProduit(p: any) {
    this.produitClicke.clear();
    this.produitClicke.add(p);
    this.produitSelectionne = [];
    this.produitSelectionne.push(p);
    this.premierFormGroup.get('validateur').setValue("aze");
    console.log(this.produitSelectionne[0].nom_Produit)
  }
  filtrerProduits() {
    this.service.filtreProduits("nom_Produit", this.form.get('nom_Produit').value).subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
    });

  }
  premierSuivant() {
    this.dataSourceUnitaire.data = this.produitSelectionne as tableProduits[];
    this.deuxiemeFormGroup.controls['unite'].setValue(this.produitSelectionne[0].unite)
  }
  deuxiemeSuivant() {
    this.poidsToltal = Number(this.deuxiemeFormGroup.get('poids').value) * Number(this.deuxiemeFormGroup.get('qte').value);
    console.log(typeof this.poidsToltal)
  }
  choisirTypeDimensions() {
    if (this.deuxiemeFormGroup.get('radio').value === "dimensions") {
      this.deuxiemeFormGroup.controls['longueur'].enable();
      this.deuxiemeFormGroup.controls['largeur'].enable();
      this.deuxiemeFormGroup.controls['hauteur'].enable();
      this.deuxiemeFormGroup.controls['volume'].disable();
    } else if (this.deuxiemeFormGroup.get('radio').value === "volume") {
      this.deuxiemeFormGroup.controls['longueur'].disable();
      this.deuxiemeFormGroup.controls['largeur'].disable();
      this.deuxiemeFormGroup.controls['hauteur'].disable();
      this.deuxiemeFormGroup.controls['volume'].enable();
    }
  }
  reinitialiserStepper() {
    this.produitClicke.clear();
  }
  valider() {
    var formData: any = new FormData();
    formData.append("idProduit", Number(this.produitSelectionne[0].id_Produit));
    formData.append("nomProduit", this.produitSelectionne[0].nom_Produit);
    formData.append("typeEmballage", this.deuxiemeFormGroup.get('type').value);
    formData.append("qte", Number(this.deuxiemeFormGroup.get('qte').value));
    formData.append("unite", this.deuxiemeFormGroup.get('unite').value);
    formData.append("categorie", this.produitSelectionne[0].type1);
    if (this.deuxiemeFormGroup.get('fragilite').value) {
      formData.append("fragile", "Oui");
    } else {
      formData.append("fragile", "Non");
    }

    if (this.deuxiemeFormGroup.get('radio').value === "dimensions") {
      formData.append("hauteur", Number(this.deuxiemeFormGroup.get('hauteur').value));
      formData.append("longueur", Number(this.deuxiemeFormGroup.get('longueur').value));
      formData.append("largeur", Number(this.deuxiemeFormGroup.get('largeur').value));
      formData.append("volume", 0);
    } else if (this.deuxiemeFormGroup.get('radio').value === "volume") {
      formData.append("hauteur", 0);
      formData.append("longueur", 0);
      formData.append("largeur", 0);
      formData.append("volume", Number(this.deuxiemeFormGroup.get('volume').value));
    }

    formData.append("poids", Number(this.deuxiemeFormGroup.get('poids').value));
    formData.append("poidsTotal", this.poidsToltal);
    this.service.creerProduitEmballe(formData);
    this.dialogRef.close();
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }
}
export interface tableProduits {
  id_Produit: number;
  nom_Produit: String;
  marque: String;
  valeur_Unite: number;
  unite: String;
  type1: String;
  type2: String;

}
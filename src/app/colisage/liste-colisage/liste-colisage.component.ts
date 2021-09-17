import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from '../../colisage.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';


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

  form = new FormGroup({ nom_Produit: new FormControl(""), nom_Emballage: new FormControl(""), type_Emballage: new FormControl("") });
  listeColisage: any;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  displayedColumns: string[] = ['id', 'idProduit', 'nomProduit', 'nomEmballage', 'typeEmballage', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();

  constructor(public service: ColisageService) {
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  filtrerListeColisage() {
    this.service.fltreListeproduit("nom_produit", this.form.get('nom_Produit').value, "nom_emballage", this.form.get('nom_Emballage').value, "type_emballage", this.form.get('type_Emballage').value).subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  refraichirTableau() {
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

}
export interface tableColisage {
  id: number;
  idProduit: number;
  nomProduit: String;
  nomEmballage: String;
  typeEmballage: String;
  qte: number;
  unite: String;
  categorie: String;
}

//******************************************************************************************************************
//******************************************* AJOUTER PRODUIT ******************************************************
//******************************************************************************************************************

@Component({
  selector: 'ajouter-produit',
  templateUrl: 'ajouter-produit.html',
  styleUrls: ['ajouter-produit.scss'],
})
export class AjouterProduitComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLinear = true;
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  troisiemeFormGroup: FormGroup;
  form = new FormGroup({ nom_Produit: new FormControl("") });
  displayedColumns: string[] = ['id_Produit', 'nom_Produit', 'marque', 'valeur_Unite', 'unite', 'typeProduit', 'sousType']; //les colonne du tableau liste de produits
  dataSource = new MatTableDataSource<tableProduits>();
  dataSourceProduit = new MatTableDataSource<tableProduits>();
  produitClicke = new Set<tableProduits>();
  produits: any;
  produitSelectionne: any = [];
  poidsToltal: number = 0;
  poidsTotProduit: number;
  qte: number;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSourceProduit.paginator = this.paginator;
    this.dataSourceProduit.sort = this.sort;

  }
  constructor(public service: ColisageService, private formBuilder: FormBuilder, public _router: Router) {
    this.service.listeProduits().subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
      this.dataSourceProduit.data = this.produits as tableProduits[];
    });
  }

  ngOnInit() {
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      fragilite: [false],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required]

    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required]
    });
    this.troisiemeFormGroup = this.formBuilder.group({
      produit : this.formBuilder.array([])
    });
    this.dataSource.filterPredicate = (data, filter: string) => {
      return data.nom_Produit.toLowerCase().includes(filter)
     };
  }

  applyFilter(filterValue: any) {
    filterValue = (filterValue.target as HTMLTextAreaElement).value;
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  produit() : FormArray {
    return this.troisiemeFormGroup.get("produit") as FormArray
  }

  nouveauProduit(unite: any): FormGroup {
    return this.formBuilder.group({
      qte: ['', Validators.required],
      unite: [unite, Validators.required],
      poids: ['', Validators.required],
    })
  }

  ajouterProduit(unite: any) {
    this.produit().push(this.nouveauProduit(unite));
  }

  supprimerProduit() {
    this.produit().clear();
  }

  choisirProduit(p: any) {
    if (this.produitClicke.has(p)) {
      this.produitClicke.delete(p);
      this.produitSelectionne.splice(this.produitSelectionne.indexOf(p), 1);
      if (this.produitSelectionne.length == 0){
        this.dataSource.data = this.produits;
      }
    } else {
      this.produitClicke.add(p);
      this.produitSelectionne.push(p);
      this.dataSource.data = this.dataSource.data.filter((x: any) => x.unite == this.produitSelectionne[0].unite);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("aze");
  }
  filtrerNomProduits() {
    this.service.filtreProduits("nom_Produit", this.form.get('nom_Produit').value).subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
    });
  }
  premierSuivant() {

  }
  deuxiemeSuivant() {
    this.produitSelectionne.forEach((element: any) => {
      this.ajouterProduit(element.unite);
    });
    this.dataSourceProduit.data = this.produitSelectionne as tableProduits[];

  }
  troisiemeSuivant() {
  }
  deuxiemePrecedent(){
    this.supprimerProduit();
  }
  reinitialiserStepper() {
    this.produitClicke.clear();
  }
  valider() {
    let nom_Produit = ""
    this.produitSelectionne.forEach((element : any) => {
      nom_Produit += element.nom_Produit + "/"
    });
    nom_Produit = nom_Produit.slice(0,-1);
    var formData: any = new FormData();
    formData.append("idProduit", Number(this.produitSelectionne[0].id_Produit));
    formData.append("nomProduit", nom_Produit);
    formData.append("nomEmballage", this.premierFormGroup.get('nom').value);
    formData.append("typeEmballage", this.premierFormGroup.get('type').value);
    formData.append("qte", this.qte);
    formData.append("unite", this.troisiemeFormGroup.get('produit').value[0].unite);
    formData.append("categorie", this.produitSelectionne[0].type2);
    if (this.premierFormGroup.get('fragilite').value) {
      formData.append("fragile", "Oui");
    } else {
      formData.append("fragile", "Non");
    }

    formData.append("hauteur", Number(this.premierFormGroup.get('hauteur').value));
    formData.append("longueur", Number(this.premierFormGroup.get('longueur').value));
    formData.append("largeur", Number(this.premierFormGroup.get('largeur').value));
    formData.append("volume", Number(this.premierFormGroup.get('volume').value));
    formData.append("poids", 0);
    formData.append("poidsTotal", this.poidsToltal);
    this.service.creerProduitEmballe(formData);

    setTimeout(() => {
      this._router.navigate(['/Menu/Colisage/Liste_Colisage'])
    }, 500);
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }
  calculVolume() {
    if (this.premierFormGroup.get('hauteur').value !== "" && this.premierFormGroup.get('longueur').value !== "" && this.premierFormGroup.get('largeur').value !== "") {
      let volume = Number(this.premierFormGroup.get('hauteur').value) * Number(this.premierFormGroup.get('longueur').value) * Number(this.premierFormGroup.get('largeur').value);
      this.premierFormGroup.get('volume').setValue(volume);
    }
  }

  calculerPoidsProduit(poids:any,qte:any){
    this.poidsTotProduit = Number(poids)*Number(qte);
    return (this.poidsTotProduit);
  }

  calculerPoidsTotal(){
    this.poidsToltal = 0;
    this.qte = 0;
    for (let i = 0; i < this.produitSelectionne.length; i++) {
      this.poidsToltal += Number(this.troisiemeFormGroup.get('produit').value[i].poids) * Number(this.troisiemeFormGroup.get('produit').value[i].qte);
      this.qte += Number(this.troisiemeFormGroup.get('produit').value[i].qte)
    }
    return this.poidsToltal;
  }

  refraichirTableau() {
    this.service.listeProduits().subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableProduits[];
    });
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
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
  displayedColumns: string[] = ['id', 'nomEmballage', 'typeEmballage', 'idProduit', 'nomProduit', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();

  constructor(public service: ColisageService) {
    this.refraichirListeColisage();
  }

  filtrerListeColisage() {
    this.service.fltreListeproduit("nom_produit", this.form.get('nom_Produit').value, "nom_emballage", this.form.get('nom_Emballage').value, "type_emballage", this.form.get('type_Emballage').value).subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  refraichirListeColisage() {
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  getIdProduit(produits: any){
    let ids = produits.idProduit.split("/");
    return ids
  }

  getQuantiteProduit(produits : any){
    let qte = produits.qte.split("/");
    return qte
  }

  getNomProduit(produits: any){
    let nomProduit = produits.nomProduit.split("/");

    return nomProduit;
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

// *****************************************************************************************************************
// ******************************************Menu Ajouter***********************************************************
//******************************************************************************************************************
@Component({
  selector: 'menu-ajouter',
  templateUrl: 'menu-ajouter.html',
  styleUrls: ['menu-ajouter.scss'],
})
export class MenuAjouterComponent implements OnInit {

  ngOnInit() {
  }
  constructor(){
    
  }
}

//******************************************************************************************************************
//******************************************* AJOUTER PRODUIT a la liste colisage **********************************
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
  qte: any;
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
      longueur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      largeur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      hauteur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      volume: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]

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
    let id_Produit = ""
    let nom_Produit = ""
    this.produitSelectionne.forEach((element : any) => {
      nom_Produit += element.nom_Produit + "/"
      id_Produit += element.id_Produit + " (fiche produits)/"
    });
    id_Produit = id_Produit.slice(0,-1);
    nom_Produit = nom_Produit.slice(0,-1);
    var formData: any = new FormData();
    formData.append("idProduit", id_Produit);
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
    this.qte = "";
    for (let i = 0; i < this.produitSelectionne.length; i++) {
      this.poidsToltal += Number(this.troisiemeFormGroup.get('produit').value[i].poids) * Number(this.troisiemeFormGroup.get('produit').value[i].qte);
      this.qte += this.troisiemeFormGroup.get('produit').value[i].qte +"/"
    }
    this.qte = this.qte.slice(0, -1);
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
//*********************************************************************************************************
// *************************************Ajouter Pack a la liste colisage **********************************
// ********************************************************************************************************
@Component({
  selector: 'ajouter-pack',
  templateUrl: 'ajouter-pack.html',
  styleUrls: ['ajouter-pack.scss'],
})
export class AjouterPackComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLinear = false;
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  troisiemeFormGroup: FormGroup;
  displayedColumns: string[] = ['id', 'nomEmballage', 'typeEmballage', 'idProduit', 'nomProduit', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  displayedColumns2: string[] = ['id', 'nomEmballage', 'typeEmballage', 'poidsUnitaire', 'qte', 'unite', 'poidsTot', 'categorie']; //les colonne du tableau liste de colisage
  dataSourcePack = new MatTableDataSource<tableColisage>();
  dataSource = new MatTableDataSource<tableColisage>();
  form = new FormGroup({ nom_Emballage: new FormControl("") });
  packClicke = new Set<tableColisage>();
  packSelectionne: any = [];
  produits: any;
  poidsToltal: any;
  qte: any;
  poidsTotProduit: any;
  poidsU: any;

  constructor(public service: ColisageService, private formBuilder: FormBuilder, public _router: Router){
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      fragilite: [false],
      longueur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      largeur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      hauteur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      volume: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]

    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required]
    });
    this.troisiemeFormGroup = this.formBuilder.group({
      pack : this.formBuilder.array([])
    });
    this.dataSource.filterPredicate = (data, filter: string) => {
      return data.nomEmballage.toLowerCase().includes(filter)
     };
     this.refraichirListeColisage();
  }
  refraichirListeColisage() {
    this.service.listeColisage().subscribe((data) => {
      this.produits = data;
      this.dataSource.data = this.produits as tableColisage[];
    });
  }

  appliquerFiltre(valeurFiltre: any) {
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = valeurFiltre;
  }

  calculVolume() {
    if (this.premierFormGroup.get('hauteur').value !== "" && this.premierFormGroup.get('longueur').value !== "" && this.premierFormGroup.get('largeur').value !== "") {
      let volume = Number(this.premierFormGroup.get('hauteur').value) * Number(this.premierFormGroup.get('longueur').value) * Number(this.premierFormGroup.get('largeur').value);
      this.premierFormGroup.get('volume').setValue(volume);
    }
  }

  getIdProduit(produits: any){
    let ids = produits.idProduit.split("/");
    return ids
  }

  getQuantiteProduit(produits : any){
    let qte = produits.qte.split("/");
    return qte
  }

  getNomProduit(produits: any){
    let nomProduit = produits.nomProduit.split("/");

    return nomProduit;
  }

  choisirPack(p: any) {
    if (this.packClicke.has(p)) {
      this.packClicke.delete(p);
      this.packSelectionne.splice(this.packSelectionne.indexOf(p), 1);
      if (this.packSelectionne.length == 0){
        this.dataSource.data = this.produits;
      }
    } else {
      this.packClicke.add(p);
      this.packSelectionne.push(p);
      this.dataSource.data = this.dataSource.data.filter((x: any) => x.unite == this.packSelectionne[0].unite);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("aze");
  }

  pack() : FormArray {
    return this.troisiemeFormGroup.get("pack") as FormArray
  }

  nouveauPack(poids: any,unite: any): FormGroup {
    return this.formBuilder.group({
      qte: ['', Validators.required],
      unite: [unite, Validators.required],
      poids: [poids, Validators.required],
    })
  }

  ajouterPack(poids: any,unite: any) {
    this.pack().push(this.nouveauPack(poids,unite));
  }

  supprimerPack() {
    this.pack().clear();
  }

  deuxiemeSuivant() {
    this.packSelectionne.forEach((element: any) => {
      this.ajouterPack(element.poidsTotal,element.unite);
    });
    this.dataSourcePack.data = this.packSelectionne as tableColisage[];

  }
  
  deuxiemePrecedent(){
    this.supprimerPack();
  }

  calculerPoidsTotal(){
    this.poidsToltal = 0;
    this.qte = "";
    this.poidsU = "";
    for (let i = 0; i < this.packSelectionne.length; i++) {
      this.poidsToltal += Number(this.troisiemeFormGroup.get('pack').value[i].poids) * Number(this.troisiemeFormGroup.get('pack').value[i].qte);
      this.qte += this.troisiemeFormGroup.get('pack').value[i].qte +"/"
      this.poidsU += this.troisiemeFormGroup.get('pack').value[i].poids +"/"
    }
    this.qte = this.qte.slice(0, -1);
    this.poidsU = this.poidsU.slice(0, -1);
    return this.poidsToltal;
  }

  calculerPoidsPack(poids:any,qte:any){
    this.poidsTotProduit = Number(poids)*Number(qte);
    return (this.poidsTotProduit);
  }

  reinitialiserStepper() {
    this.packClicke.clear();
  }
  valider() {
    let id_Pack = ""
    let nom_Pack = ""
    this.packSelectionne.forEach((element : any) => {
      nom_Pack += element.nomEmballage + "/"
      id_Pack += element.id + " (liste colisage)/"
    });
    id_Pack = id_Pack.slice(0,-1);
    nom_Pack = nom_Pack.slice(0,-1);
    var formData: any = new FormData();
    formData.append("idProduit", id_Pack);
    formData.append("nomProduit", nom_Pack);
    formData.append("nomEmballage", this.premierFormGroup.get('nom').value);
    formData.append("typeEmballage", this.premierFormGroup.get('type').value);
    formData.append("qte", this.qte);
    formData.append("unite", this.troisiemeFormGroup.get('pack').value[0].unite);
    formData.append("categorie", this.packSelectionne[0].categorie);
    if (this.premierFormGroup.get('fragilite').value) {
      formData.append("fragile", "Oui");
    } else {
      formData.append("fragile", "Non");
    }
    formData.append("hauteur", Number(this.premierFormGroup.get('hauteur').value));
    formData.append("longueur", Number(this.premierFormGroup.get('longueur').value));
    formData.append("largeur", Number(this.premierFormGroup.get('largeur').value));
    formData.append("volume", Number(this.premierFormGroup.get('volume').value));
    formData.append("poids", this.poidsU);
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
 
}
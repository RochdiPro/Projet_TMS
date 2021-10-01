import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from '../../colisage.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';

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

export interface tableProduits { //interface pour recuperer les données du Fiche produit entant que data source pour l'afficher dans le tableau
  id_Produit: number;
  nom_Produit: String;
  marque: String;
  valeur_Unite: number;
  unite: String;
  type1: String;
  type2: String;

}

//*************************************************************************************************************
//***********************************************INTERFACE LISTE DE COLISAGE **********************************
//*************************************************************************************************************
@Component({
  selector: 'app-liste-colisage',
  templateUrl: './liste-colisage.component.html',
  styleUrls: ['./liste-colisage.component.scss']
})
export class ListeColisageComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //Declaration des variables
  form = new FormGroup({ nom_Produit: new FormControl(""), nom_Emballage: new FormControl(""), type_Emballage: new FormControl("") });
  listeColisage: any;
  displayedColumns: string[] = ['id', 'nomEmballage', 'typeEmballage', 'nomProduit', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  dataSource = new MatTableDataSource<tableColisage>();

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(public service: ColisageService) {
  }
  ngOnInit() {
    this.chargerListeColisage();
  }

  filtrerListeColisage() { //pour filtrer la liste colisage selon nom du produit, nom d'emballage et type D'emballage
    this.service.fltreListeproduit("nom_produit", this.form.get('nom_Produit').value, "nom_emballage", this.form.get('nom_Emballage').value, "type_emballage", this.form.get('type_Emballage').value).subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }

  chargerListeColisage() { //chargement du liste de colisage
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
    });
  }


  getQuantiteProduit(produits: any) { //recuperer la quantité de chaque produit
    let qte = produits.qte.split("/");
    return qte
  }

  getNomProduit(produits: any) { //recuperer le nom de chaque produit
    let nomProduit = produits.nomProduit.split("/");

    return nomProduit;
  }

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
  constructor() {

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

  //declaration des variables
  isLinear = false;
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  troisiemeFormGroup: FormGroup;
  formFiltreProduit = new FormGroup({ nom_Produit: new FormControl("") });
  colonneAfficheDuTableFicheProduit: string[] = ['id_Produit', 'nom_Produit', 'marque', 'valeur_Unite', 'unite', 'typeProduit', 'sousType']; //les colonne du tableau liste de produits
  dataSourceProduits = new MatTableDataSource<tableProduits>();
  dataSourceProduit = new MatTableDataSource<tableProduits>();
  produitClique = new Set<tableProduits>();
  listeProduits: any;
  produitsAffiche: any = [];
  produitSelectionne: any = [];
  poidsToltal: number = 0;
  poidsTotUnProduit: number;
  qte: any;
  troisiemeStepEstRemplit = false;
  produitExiste = false;

  ngAfterViewInit() {
    this.dataSourceProduits.paginator = this.paginator;
    this.dataSourceProduits.sort = this.sort;
    this.dataSourceProduit.paginator = this.paginator;
    this.dataSourceProduit.sort = this.sort;

  }

  constructor(public service: ColisageService, private formBuilder: FormBuilder, public _router: Router) {
  }

  ngOnInit() {
    this.chargerFicheProduit();
    this.creerFormGroups();
    this.dataSourceProduits.filterPredicate = (data, filter: string) => { //forcer le filtre a chercher que dans la colonne nom_produit
      return data.nom_Produit.toLowerCase().includes(filter)
    };
  }

  async chargerFicheProduit() { //charger la liste de fiche produits
    this.listeProduits = await this.service.listeProduits().toPromise();
    let listeColisage = await this.chargerListeColisage();
    this.produitsAffiche = [];
    this.listeProduits.forEach((element: any) => { //verifier si un produit existe deja dans la liste colisage
      listeColisage.forEach((prodColis: any) => {
        let idP = prodColis.idProduit.split();
        let id = "FP-" + element.id_Produit;
        let idProduitExiste = id === idP[0] || idP.length !== 1;
        if (idProduitExiste) {
          this.produitExiste = true;
        }
      });
      if(!this.produitExiste){ //si le produit du fiche produit n'existe pas dans la liste colisage donc on l'ajoute à la liste a afficher dans le tableau
        this.produitsAffiche.push(element);
      }
      this.produitExiste = false;
      
    });

    this.dataSourceProduits.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduit.data = this.produitsAffiche as tableProduits[];
  }

  chargerListeColisage(): any {
    return this.service.listeColisage().toPromise()
  }

  creerFormGroups() { //creation des formsGroups necessaires
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      poidsEmballage: ['', Validators.required],
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
      qte: ['', Validators.required],
      unite: ['', Validators.required],
      poids: ['', Validators.required],
    });
  }

  appliquerFiltre(valeurFiltre: any) { //faire le filtrage selon nom produit
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourceProduits.filter = valeurFiltre;
  }


  choisirProduit(prod: any) {
    if (this.produitClique.has(prod)) { //si On clique sur un produit deja selectionnée on le deselectionne
      this.produitClique.clear();
      this.produitSelectionne = [];
    } else {
      if (this.produitSelectionne.length !== 0) { //si on clique sur un autre produit on deselectionne l'ancien
        this.produitClique.clear();
        this.produitSelectionne = [];
      }
      this.produitClique.add(prod); //on selectionne le nouveau produit cliqué
      this.produitSelectionne.push(prod);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("validé");
  }

  deuxiemeSuivant() { //pour le deuxieme bouton suivant
    this.dataSourceProduit.data = this.produitSelectionne as tableProduits[];
    this.troisiemeFormGroup.get('unite').setValue(this.produitSelectionne[0].unite)

  }
  troisiemeSuivant() { //pour le troisieme bouton suivant
    this.troisiemeStepEstRemplit = true;
  }
  reinitialiserStepper() { //reinitialisation du stepper
    this.produitClique.clear();
    this.troisiemeStepEstRemplit = false;
  }

  async valider() {  //bouton valider
    var formData: any = new FormData();
    formData.append("idProduit", "FP-" + this.produitSelectionne[0].id_Produit);
    formData.append("nomProduit", this.produitSelectionne[0].nom_Produit);
    formData.append("nomEmballage", this.premierFormGroup.get('nom').value);
    formData.append("typeEmballage", "Standard");
    formData.append("qte", this.troisiemeFormGroup.get('qte').value);
    formData.append("unite", this.troisiemeFormGroup.get('unite').value);
    formData.append("categorie", this.produitSelectionne[0].type2);
    if (this.premierFormGroup.get('fragilite').value) { //verifier la fragilité avant l'enrigistrement
      formData.append("fragile", "Oui");
    } else {
      formData.append("fragile", "Non");
    }
    formData.append("hauteur", Number(this.premierFormGroup.get('hauteur').value));
    formData.append("longueur", Number(this.premierFormGroup.get('longueur').value));
    formData.append("largeur", Number(this.premierFormGroup.get('largeur').value));
    formData.append("volume", Number(this.premierFormGroup.get('volume').value));
    formData.append("poids_unitaire", this.poidsTotUnProduit);
    formData.append("poids_total_net", this.poidsTotUnProduit);
    formData.append("poids_emballage_total", this.poidsToltal);
    this.service.creerProduitEmballe(formData);
    await this._router.navigate(['/Menu/Colisage/Liste_Colisage'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }

  calculVolume() { //calculer le volume de l'emballage
    if (this.premierFormGroup.get('hauteur').value !== "" && this.premierFormGroup.get('longueur').value !== "" && this.premierFormGroup.get('largeur').value !== "") {
      let volume = Number(this.premierFormGroup.get('hauteur').value) * Number(this.premierFormGroup.get('longueur').value) * Number(this.premierFormGroup.get('largeur').value) * 0.000001;
      this.premierFormGroup.get('volume').setValue(volume);
    }
  }

  calculerPoidsProduitNet(poids: any, qte: any) { //calculer poids produits total net
    this.poidsTotUnProduit = Number(poids) * Number(qte);
    this.calculerPoidsTotal(this.poidsTotUnProduit);
    return (this.poidsTotUnProduit);
  }

  calculerPoidsTotal(poidsNet: any) { //calculer le poids total
    this.poidsToltal = poidsNet + Number(this.premierFormGroup.get('poidsEmballage').value);
  }

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

  //declaration des variables
  isLinear = false;
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  troisiemeFormGroup: FormGroup;
  colonneAfficheTableauLC1: string[] = ['id', 'nomEmballage', 'typeEmballage', 'nomProduit', 'qte', 'unite', 'categorie']; //les colonne du tableau liste de colisage
  colonneAfficheTableauLC2: string[] = ['id', 'nomEmballage', 'typeEmballage', 'poidsUnitaireNet', 'qte', 'unite', 'poidsTotNet', 'poidsTot', 'categorie']; //les colonne du tableau liste de colisage
  dataSourcePackSelectionne = new MatTableDataSource<tableColisage>();
  dataSourceListeColisage = new MatTableDataSource<tableColisage>();
  formFiltreNomEmballage = new FormGroup({ nom_Emballage: new FormControl("") });
  packClique = new Set<tableColisage>();
  packSelectionne: any = [];
  listePacks: any;
  poidsToltalNet: any;
  poidsToltalBrut: any;
  qte: any;
  poidsTotUnProduit: any;
  poidsUnitaireNet: any;
  poidsTotNetProduit: any;

  constructor(public service: ColisageService, private formBuilder: FormBuilder, public _router: Router) {

  }

  ngAfterViewInit() {
    this.dataSourceListeColisage.paginator = this.paginator;
    this.dataSourceListeColisage.sort = this.sort;
  }

  ngOnInit() {
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      fragilite: [false],
      longueur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      largeur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      hauteur: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      volume: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      poidsEmballage: ['', Validators.required]

    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required]
    });
    this.troisiemeFormGroup = this.formBuilder.group({
      pack: this.formBuilder.array([])
    });
    this.dataSourceListeColisage.filterPredicate = (data, filter: string) => {
      return data.nomEmballage.toLowerCase().includes(filter)
    };
    this.chargerListeColisage();
  }
  chargerListeColisage() { //charger la liste de colisage
    this.service.listeColisage().subscribe((data) => {
      this.listePacks = data;
      this.dataSourceListeColisage.data = this.listePacks as tableColisage[];
    });
  }

  appliquerFiltre(valeurFiltre: any) { //filtrer par nom Emballage
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourceListeColisage.filter = valeurFiltre;
  }

  calculVolume() { //calculer le volume de l'emballage
    let toutLesChampsDeDimensionsSontRemplit = this.premierFormGroup.get('hauteur').value !== "" && this.premierFormGroup.get('longueur').value !== "" && this.premierFormGroup.get('largeur').value !== "";
    if (toutLesChampsDeDimensionsSontRemplit) {
      let volume = Number(this.premierFormGroup.get('hauteur').value) * Number(this.premierFormGroup.get('longueur').value) * Number(this.premierFormGroup.get('largeur').value); //calcul
      this.premierFormGroup.get('volume').setValue(volume); //changer la valeur de l'input par le volume calculé
    }
  }

  getIdProduit(produits: any) {
    let ids = produits.idProduit.split("/");
    return ids
  }

  getQuantiteProduit(produits: any) { //pour avoir les quantitées de chaque produit dans la liste de colisage
    let qte = produits.qte.split("/");
    return qte
  }

  getNomProduit(produits: any) { //pour avoir le nom de chaque produit dans la liste colisage
    let nomProduit = produits.nomProduit.split("/");

    return nomProduit;
  }

  choisirPack(p: any) { //selectionner les packs désirés
    if (this.packClique.has(p)) { //si on clique sur un pack déja selectionné on le désélectionne
      this.packClique.delete(p);
      this.packSelectionne.splice(this.packSelectionne.indexOf(p), 1);
    } else {  //sinon on selectionne le pack
      this.packClique.add(p);
      this.packSelectionne.push(p);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("valide"); //pour valider le deuxieme matStep
  }

  pack(): FormArray { //charger le FormArray 'pack' pour ajouter a lui les formControls d'une facon dynamique
    return this.troisiemeFormGroup.get("pack") as FormArray
  }

  nouveauPack( unite: any): FormGroup { //creation des formControls qte et unite pour chaque pack selectionné
    return this.formBuilder.group({
      qte: ['', Validators.required],
      unite: [unite, Validators.required],
    })
  }

  ajouterPack( unite: any) { //lors de l'ajout du pack on ajoute les formControls crées a FormArray
    this.pack().push(this.nouveauPack( unite));
  }

  supprimerPack() { //vider le formArray
    this.pack().clear();
  }

  deuxiemeSuivant() { //pour chaque produit séléctionné on ajoute un formControl
    this.packSelectionne.forEach((element: any) => {
      this.ajouterPack( element.typeEmballage);
    });
    this.dataSourcePackSelectionne.data = this.packSelectionne as tableColisage[];

  }

  deuxiemePrecedent() { 
    this.supprimerPack();
  }

  calculerPoidsTotalNet() {
    this.poidsToltalNet = 0;
    this.qte = "";
    this.poidsUnitaireNet = "";
    for (let i = 0; i < this.packSelectionne.length; i++) {
      this.poidsToltalNet += Number(this.packSelectionne[i].poids_total_net) * Number(this.troisiemeFormGroup.get('pack').value[i].qte);
      this.qte += this.troisiemeFormGroup.get('pack').value[i].qte + "/" //enregistrer la qte des produits dans une chaine de caractéres
      this.poidsUnitaireNet += this.packSelectionne[i].poids_total_net + "/" //enregistrer le poids unitaire des produits dans une chaine de caractéres
    }
    this.qte = this.qte.slice(0, -1); //enlever le dernier "/"
    this.poidsUnitaireNet = this.poidsUnitaireNet.slice(0, -1); //enlever le dernier "/"
    return this.poidsToltalNet;
  }

  calculerPoidsTotalBrut() { //poids des produit avec leur amballage et sans le nouveau emballage
    this.poidsToltalBrut = 0;
    for (let i = 0; i < this.packSelectionne.length; i++) {
      this.poidsToltalBrut += Number(this.packSelectionne[i].poids_emballage_total) * Number(this.troisiemeFormGroup.get('pack').value[i].qte);
    }
    this.poidsToltalBrut = this.poidsToltalBrut + Number(this.premierFormGroup.get('poidsEmballage').value);
    console.log(this.poidsToltalBrut);
    return this.poidsToltalBrut;
  }

  calculerPoidsPackNet(poids: any, qte: any) { //poids total net de chaque pack selectionné
    this.poidsTotNetProduit = Number(poids) * Number(qte);
    return (this.poidsTotNetProduit);
  }
  calculerPoidsPackBrut(poids: any, qte: any) { //poids total brut de chaque pack selectionné
    this.poidsTotUnProduit = Number(poids) * Number(qte);
    console.log(this.premierFormGroup.get('nom').value);
    return (this.poidsTotUnProduit);
    
  }

  reinitialiserStepper() {
    this.packClique.clear();
  }

  async valider() { //Bouton valider 
    let id_Pack = "LC-"
    let nom_Pack = ""
    this.packSelectionne.forEach((element: any) => {
      nom_Pack += element.nomEmballage + "/"
      id_Pack += element.id + "/"
    });
    id_Pack = id_Pack.slice(0, -1);
    nom_Pack = nom_Pack.slice(0, -1);
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
    formData.append("poids_unitaire", this.poidsToltalNet);
    formData.append("poids_total_net", this.poidsToltalNet);
    formData.append("poids_emballage_total", this.poidsToltalBrut);
    this.service.creerProduitEmballe(formData);
    await this._router.navigate(['/Menu/Colisage/Liste_Colisage'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }

}
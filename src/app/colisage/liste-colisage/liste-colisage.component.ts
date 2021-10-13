import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  code_Barre: String;

}

//*************************************************************************************************************
//***********************************************INTERFACE LISTE DE COLISAGE **********************************
//*************************************************************************************************************
@Component({
  selector: 'app-liste-colisage',
  templateUrl: './liste-colisage.component.html',
  styleUrls: ['./liste-colisage.component.scss']
})
export class ListeColisageComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }

}
//*************************************************************************************************************
//***********************************************INTERFACE LISTER COLISAGE **********************************
//*************************************************************************************************************
@Component({
  selector: 'app-lister-colisage',
  templateUrl: './lister-colisage.html',
  styleUrls: ['./lister-colisage.scss']
})
export class ListerColisageComponent implements OnInit {
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
    if (this.form.get('type_Emballage').value === undefined) this.form.get('type_Emballage').setValue("");
    this.service.fltreListeproduit("nom_produit", this.form.get('nom_Produit').value, "nom_emballage", this.form.get('nom_Emballage').value, "type_emballage", this.form.get('type_Emballage').value).subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
      this.dataSource.data = this.dataSource.data.sort((a, b) => a.id > b.id ? -1 : 1);
    });
  }

  chargerListeColisage() { //chargement du liste de colisage
    this.service.listeColisage().subscribe((data) => {
      this.dataSource.data = data as tableColisage[];
      this.dataSource.data = this.dataSource.data.sort((a, b) => a.id > b.id ? -1 : 1);
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
  formCodeBarre = new FormGroup({ code_Barre: new FormControl("") });
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
  breakpoint: number;
  barcode = '';
  interval: any;
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
    this.breakpoint = (window.innerWidth <= 760) ? 2 : 6;
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
      if (!this.produitExiste) { //si le produit du fiche produit n'existe pas dans la liste colisage donc on l'ajoute à la liste a afficher dans le tableau
        this.produitsAffiche.push(element);
      }
      this.produitExiste = false;

    });

    this.dataSourceProduits.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduits.data = this.dataSourceProduits.data.sort((a, b) => a.id_Produit > b.id_Produit ? -1 : 1);
    this.dataSourceProduit.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduit.data = this.dataSourceProduit.data.sort((a, b) => a.id_Produit > b.id_Produit ? -1 : 1);
  }

  chargerListeColisage(): any {
    return this.service.listeColisage().toPromise()
  }

  creerFormGroups() { //creation des formsGroups necessaires
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      poidsEmballage: ['', Validators.required],
      type: ['', Validators.required],
      codeBarre: ['', Validators.required],
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

  scannerCodeBarre(codeBarreScanne: any) {
    if (this.interval)
      clearInterval(this.interval);
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode)
        this.gestionCodeBarre(this.barcode);
      this.barcode = '';
      return;
    }
    if (codeBarreScanne.key != 'Shift')
      this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => this.barcode = '', 20);
  }

  gestionCodeBarre(codeBarre: any) {
    var prodSelect: any;
    prodSelect = this.dataSourceProduits.data.filter((x: any) => x.code_Barre == codeBarre);
    this.choisirProduit(prodSelect[0]);
  }


  choisirProduit(prod: any) {
    if (this.produitClique.has(prod)) { //si On clique sur un produit deja selectionnée on le deselectionne
      this.formCodeBarre.get('code_Barre').setValue('');
      this.produitClique.clear();
      this.produitSelectionne = [];
    } else {
      if (this.produitSelectionne.length !== 0) { //si on clique sur un autre produit on deselectionne l'ancien
        this.formCodeBarre.get('code_Barre').setValue('');
        this.produitClique.clear();
        this.produitSelectionne = [];
      }
      if (prod) {
        this.formCodeBarre.get('code_Barre').setValue(prod.code_Barre)
        this.produitClique.add(prod); //on selectionne le nouveau produit cliqué
        this.produitSelectionne.push(prod)
      };
    }

    this.deuxiemeFormGroup.get('validateur').setValue("validé");
  }
  premierSuivant() {
    this.dataSourceProduit.data = this.produitSelectionne as tableProduits[];
    this.premierFormGroup.get('nom').setValue(this.produitSelectionne[0].nom_Produit)
    this.premierFormGroup.get('codeBarre').setValue(this.produitSelectionne[0].code_Barre)
  }
  premierPrecedent() {
    this.dataSourceProduits.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduits.data = this.dataSourceProduits.data.sort((a, b) => a.id_Produit > b.id_Produit ? -1 : 1);
  }
  deuxiemeSuivant() { //pour le deuxieme bouton suivant
    this.troisiemeFormGroup.get('unite').setValue(this.produitSelectionne[0].unite)
    this.troisiemeFormGroup.get('qte').setValue(this.produitSelectionne[0].valeur_Unite)

  }
  troisiemeSuivant() { //pour le troisieme bouton suivant
    this.troisiemeStepEstRemplit = true;
  }
  reinitialiserStepper() { //reinitialisation du stepper
    this.produitClique.clear();
    this.troisiemeStepEstRemplit = false;
    this.formCodeBarre.get('code_Barre').setValue('');
    this.formFiltreProduit.get('nom_Produit').setValue('');
    this.dataSourceProduits.filter = '';

  }

  async valider() {  //bouton valider
    var formData: any = new FormData();
    formData.append("idProduit", this.produitSelectionne[0].id_Produit);
    formData.append("nomProduit", this.produitSelectionne[0].nom_Produit);
    formData.append("nomEmballage", this.premierFormGroup.get('nom').value);
    formData.append("typeEmballage", this.premierFormGroup.get("type").value);
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
    formData.append("code_barre", this.premierFormGroup.get('codeBarre').value);
    await this.service.creerProduitEmballe(formData).toPromise();
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
  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 2 : 6;
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

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  //declaration des variables
  isLinear = false;
  premierFormGroup: FormGroup;
  deuxiemeFormGroup: FormGroup;
  troisiemeFormGroup: FormGroup;
  formCodeBarre = new FormGroup({ code_Barre: new FormControl("") });
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
  breakpoint: number;
  listeSupports: any;
  interval: any;
  barcode = '';
  support: any;
  supportSelectionne: any;
  longueur: any;
  largeur: any;
  hauteur: any;
  volume: any;
  poidsEmballage: any;
  typeEmballage: any;

  constructor(public service: ColisageService, private formBuilder: FormBuilder, public _router: Router) {

  }

  ngAfterViewInit() {
    this.dataSourceListeColisage.paginator = this.paginator.toArray()[0];;
    this.dataSourceListeColisage.sort = this.sort.toArray()[0];
    this.dataSourcePackSelectionne.paginator = this.paginator.toArray()[1];;
    this.dataSourcePackSelectionne.sort = this.sort.toArray()[1];
  }

  ngOnInit() {
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      nomEmballage: ['', Validators.required],
      fragilite: [false],
      codeBarre: ['', Validators.required],
      codeBarrePack: ['', Validators.required],
      typeSelectionEmballage: ['auto', Validators.required],
      valider: ['', Validators.required],

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
    this.breakpoint = (window.innerWidth <= 760) ? 2 : 6;
    this.testTypeSelection()
  }
  chargerListeColisage() { //charger la liste de colisage
    this.service.listeColisage().subscribe((data) => {
      this.listePacks = data;
      this.dataSourceListeColisage.data = this.listePacks as tableColisage[];
    });
  }


  async getListeSupportParType() {
    this.premierFormGroup.get("codeBarre").setValue("");
    this.listeSupports = await this.service.filtrerSupports('type_support', this.premierFormGroup.get('type').value).toPromise();
  }

  scannerCodeBarreSupport(codeBarreScanne: any) {
    if (this.interval)
      clearInterval(this.interval);
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode)
        this.gestionCodeBarreSupport(this.barcode);
      this.barcode = '';
      return;
    }
    if (codeBarreScanne.key != 'Shift')
      this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => this.barcode = '', 20);
  }

  async gestionCodeBarreSupport(codeBarre: any) {
    this.support = await this.service.filtrerSupports('code_barre', codeBarre).toPromise();
    if (this.support.length === 0) {
      this.support = undefined;
      Swal.fire({
        title: 'Support inexistant!',
        text: "Ajoutez le dans la liste des support avant de l'utiliser.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this._router.navigate(['/Menu/Menu_Colisage/Supports/Ajouter_Support']);
        }
      })
    } else {
      this.longueur = this.support[0].longueur;
      this.largeur = this.support[0].largeur;
      this.hauteur = this.support[0].hauteur;
      this.volume = this.support[0].volume;
      this.poidsEmballage = this.support[0].poids_emballage;
      this.typeEmballage = this.support[0].type_support;

      this.premierFormGroup.get('valider').setValue('validé');
    }

  }

  selectionnerSupport() {
    this.longueur = this.supportSelectionne.longueur;
    this.largeur = this.supportSelectionne.largeur;
    this.hauteur = this.supportSelectionne.hauteur;
    this.volume = this.supportSelectionne.volume;
    this.poidsEmballage = this.supportSelectionne.poids_emballage;
    this.typeEmballage = this.supportSelectionne.type_support;
    this.premierFormGroup.get('valider').setValue('validé');

  }

  verifierValiditeSupport(){
    if(this.premierFormGroup.get('valider').value === ''){
      Swal.fire({
        icon: 'error',
        text: 'Prière de vérifier que le support est valide!',
      })
    }
  }

  appliquerFiltre(valeurFiltre: any) { //filtrer par nom Emballage
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourceListeColisage.filter = valeurFiltre;
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

  scannerCodeBarrePack(codeBarreScanne: any) {
    if (this.interval)
      clearInterval(this.interval);
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode)
        this.gestionCodeBarrePack(this.barcode);
      this.barcode = '';
      return;
    }
    if (codeBarreScanne.key != 'Shift')
      this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => this.barcode = '', 20);
  }

  gestionCodeBarrePack(codeBarre: any) {
    var prodSelect: any;
    prodSelect = this.dataSourceListeColisage.data.filter((x: any) => x.code_barre == codeBarre);
    console.log(prodSelect);
    if(prodSelect.length === 0) {
      this.formCodeBarre.get('code_Barre').setValue('');
    } else {
      this.formCodeBarre.get('code_Barre').setValue('');
      this.formCodeBarre.get('code_Barre').setValue(codeBarre);
    }
    this.choisirPack(prodSelect[0]);
  }

  choisirPack(p: any) { //selectionner les packs désirés
    if (this.packClique.has(p)) { //si on clique sur un pack déja selectionné on le désélectionne
      this.packClique.delete(p);
      this.packSelectionne.splice(this.packSelectionne.indexOf(p), 1);
      this.formCodeBarre.get('code_Barre').setValue('');
    } else {  //sinon on selectionne le pack
      this.packClique.add(p);
      this.packSelectionne.push(p);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("valide"); //pour valider le deuxieme matStep
  }

  pack(): FormArray { //charger le FormArray 'pack' pour ajouter a lui les formControls d'une facon dynamique
    return this.troisiemeFormGroup.get("pack") as FormArray
  }

  nouveauPack(unite: any): FormGroup { //creation des formControls qte et unite pour chaque pack selectionné
    return this.formBuilder.group({
      qte: ['', Validators.required],
      unite: [unite, Validators.required],
    })
  }

  ajouterPack(unite: any) { //lors de l'ajout du pack on ajoute les formControls crées a FormArray
    this.pack().push(this.nouveauPack(unite));
  }

  supprimerPack() { //vider le formArray
    this.pack().clear();
  }

  deuxiemeSuivant() { //pour chaque produit séléctionné on ajoute un formControl
    this.packSelectionne.forEach((element: any) => {
      this.ajouterPack(element.typeEmballage);
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
    this.poidsToltalBrut = this.poidsToltalBrut + Number(this.poidsEmballage);
    return this.poidsToltalBrut;
  }

  calculerPoidsPackNet(poids: any, qte: any) { //poids total net de chaque pack selectionné
    this.poidsTotNetProduit = Number(poids) * Number(qte);
    return (this.poidsTotNetProduit);
  }
  calculerPoidsPackBrut(poids: any, qte: any) { //poids total brut de chaque pack selectionné
    this.poidsTotUnProduit = Number(poids) * Number(qte);
    return (this.poidsTotUnProduit);

  }

  reinitialiserStepper() { //reinitialiser le stepper
    this.packClique.clear();
  }

  testTypeSelection() {
    this.premierFormGroup.get('valider').setValue('');
    if (this.premierFormGroup.get("typeSelectionEmballage").value === "manuel") {
      this.premierFormGroup.get("codeBarre").setValue("");
      this.support = undefined;
      this.premierFormGroup.get("codeBarre").disable();
      this.premierFormGroup.get("codeBarre").setValidators([]);
      this.premierFormGroup.get("codeBarre").updateValueAndValidity();
      this.premierFormGroup.get("type").enable();
      this.premierFormGroup.get("type").setValidators([Validators.required]);
      this.premierFormGroup.get("type").updateValueAndValidity();
      this.premierFormGroup.get("nomEmballage").enable();
      this.premierFormGroup.get("nomEmballage").setValidators([Validators.required]);
      this.premierFormGroup.get("nomEmballage").updateValueAndValidity();
    } else {
      this.supportSelectionne = undefined;
      this.premierFormGroup.get("codeBarre").enable();
      this.premierFormGroup.get("codeBarre").setValidators([Validators.required]);
      this.premierFormGroup.get("codeBarre").updateValueAndValidity();
      this.premierFormGroup.get("type").updateValueAndValidity();
      this.premierFormGroup.get("type").setValidators([]);
      this.premierFormGroup.get("type").disable();
      this.premierFormGroup.get("nomEmballage").disable();
      this.premierFormGroup.get("nomEmballage").setValidators([]);
      this.premierFormGroup.get("nomEmballage").updateValueAndValidity();
    }
  }

  async valider() { //Bouton valider 
    let idProduit = ""
    let nom_Pack = ""
    this.packSelectionne.forEach((element: any) => {
      nom_Pack += element.nomEmballage + "/"
      idProduit += element.idProduit + "/"
    });
    idProduit = idProduit.slice(0, -1);
    nom_Pack = nom_Pack.slice(0, -1);
    var formData: any = new FormData();
    formData.append("idProduit", idProduit);
    formData.append("nomProduit", nom_Pack);
    formData.append("nomEmballage", this.premierFormGroup.get('nom').value);
    formData.append("typeEmballage", this.typeEmballage);
    formData.append("qte", this.qte);
    formData.append("unite", this.troisiemeFormGroup.get('pack').value[0].unite);
    formData.append("categorie", this.packSelectionne[0].categorie);
    if (this.premierFormGroup.get('fragilite').value) {
      formData.append("fragile", "Oui");
    } else {
      formData.append("fragile", "Non");
    }
    formData.append("hauteur", Number(this.hauteur));
    formData.append("longueur", Number(this.longueur));
    formData.append("largeur", Number(this.largeur));
    formData.append("volume", Number(this.volume));
    formData.append("poids_unitaire", this.poidsToltalNet);
    formData.append("poids_total_net", this.poidsToltalNet);
    formData.append("poids_emballage_total", this.poidsToltalBrut);
    formData.append("code_barre", this.premierFormGroup.get("codeBarrePack").value);
    await this.service.creerProduitEmballe(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Packaging/Liste_Pack'])
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500
    })
  }
  onResize(event: any) { //lors du changement de l'ecran on modifie le breakpoint du mat-grid pour avoir un nouveau layout
    this.breakpoint = (event.target.innerWidth <= 400) ? 2 : 6;
  }

}
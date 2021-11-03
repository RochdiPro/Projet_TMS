import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from '../../../colisage.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
@Component({
  selector: 'app-ajouter-pack',
  templateUrl: './ajouter-pack.component.html',
  styleUrls: ['./ajouter-pack.component.scss']
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
    this.service.listeEmballage().subscribe((data) => {
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
      this.premierFormGroup.get("codeBarre").setValue("");
      this.premierFormGroup.get("codeBarre").setValue(this.barcode);
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

  verifierValiditeSupport() {
    if (this.premierFormGroup.get('valider').value === '') {
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
      this.formCodeBarre.get('code_Barre').setValue('');
      this.formCodeBarre.get('code_Barre').setValue(this.barcode);
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
    this.choisirPackScanne(prodSelect[0]);
  }
  choisirPackScanne(p: any){
    if (this.packClique.has(p)) { //si on clique sur un pack déja selectionné on le désélectionne
    } else {  //sinon on selectionne le pack
      this.packClique.add(p);
      this.packSelectionne.push(p);
    }

    this.deuxiemeFormGroup.get('validateur').setValue("valide"); //pour valider le deuxieme matStep
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
      let qteTT = Number(this.packSelectionne[i].qte) * Number(this.troisiemeFormGroup.get('pack').value[i].qte)
      this.qte += qteTT + "/" //enregistrer la qte des produits dans une chaine de caractéres
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
    let nomPack = ""
    let idComposant = ""
    this.packSelectionne.forEach((element: any) => {
      nomPack += element.nomEmballage + "/";
      idProduit += element.idProduit + "/";
      idComposant += element.id + "/";

    });
    idProduit = idProduit.slice(0, -1);
    nomPack = nomPack.slice(0, -1);
    idComposant = idComposant.slice(0, -1);
    var formData: any = new FormData();
    formData.append("idProduit", idProduit);
    formData.append("idComposant", idComposant);
    formData.append("nomProduit", nomPack);
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
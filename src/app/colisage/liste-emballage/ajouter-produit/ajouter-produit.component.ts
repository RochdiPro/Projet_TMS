import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EmballageService } from '../services/emballage.service';

@Component({
  selector: 'app-ajouter-produit',
  templateUrl: './ajouter-produit.component.html',
  styleUrls: ['./ajouter-produit.component.scss'],
})
export class AjouterProduitComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //declaration des variables
  isLinear = true; //pour l'activation et desactivation le passage entre les steps sans validation
  premierFormGroup: FormGroup; //formGroup du premier step
  deuxiemeFormGroup: FormGroup; //formGroup du deuxieme step
  troisiemeFormGroup: FormGroup; //formGroup du troisieme step
  formFiltreProduit = new FormGroup({ nom_Produit: new FormControl('') });
  formCodeBarre = new FormGroup({ code_Barre: new FormControl('') });
  colonneAfficheDuTableFicheProduit: string[] = [
    'id_Produit',
    'nom_Produit',
    'marque',
    'valeur_Unite',
    'unite',
    'typeProduit',
    'sousType',
  ]; //les colonne du tableau liste de produits
  dataSourceProduits = new MatTableDataSource<tableProduits>(); //dataSource pour le table des liste des produits
  dataSourceProduit = new MatTableDataSource<tableProduits>(); //dataSource pour afficher le produit selectionné
  produitClique = new Set<tableProduits>(); //pour avoir le produit clique
  listeProduits: any;
  produitsAffiche: any = []; //liste des produits a afficher dans le tableau
  produitSelectionne: any = []; //liste des produits selectionne
  poidsToltal: number = 0;
  poidsTotUnProduit: number;
  qte: any;
  troisiemeStepEstRemplit = false;
  produitExiste = false;
  breakpoint: number;
  barcode = '';
  interval: any;

  modeManuel: boolean;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  ngAfterViewInit() {
    this.dataSourceProduits.paginator = this.paginator;
    this.dataSourceProduits.sort = this.sort;
    this.dataSourceProduit.paginator = this.paginator;
    this.dataSourceProduit.sort = this.sort;
  }

  constructor(
    public service: EmballageService,
    private formBuilder: FormBuilder,
    public _router: Router
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);

    this.modeManuel = service.modeManuel;
  }

  ngOnInit() {
    this.chargerFicheProduit();
    this.creerFormGroups();
    this.dataSourceProduits.filterPredicate = (data, filter: string) => {
      //forcer le filtre a chercher que dans la colonne nom_produit
      return data.nom_Produit.toLowerCase().includes(filter);
    };
    this.breakpoint = window.innerWidth <= 760 ? 2 : 6;
  }

  async chargerFicheProduit() {
    if (this.modeManuel) {
      this.listeProduits = await this.service.produitsManuel().toPromise();
    } else {
      this.listeProduits = await this.service.listeProduits().toPromise();
    }
    //charger la liste de fiche produits
    let listeEmballage = await this.getListeEmballage();
    this.produitsAffiche = [];
    this.listeProduits.forEach((element: any) => {
      //verifier si un produit existe deja dans la liste colisage
      listeEmballage.forEach((prodEmballe: any) => {
        let idProduitEmballe = prodEmballe.idProduit.split('/');
        let idProduit = element.id_Produit;
        let idProduitExiste =
          idProduit === Number(idProduitEmballe[0]) &&
          idProduitEmballe.length === 1;
        if (idProduitExiste) {
          this.produitExiste = true;
        }
      });
      if (!this.produitExiste) {
        //si le produit du fiche produit n'existe pas dans la liste colisage donc on l'ajoute à la liste a afficher dans le tableau
        this.produitsAffiche.push(element);
      }
      this.produitExiste = false;
    });

    this.dataSourceProduits.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduits.data = this.dataSourceProduits.data.sort((a, b) =>
      a.id_Produit > b.id_Produit ? -1 : 1
    );
    this.dataSourceProduit.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduit.data = this.dataSourceProduit.data.sort((a, b) =>
      a.id_Produit > b.id_Produit ? -1 : 1
    );
  }

  getListeEmballage(): any {
    return this.service.listeEmballage().toPromise();
  }

  creerFormGroups() {
    //creation des formsGroups necessaires
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      poidsEmballage: ['', Validators.required],
      type: ['', Validators.required],
      codeBarre: ['', Validators.required],
      fragilite: [false],
      longueur: ['', Validators.required],
      largeur: ['', Validators.required],
      hauteur: ['', Validators.required],
      volume: ['', Validators.required],
    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required],
    });
    this.troisiemeFormGroup = this.formBuilder.group({
      qte: ['', Validators.required],
      unite: ['', Validators.required],
      poids: ['', Validators.required],
    });
  }

  appliquerFiltre(valeurFiltre: any) {
    //faire le filtrage selon nom produit
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourceProduits.filter = valeurFiltre;
  }

  scannerCodeBarre(codeBarreScanne: any) {
    if (this.interval) clearInterval(this.interval);
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode) this.gestionCodeBarre(this.barcode);
      this.formCodeBarre.get('code_Barre').setValue('');
      this.formCodeBarre.get('code_Barre').setValue(this.barcode);
      this.barcode = '';
      return;
    }
    if (codeBarreScanne.key != 'Shift') this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => (this.barcode = ''), 20);
  }

  gestionCodeBarre(codeBarre: any) {
    var prodSelect: any;
    prodSelect = this.dataSourceProduits.data.filter(
      (x: any) => x.code_Barre == codeBarre
    );
    this.choisirProduitScanne(prodSelect[0]);
  }
  choisirProduitScanne(prod: any) {
    if (this.produitClique.has(prod)) {
      //si On clique sur un produit deja selectionnée on supprime le contenu de input pour le remplir ensuit
    } else {
      if (this.produitSelectionne.length !== 0) {
        //si on clique sur un autre produit on deselectionne l'ancien
        this.produitClique.clear();
        this.produitSelectionne = [];
      }
      if (prod) {
        this.produitClique.add(prod); //on selectionne le nouveau produit cliqué
        this.produitSelectionne.push(prod);
      }
    }

    this.deuxiemeFormGroup.get('validateur').setValue('validé');
  }

  choisirProduit(prod: any) {
    if (this.produitClique.has(prod)) {
      //si On clique sur un produit deja selectionnée on le deselectionne
      this.formCodeBarre.get('code_Barre').setValue('');
      this.produitClique.clear();
      this.produitSelectionne = [];
    } else {
      if (this.produitSelectionne.length !== 0) {
        //si on clique sur un autre produit on deselectionne l'ancien
        this.formCodeBarre.get('code_Barre').setValue('');
        this.produitClique.clear();
        this.produitSelectionne = [];
      }
      if (prod) {
        this.formCodeBarre.get('code_Barre').setValue(prod.code_Barre);
        this.produitClique.add(prod); //on selectionne le nouveau produit cliqué
        this.produitSelectionne.push(prod);
      }
    }
    let produitEstSelectionne = this.produitSelectionne.length > 0;
    if (produitEstSelectionne) {
      this.deuxiemeFormGroup.get('validateur').setValue('validé');
    } else {
      this.deuxiemeFormGroup.get('validateur').setValue('');
    }
  }
  premierSuivant() {
    this.dataSourceProduit.data = this.produitSelectionne as tableProduits[];
    let produitEstSelectionne = this.produitSelectionne.length > 0;
    if (produitEstSelectionne) {
      this.premierFormGroup
        .get('nom')
        .setValue(this.produitSelectionne[0].nom_Produit);
      this.premierFormGroup
        .get('codeBarre')
        .setValue(this.produitSelectionne[0].code_Barre);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Pas de produit selectionné!',
      });
    }
  }

  //teste du type de support pour savaoir activer les champs de dimensions ou le champ du volume
  testType() {
    let typeEstCarton = this.premierFormGroup.get('type').value === 'Carton';
    let typeEstPalette = this.premierFormGroup.get('type').value === 'Palette';
    if (typeEstCarton || typeEstPalette) {
      this.premierFormGroup.get('volume').disable();
      this.premierFormGroup.get('longueur').enable();
      this.premierFormGroup.get('largeur').enable();
      this.premierFormGroup.get('hauteur').enable();
    } else {
      this.premierFormGroup.get('volume').enable();
      this.premierFormGroup.get('longueur').disable();
      this.premierFormGroup.get('largeur').disable();
      this.premierFormGroup.get('hauteur').disable();
    }
  }
  premierPrecedent() {
    this.dataSourceProduits.data = this.produitsAffiche as tableProduits[];
    this.dataSourceProduits.data = this.dataSourceProduits.data.sort((a, b) =>
      a.id_Produit > b.id_Produit ? -1 : 1
    );
  }

  deuxiemeSuivant() {
    //pour le deuxieme bouton suivant
    this.troisiemeFormGroup
      .get('unite')
      .setValue(this.produitSelectionne[0].unite);
    this.troisiemeFormGroup
      .get('qte')
      .setValue(this.produitSelectionne[0].valeur_Unite);
  }
  troisiemeSuivant() {
    //pour le troisieme bouton suivant
    if (this.troisiemeFormGroup.status === 'VALID') {
      this.troisiemeStepEstRemplit = true;
    } else {
      this.troisiemeStepEstRemplit = false;
    }
  }
  quatriemePrecedent() {
    this.troisiemeStepEstRemplit = false;
  }
  reinitialiserStepper() {
    //reinitialisation du stepper
    this.produitClique.clear();
    this.troisiemeStepEstRemplit = false;
    this.formCodeBarre.get('code_Barre').setValue('');
    this.formFiltreProduit.get('nom_Produit').setValue('');
    this.dataSourceProduits.filter = '';
  }

  async valider() {
    //bouton valider
    var formData: any = new FormData();
    formData.append('idProduit', this.produitSelectionne[0].id_Produit);
    formData.append(
      'idComposant',
      'FP-' + this.produitSelectionne[0].id_Produit
    );
    formData.append('nomProduit', this.produitSelectionne[0].nom_Produit);
    formData.append('nomEmballage', this.premierFormGroup.get('nom').value);
    formData.append('typeEmballage', this.premierFormGroup.get('type').value);
    formData.append('qte', this.troisiemeFormGroup.get('qte').value);
    formData.append('unite', this.troisiemeFormGroup.get('unite').value);
    formData.append('categorie', this.produitSelectionne[0].type2);
    if (this.premierFormGroup.get('fragilite').value) {
      //verifier la fragilité avant l'enrigistrement
      formData.append('fragile', 'Oui');
    } else {
      formData.append('fragile', 'Non');
    }
    formData.append(
      'hauteur',
      Number(this.premierFormGroup.get('hauteur').value)
    );
    formData.append(
      'longueur',
      Number(this.premierFormGroup.get('longueur').value)
    );
    formData.append(
      'largeur',
      Number(this.premierFormGroup.get('largeur').value)
    );
    formData.append(
      'volume',
      Number(this.premierFormGroup.get('volume').value)
    );
    formData.append('poids_unitaire', this.poidsTotUnProduit);
    formData.append('poids_total_net', this.poidsTotUnProduit);
    formData.append('poids_emballage_total', this.poidsToltal);
    formData.append('code_barre', this.premierFormGroup.get('codeBarre').value);
    await this.service.creerProduitEmballe(formData).toPromise();
    await this._router.navigate(['/Menu/Menu_Colisage/Packaging/Liste_Pack']);
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  calculVolume() {
    //calculer le volume de l'emballage
    if (
      this.premierFormGroup.get('hauteur').value !== '' &&
      this.premierFormGroup.get('longueur').value !== '' &&
      this.premierFormGroup.get('largeur').value !== ''
    ) {
      let volume =
        Number(this.premierFormGroup.get('hauteur').value) *
        Number(this.premierFormGroup.get('longueur').value) *
        Number(this.premierFormGroup.get('largeur').value) *
        0.000001;
      this.premierFormGroup.get('volume').setValue(volume);
    }
  }

  calculerPoidsProduitNet(poids: any, qte: any) {
    //calculer poids produits total net
    this.poidsTotUnProduit = Number(poids) * Number(qte);
    this.calculerPoidsTotal(this.poidsTotUnProduit);
    return this.poidsTotUnProduit;
  }

  calculerPoidsTotal(poidsNet: any) {
    //calculer le poids total
    this.poidsToltal =
      poidsNet + Number(this.premierFormGroup.get('poidsEmballage').value);
  }
  onResize(event: any) {
    this.breakpoint = event.target.innerWidth <= 400 ? 2 : 6;
  }
}

// ******************** Interface table produit **************************
export interface tableProduits {
  //interface pour recuperer les données du Fiche produit entant que data source pour l'afficher dans le tableau
  id_Produit: number;
  nom_Produit: String;
  marque: String;
  valeur_Unite: number;
  unite: String;
  type1: String;
  type2: String;
  code_Barre: String;
}

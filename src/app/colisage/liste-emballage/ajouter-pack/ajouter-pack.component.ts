/**
 * Constructeur: get droit d'accées depuis sessionStorage.
 Liste des méthodes:
 * creerFormGroups: creation des formGroups.
 * chargerListeEmballage: charger la liste de colisage.
 * getListeSupportParType: charger la liste des supports filtrée par son type.
 * scannerCodeBarreSupport: fonction qui permet de scanner le code a barre avec le scanner.
 * gestionCodeBarreSupport: fonction qui permet de réaliser les fonctionnalitées necessaires aprés la saisie du code à barre.
 * selectionnerSupport: selectionner support manuellement.
 * verifierValiditeSupport: fonction qui permet de tester la validité du support lors de l'appuie sur le bouton suivant.
 * appliquerFiltre: filtrer par nom Emballage.
 * getIdProduit: fonction qui permet d'avoir les identifiants des produits dans un pack.
 * getQuantiteProduit: pour avoir les quantitées de chaque produit dans la liste de colisage.
 * getNomProduit: pour avoir le nom de chaque produit dans la liste colisage.
 * scannerCodeBarrePack: fonction pour scanner le code a barre avec le scanner.
 * gestionCodeBarrePack: fonction pour la gestion du code a barre scanné.
 * choisirPackScanne: fonction pour selectionner le pack qu'on a scanné son code a barre.
 * choisirPack: fonction pour la selection du pack manuellement.
 * pack: get le FormArray 'pack' pour ajouter a lui les formControls d'une facon dynamique.
 * nouveauPack: creation des formControls qte et unite pour chaque pack selectionné.
 * ajouterPack: lors de l'ajout du pack on ajoute les formControls crées a FormArray.
 * supprimerPack: vider le formArray.
 * deuxiemeSuivant: si l'utilisateur n'a pas choisi un pack on affiche une alerte
   on teste si l'utilisateur a choisi un pack a l'aide du formControl 'validateur'.
 * deuxiemePrecedent: supprimer le pack si on clique sur precedent pour eviter les problemes.
 * calculerPoidsTotalNet: calculer le poids total net.
 * calculerPoidsTotalBrut: calculer le poids des produits avec leur emballages mais sans le poids du support global.
 * calculerPoidsPackNet: poids total net de chaque pack selectionné.
 * calculerPoidsPackBrut: poids total brut de chaque pack selectionné.
 * reinitialiserStepper: reinitialiser le stepper.
 * testTypeSelection: fonction qui permet de choisir entre deux mode de selection du support (manuel ou avec scanner).
 * genererCodeBarre: fonction pour generer le code pour le code a barre.
 * valider: cette fonction permet l'enregistrement des données.
 * onResize: lors du changement de l'ecran on modifie le breakpoint du mat-grid pour avoir un nouveau layout.
 */
import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EmballageService } from '../services/emballage.service';
import { SupportService } from '../../supports/services/support.service';
@Component({
  selector: 'app-ajouter-pack',
  templateUrl: './ajouter-pack.component.html',
  styleUrls: ['./ajouter-pack.component.scss'],
})
export class AjouterPackComponent implements OnInit, AfterViewInit {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  //declaration des variables
  isLinear = true; //pour activer ou desactiver le deplacement sans validation dans le step
  premierFormGroup: FormGroup; //formGroup du premier step
  deuxiemeFormGroup: FormGroup; //formGroup du deuxieme step
  troisiemeFormGroup: FormGroup; //formGroup du troisieme step
  formCodeBarre = new FormGroup({ code_Barre: new FormControl('') }); //FormGroup pour lire le valeur du code a barre
  colonneAfficheTableauLC1: string[] = [
    'id',
    'nomEmballage',
    'typeEmballage',
    'nomProduit',
    'qte',
    'unite',
    'categorie',
  ]; //les colonne du tableau liste de colisage
  colonneAfficheTableauLC2: string[] = [
    'id',
    'nomEmballage',
    'typeEmballage',
    'poidsUnitaireNet',
    'qte',
    'unite',
    'poidsTotNet',
    'poidsTot',
    'categorie',
  ]; //les colonne du tableau liste de colisage
  dataSourcePackSelectionne = new MatTableDataSource<tableEmballage>(); //data source des packs qu'on a selectionné pour l'ajouter
  dataSourceListeEmballage = new MatTableDataSource<tableEmballage>(); //data source de la liste Emballage
  formFiltreNomEmballage = new FormGroup({
    nom_Emballage: new FormControl(''),
  }); //formGroup pour le input de filtrage par nom emballage
  packClique = new Set<tableEmballage>(); //liste des packs cliqués
  packSelectionne: any = []; //liste des packs selectionnés
  listePacks: any;
  poidsToltalNet: any;
  poidsToltalBrut: any;
  qte: any;
  poidsTotUnProduit: any; //poids total d'un produit
  poidsUnitaireNet: any; //pouids unitaire d'un produit
  poidsTotNetProduit: any; //poids total net d'un produit
  breakpoint: number; //breakpoint qu'on va utiliser pour definir le nombre de colonne dans le grid des info de validation selon la taille de l'ecran de l'utilisateur
  listeSupports: any;
  interval: any; //intervalle entre les keyup ==> on va specifier interval de 20ms pour ne pas autoriser l'ecriture que au scanner du code a barre
  barcode = '';
  inputSupport: any;
  support: any;
  supportSelectionne: any;
  longueur: any;
  largeur: any;
  hauteur: any;
  volume: any;
  poidsEmballage: any;
  typeEmballage: any;
  barcodeEmballage = '';

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  constructor(
    public serviceEmballage: EmballageService,
    public serviceSupport: SupportService,
    private formBuilder: FormBuilder,
    public _router: Router
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngAfterViewInit() {
    this.dataSourceListeEmballage.paginator = this.paginator.toArray()[0];
    this.dataSourceListeEmballage.sort = this.sort.toArray()[0];
    this.dataSourcePackSelectionne.paginator = this.paginator.toArray()[1];
    this.dataSourcePackSelectionne.sort = this.sort.toArray()[1];
  }

  ngOnInit() {
    this.creerFormGroups();
    this.dataSourceListeEmballage.filterPredicate = (data, filter: string) => {
      //pour specifier la colonne a filtrer avec le filtre frontend
      return data.nomEmballage.toLowerCase().includes(filter);
    };
    this.chargerListeEmballage();
    this.breakpoint = window.innerWidth <= 760 ? 2 : 6;
    this.testTypeSelection();
  }
  //creation des formGroups
  creerFormGroups() {
    this.premierFormGroup = this.formBuilder.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      nomEmballage: ['', Validators.required],
      fragilite: [false],
      codeBarre: ['', Validators.required],
      typeSelectionEmballage: ['auto', Validators.required],
      valider: ['', Validators.required],
    });
    this.deuxiemeFormGroup = this.formBuilder.group({
      validateur: ['', Validators.required],
    });
    this.troisiemeFormGroup = this.formBuilder.group({
      pack: this.formBuilder.array([]),
    });
  }

  //charger la liste de colisage
  async chargerListeEmballage() {
    this.listePacks = await this.serviceEmballage.listeEmballage().toPromise();
    this.listePacks.sort((embA: any, embB: any) =>
      embA.id > embB.id ? -1 : 1
    );
    this.dataSourceListeEmballage.data = this.listePacks as tableEmballage[];
  }

  // charger la liste des supports filtrée par son type
  async getListeSupportParType() {
    this.premierFormGroup.get('codeBarre').setValue('');
    this.listeSupports = await this.serviceSupport
      .filtrerSupports('type_support', this.premierFormGroup.get('type').value)
      .toPromise();
  }

  // fonction qui permet de scanner le code a barre avec le scanner
  scannerCodeBarreSupport(codeBarreScanne: any) {
    let element = document.getElementById('nomPack');
    // reinitialisation de l'intervalle
    if (this.interval) clearInterval(this.interval);
    // à la fin de l'ecriture du code a barre le scanner termine par l'event qui simule la touche Entrée
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode) this.gestionCodeBarreSupport(this.barcode);
      // pour prevenir la probléme d'ecriture du code a barre une autre fois si on scanne pour la deuxieme fois sans supprimer le input field
      this.premierFormGroup.get('codeBarre').setValue('');
      this.premierFormGroup.get('codeBarre').setValue(this.barcode);
      // on reinitialise la variable barcode
      this.barcode = '';
      element.focus();
      return;
    }
    // quelques scanner debuter le saisie du code a barre par introduir un event simulair pour le Shift donc on l'elimine
    if (codeBarreScanne.key != 'Shift') this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => (this.barcode = ''), 20);
  }

  // fonction qui permet de réaliser les fonctionnalitées necessaires aprés la saisie du code à barre
  async gestionCodeBarreSupport(codeBarre: any) {
    // charger liste des supports
    this.inputSupport = await this.serviceSupport
      .filtrerSupports('code_barre', codeBarre)
      .toPromise();
    //si le support n'est pas existant on lance une alerte avec possibilité de creation du support
    if (this.inputSupport.length === 0) {
      this.inputSupport = undefined;
      Swal.fire({
        title: 'Support inexistant!',
        text: "Ajoutez le dans la liste des support avant de l'utiliser.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          this._router.navigate([
            '/Menu/Menu_Colisage/Supports/Ajouter_Support',
          ]);
        }
      });
    } else {
      this.longueur = this.inputSupport[0].longueur;
      this.largeur = this.inputSupport[0].largeur;
      this.hauteur = this.inputSupport[0].hauteur;
      this.volume = this.inputSupport[0].volume;
      this.poidsEmballage = this.inputSupport[0].poidsEmballage;
      this.typeEmballage = this.inputSupport[0].typeSupport;
      this.support = this.inputSupport[0];

      this.premierFormGroup.get('valider').setValue('validé');
    }
  }

  // selectionner support manuellement
  selectionnerSupport() {
    this.support = this.supportSelectionne;
    this.longueur = this.supportSelectionne.longueur;
    this.largeur = this.supportSelectionne.largeur;
    this.hauteur = this.supportSelectionne.hauteur;
    this.volume = this.supportSelectionne.volume;
    this.poidsEmballage = this.supportSelectionne.poidsEmballage;
    this.typeEmballage = this.supportSelectionne.typeSupport;
    this.premierFormGroup.get('valider').setValue('validé');
  }

  // fonction qui permet de tester la validité du support lors de l'appuie sur le bouton suivant
  verifierValiditeSupport() {
    if (this.premierFormGroup.get('valider').value === '') {
      Swal.fire({
        icon: 'error',
        text: 'Prière de vérifier que le support est valide!',
      });
    }
  }

  appliquerFiltre(valeurFiltre: any) {
    //filtrer par nom Emballage
    valeurFiltre = (valeurFiltre.target as HTMLTextAreaElement).value;
    valeurFiltre = valeurFiltre.trim(); // Remove whitespace
    valeurFiltre = valeurFiltre.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourceListeEmballage.filter = valeurFiltre;
  }

  // fonction qui permet d'avoir les identifiants des produits dans un pack
  getIdProduit(produits: any) {
    let ids = produits.idProduit.split('/');
    return ids;
  }

  //pour avoir les quantitées de chaque produit dans la liste de colisage
  getQuantiteProduit(produits: any) {
    let qte = produits.qte.split('/');
    return qte;
  }

  //pour avoir le nom de chaque produit dans la liste colisage
  getNomProduit(produits: any) {
    let nomProduit = produits.nomProduit.split('/');

    return nomProduit;
  }

  // fonction pour scanner le code a barre avec le scanner
  scannerCodeBarrePack(codeBarreScanne: any) {
    if (this.interval) clearInterval(this.interval);
    if (codeBarreScanne.code == 'Enter') {
      if (this.barcode) this.gestionCodeBarrePack(this.barcode);
      this.formCodeBarre.get('code_Barre').setValue('');
      this.formCodeBarre.get('code_Barre').setValue(this.barcode);
      this.barcode = '';
      return;
    }
    if (codeBarreScanne.key != 'Shift') this.barcode += codeBarreScanne.key;
    this.interval = setInterval(() => (this.barcode = ''), 20);
  }

  // fonction pour la gestion du code a barre scanné
  gestionCodeBarrePack(codeBarre: any) {
    var prodSelect: any;
    prodSelect = this.dataSourceListeEmballage.data.filter(
      (x: any) => x.code_barre == codeBarre
    );
    this.choisirPackScanne(prodSelect[0]);
  }
  // fonction pour selectionner le pack qu'on a scanné son code a barre
  choisirPackScanne(p: any) {
    if (this.packClique.has(p)) {
      //si on clique sur un pack déja selectionné on le désélectionne
    } else {
      //sinon on selectionne le pack
      this.packClique.add(p);
      this.packSelectionne.push(p);
    }

    if (this.packSelectionne.length === 0) {
      this.deuxiemeFormGroup.get('validateur').setValue('');
    } else {
      this.deuxiemeFormGroup.get('validateur').setValue('valide'); //pour valider le deuxieme matStep
    }
  }

  // fonction pour la selection du pack manuellement
  choisirPack(p: any) {
    //selectionner les packs désirés
    if (this.packClique.has(p)) {
      //si on clique sur un pack déja selectionné on le désélectionne
      this.packClique.delete(p);
      this.packSelectionne.splice(this.packSelectionne.indexOf(p), 1);
      this.formCodeBarre.get('code_Barre').setValue('');
    } else {
      //sinon on selectionne le pack
      this.packClique.add(p);
      this.packSelectionne.push(p);
    }
    if (this.packSelectionne.length === 0) {
      this.deuxiemeFormGroup.get('validateur').setValue('');
    } else {
      this.deuxiemeFormGroup.get('validateur').setValue('valide'); //pour valider le deuxieme matStep
    }
  }

  //get le FormArray 'pack' pour ajouter a lui les formControls d'une facon dynamique
  pack(): FormArray {
    return this.troisiemeFormGroup.get('pack') as FormArray;
  }

  get packControl() {
    return this.troisiemeFormGroup.get('pack') as FormArray;
  }

  //creation des formControls qte et unite pour chaque pack selectionné
  nouveauPack(unite: any): FormGroup {
    return this.formBuilder.group({
      qte: ['', Validators.required],
      unite: [unite, Validators.required],
    });
  }

  //lors de l'ajout du pack on ajoute les formControls crées a FormArray
  ajouterPack(unite: any) {
    this.pack().push(this.nouveauPack(unite));
  }

  //vider le formArray
  supprimerPack() {
    this.pack().clear();
  }

  // si l'utilisateur n'a pas choisi un pack on affiche une alerte
  // on teste si l'utilisateur a choisi un pack a l'aide du formControl 'validateur'
  deuxiemeSuivant() {
    let packEstChoisi =
      this.deuxiemeFormGroup.get('validateur').value === 'valide';
    if (!packEstChoisi) {
      Swal.fire({
        icon: 'error',
        text: 'Pas de pack choisi!',
      });
    } else {
      //pour chaque produit séléctionné on ajoute un formControl
      this.packSelectionne.forEach((element: any) => {
        this.ajouterPack(element.typeEmballage);
      });
      this.dataSourcePackSelectionne.data = this
        .packSelectionne as tableEmballage[];
    }
  }
  // supprimer le pack si on clique sur precedent pour eviter les problemes
  deuxiemePrecedent() {
    this.supprimerPack();
  }

  // calculer le poids total net
  calculerPoidsTotalNet() {
    this.poidsToltalNet = 0;
    this.qte = '';
    this.poidsUnitaireNet = '';
    for (let i = 0; i < this.packSelectionne.length; i++) {
      this.poidsToltalNet +=
        Number(this.packSelectionne[i].poids_total_net) *
        Number(this.troisiemeFormGroup.get('pack').value[i].qte);
      let qteTT =
        Number(this.packSelectionne[i].qte) *
        Number(this.troisiemeFormGroup.get('pack').value[i].qte);
      this.qte += qteTT + '/'; //enregistrer la qte des produits dans une chaine de caractéres
      this.poidsUnitaireNet += this.packSelectionne[i].poids_total_net + '/'; //enregistrer le poids unitaire des produits dans une chaine de caractéres
    }
    this.qte = this.qte.slice(0, -1); //enlever le dernier "/"
    this.poidsUnitaireNet = this.poidsUnitaireNet.slice(0, -1); //enlever le dernier "/"
    return this.poidsToltalNet;
  }

  //calculer le poids des produits avec leur emballages mais sans le poids du support global
  calculerPoidsTotalBrut() {
    this.poidsToltalBrut = 0;
    for (let i = 0; i < this.packSelectionne.length; i++) {
      this.poidsToltalBrut +=
        Number(this.packSelectionne[i].poids_emballage_total) *
        Number(this.troisiemeFormGroup.get('pack').value[i].qte);
    }
    this.poidsToltalBrut = this.poidsToltalBrut + Number(this.poidsEmballage);
    return this.poidsToltalBrut;
  }

  //poids total net de chaque pack selectionné
  calculerPoidsPackNet(poids: any, qte: any) {
    this.poidsTotNetProduit = Number(poids) * Number(qte);
    return this.poidsTotNetProduit;
  }

  //poids total brut de chaque pack selectionné
  calculerPoidsPackBrut(poids: any, qte: any) {
    this.poidsTotUnProduit = Number(poids) * Number(qte);
    return this.poidsTotUnProduit;
  }

  //reinitialiser le stepper
  reinitialiserStepper() {
    this.packClique.clear();
    this.support = undefined;
    this.packSelectionne = [];
    while (this.packControl.length !== 0) {
      this.packControl.removeAt(0)
    }
  }

  // fonction qui permet de choisir entre deux mode de selection du support (manuel ou avec scanner)
  testTypeSelection() {
    this.premierFormGroup.get('valider').setValue('');
    if (
      this.premierFormGroup.get('typeSelectionEmballage').value === 'manuel'
    ) {
      this.premierFormGroup.get('codeBarre').setValue('');
      this.inputSupport = undefined;
      this.premierFormGroup.get('codeBarre').disable();
      this.premierFormGroup.get('codeBarre').setValidators([]);
      this.premierFormGroup.get('codeBarre').updateValueAndValidity();
      this.premierFormGroup.get('type').enable();
      this.premierFormGroup.get('type').setValidators([Validators.required]);
      this.premierFormGroup.get('type').updateValueAndValidity();
      this.premierFormGroup.get('nomEmballage').enable();
      this.premierFormGroup
        .get('nomEmballage')
        .setValidators([Validators.required]);
      this.premierFormGroup.get('nomEmballage').updateValueAndValidity();
    } else {
      this.supportSelectionne = undefined;
      this.premierFormGroup.get('codeBarre').enable();
      this.premierFormGroup
        .get('codeBarre')
        .setValidators([Validators.required]);
      this.premierFormGroup.get('codeBarre').updateValueAndValidity();
      this.premierFormGroup.get('type').updateValueAndValidity();
      this.premierFormGroup.get('type').setValidators([]);
      this.premierFormGroup.get('type').disable();
      this.premierFormGroup.get('nomEmballage').disable();
      this.premierFormGroup.get('nomEmballage').setValidators([]);
      this.premierFormGroup.get('nomEmballage').updateValueAndValidity();
    }
  }

  //fonction pour generer le code pour le code a barre
  genererCodeBarre() {
    let support;
    if (
      this.premierFormGroup.get('typeSelectionEmballage').value === 'manuel'
    ) {
      support = this.supportSelectionne;
    } else {
      support = this.inputSupport[0];
    }
    this.barcodeEmballage = '';
    let idComposant = 'PROD';
    let idSupport = 'S' + support.id;
    let fragilite = this.premierFormGroup.get('fragilite').value
      ? 'FRAO'
      : 'FRAN';
    let listeQuatites = this.qte.split('/');
    let quantitees = 'Q';
    listeQuatites.forEach((quantite: any) => {
      quantitees += quantite;
    });
    this.packSelectionne.forEach((element: any) => {
      idComposant += element.id;
    });
    this.barcodeEmballage += idSupport + fragilite + idComposant + quantitees;
  }

  // fonction a exucuter lors de l'appuis sur le bouton valider
  // cette fonction permet l'enregistrement des données
  async valider() {
    //Bouton valider
    let idProduit = '';
    let nomPack = '';
    let idComposant = '';
    this.packSelectionne.forEach((element: any) => {
      nomPack += element.nomEmballage + '/';
      idProduit += element.idProduit + '/';
      idComposant += element.id + '/';
    });
    idProduit = idProduit.slice(0, -1);
    nomPack = nomPack.slice(0, -1);
    idComposant = idComposant.slice(0, -1);
    var formData: any = new FormData();
    formData.append('idProduit', idProduit);
    formData.append('idComposant', idComposant);
    formData.append('nomProduit', nomPack);
    formData.append('nomEmballage', this.premierFormGroup.get('nom').value);
    formData.append('typeEmballage', this.typeEmballage);
    formData.append('qte', this.qte);
    formData.append(
      'unite',
      this.troisiemeFormGroup.get('pack').value[0].unite
    );
    formData.append('categorie', this.packSelectionne[0].categorie);
    if (this.premierFormGroup.get('fragilite').value) {
      formData.append('fragile', 'Oui');
    } else {
      formData.append('fragile', 'Non');
    }
    formData.append('hauteur', Number(this.hauteur).toFixed(3));
    formData.append('longueur', Number(this.longueur).toFixed(3));
    formData.append('largeur', Number(this.largeur).toFixed(3));
    formData.append('volume', Number(this.volume).toFixed(3));
    formData.append('poids_unitaire', Number(this.poidsToltalNet).toFixed(3));
    formData.append('poids_total_net', Number(this.poidsToltalNet).toFixed(3));
    formData.append('poids_emballage_total', Number(this.poidsToltalBrut).toFixed(3));
    formData.append(
      'code_barre',
      this.barcodeEmballage
    );
    await this.serviceEmballage.creerProduitEmballe(formData).toPromise();
    // aprés l'enregistrement en retourne a la page liste des packs
    await this._router.navigate(['/Menu/Menu_Colisage/Packaging/Liste_Pack']);
    Swal.fire({
      icon: 'success',
      title: 'Produit bien ajouté',
      showConfirmButton: false,
      timer: 1500,
    });
  }
  //lors du changement de l'ecran on modifie le breakpoint du mat-grid pour avoir un nouveau layout
  onResize(event: any) {
    this.breakpoint = event.target.innerWidth <= 768 ? 2 : 6;
  }
}

//interface table emballage
export interface tableEmballage {
  //interface pour recuperer les données du liste colisage entant qu data source pour l'afficher dans le tableau
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

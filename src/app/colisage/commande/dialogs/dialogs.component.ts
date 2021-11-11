import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EmballageService } from '../../liste-emballage/services/emballage.service';
import { CommandeService } from '../services/commande.service';

// *********************************** Boite de dialogue info *********************************************************
@Component({
  selector: 'boite-dialogue-info',
  templateUrl: './boite-dialogue-info.html',
  styleUrls: ['./boite-dialogue-info.scss'],
})
export class BoiteDialogueInfo implements OnInit {
  indicateurTypeCommande: String;
  typeDocument: String;
  articles: any;
  listeArticlesDetail: any = [];
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueInfo>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public serviceEmballage: EmballageService,
    public serviceCommande: CommandeService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.indicateurTypeCommande = this.data.commande.reference.split('-')[0];
    this.getTypeCommande();
    await this.getListeEmballage();
    this.getDetail();
  }

  getTypeCommande() {
    if (this.indicateurTypeCommande === 'F') {
      this.typeDocument = 'Facture';
    } else {
      this.typeDocument = 'Bon Livraison';
    }
  }
  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }

  async getDetail() {
    if (this.indicateurTypeCommande === 'F') {
      var detail = await this.serviceCommande
        .Detail_Facture(this.data.commande.id)
        .toPromise();
      this.articles = await getDetailFacture(detail);
    } else {
      var detail = await this.serviceCommande
        .Detail_BL(this.data.commande.id)
        .toPromise();
      this.articles = await getDetailBL(detail);
    }
    for (let i = 0; i < this.articles.length; i++) {
      let qteProduitCommande = this.articles[i].qte;
      let listeEmballageProduit = [];
      this.listeProduitDansListeEmballage = this.listeEmballage.filter(
        (emballage: any) => emballage.idProduit === this.articles[i].id
      );
      if (this.listeProduitDansListeEmballage.length > 0) {
        do {
          let differenceQte = (index: any) => {
            return (
              qteProduitCommande -
              this.listeProduitDansListeEmballage[index].qte
            );
          };
          let emballage: any;
          let qteEmballage;
          for (let j = 0; j < this.listeProduitDansListeEmballage.length; j++) {
            if (j !== 0) {
              if (
                qteProduitCommande >=
                  this.listeProduitDansListeEmballage[j].qte &&
                differenceQte(j) < differenceQte(j - 1)
              ) {
                let difference = differenceQte(j);
                qteEmballage = 0;
                do {
                  difference -= this.listeProduitDansListeEmballage[j].qte;
                  qteEmballage++;
                } while (difference > 0);
                emballage = this.listeProduitDansListeEmballage[j];
              }
            } else if (
              qteProduitCommande >=
                this.listeProduitDansListeEmballage[j].qte &&
              j === 0
            ) {
              let difference = differenceQte(j);
              qteEmballage = 0;
              do {
                difference -= this.listeProduitDansListeEmballage[j].qte;
                qteEmballage++;
              } while (difference > 0);
              emballage = this.listeProduitDansListeEmballage[j];
            }
          }
          qteProduitCommande -= emballage.qte * qteEmballage;
          listeEmballageProduit.push({
            emballage: emballage,
            qteEmballage: qteEmballage,
          });
        } while (qteProduitCommande > 0);
        this.listeArticlesDetail.push(
          new Article(
            this.articles[i].id,
            this.articles[i].nom,
            this.articles[i].qte,
            this.articles[i].qte,
            this.articles[i].type,
            this.articles[i].numSerie,
            this.articles[i].produit4Gs,
            this.articles[i].numeroLots,
            listeEmballageProduit,
            []
          )
        );
      } else {
      }
    }
  }

  fermerBoiteDialogue() {
    this.dialogRef.close();
  }

  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '600px',
      data: { produit: article },
    });
  }
}

// *********************************** Boite de dialogue créer commande ***********************************************
@Component({
  selector: 'boite-dialogue-creer-commande',
  templateUrl: 'boite-dialogue-creer-commande.html',
  styleUrls: ['boite-dialogue-creer-commande.scss'],
})
export class BoiteDialogueCreerCommande implements OnInit {
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
    latitude: 34.74056,
    longitude: 10.76028,
  };
  positionsClientEnregistree: any = [];
  positionEstModifie: boolean = false;
  constructor(
    private fb: FormBuilder,
    public dialgRef: MatDialogRef<BoiteDialogueCreerCommande>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public serviceCommande: CommandeService,
    public serviceEmballage: EmballageService,
    public dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.firstFormGroup = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleAdresse: '',
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required],
    });
    this.getTypeDocument();
    await this.getListeEmballage();
    await this.getPositionsEnregistrees();
    this.getDetail();
  }

  getTypeDocument() {
    this.indicateurTypeCommande = this.data.commande.reference.split('-')[0];
    if (this.indicateurTypeCommande === 'F') this.typeDocument = 'Facture';
    else this.typeDocument = 'Bon Livraison';
  }

  async getPositionClient() {
    if (this.positionClient.idClient === undefined) {
      this.latMap = 34.74056;
      this.lngMap = 10.76028;
      this.zoom = 5;
      this.positionExiste = false;
    } else {
      this.lat = Number(this.positionClient.latitude);
      this.lng = Number(this.positionClient.longitude);
      this.latMap = Number(this.positionClient.latitude);
      this.lngMap = Number(this.positionClient.longitude);
      this.zoom = 15;
      this.positionExiste = true;
    }
  }

  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
  }

  ajouterAdresse() {
    if (this.firstFormGroup.get('nouvelleAdresse').value !== '') {
      this.positionsClientEnregistree.push({
        adresse: this.firstFormGroup.get('nouvelleAdresse').value,
        latitude: '',
        longitude: '',
      });
    }
  }

  selectionnerAdresse() {
    this.positionClient = this.firstFormGroup.get('adresse').value;
    this.getPositionClient();
  }
  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }
  async getDetail() {
    if (this.indicateurTypeCommande === 'F') {
      var detail = await this.serviceCommande
        .Detail_Facture(this.data.commande.id)
        .toPromise();
      this.articles = await getDetailFacture(detail);
    } else {
      var detail = await this.serviceCommande
        .Detail_BL(this.data.commande.id)
        .toPromise();
      this.articles = await getDetailBL(detail);
    }
    for (let i = 0; i < this.articles.length; i++) {
      //pour chaque article
      let qteProduitCommande = Number(this.articles[i].qte);
      let listeEmballageProduit = [];
      this.listeProduitDansListeEmballage = this.listeEmballage.filter(
        (emballage: any) => emballage.idProduit === this.articles[i].id
      );
      if (this.listeProduitDansListeEmballage.length > 0) {
        //s'il y a des element dans la listeProduitDansListeEmballage
        do {
          let differenceQte = (index: any) => {
            return (
              qteProduitCommande -
              Number(this.listeProduitDansListeEmballage[index].qte)
            );
          };
          let emballage: any;
          let qteEmballage;
          let differenceQuantite = 0;
          for (let j = 0; j < this.listeProduitDansListeEmballage.length; j++) {
            //pour chaque emballage d'un produit
            if (j !== 0) {
              //tous les element sauf le premier element
              if (
                qteProduitCommande >=
                Number(this.listeProduitDansListeEmballage[j].qte)
              ) {
                //si qte commande > qte emballage
                if (differenceQte(j) < differenceQuantite) {
                  differenceQuantite = differenceQte(j);
                  let difference = differenceQte(j);
                  qteEmballage = 0;
                  do {
                    difference -= Number(
                      this.listeProduitDansListeEmballage[j].qte
                    );
                    qteEmballage++;
                  } while (difference >= 0);
                  emballage = this.listeProduitDansListeEmballage[j];
                }
              }
            } else if (j == 0) {
              //si c'est le premier element du liste
              if (
                qteProduitCommande >=
                Number(this.listeProduitDansListeEmballage[j].qte)
              ) {
                differenceQuantite = differenceQte(j);
                let difference = differenceQte(j);
                qteEmballage = 0;
                do {
                  difference -= Number(
                    this.listeProduitDansListeEmballage[j].qte
                  );
                  qteEmballage++;
                } while (difference >= 0);
                emballage = this.listeProduitDansListeEmballage[j];
              }
            }
          }
          qteProduitCommande -= Number(emballage.qte) * qteEmballage;
          listeEmballageProduit.push({
            emballage: emballage,
            qteEmballage: qteEmballage,
          });
        } while (qteProduitCommande > 0);
        this.listeArticlesDetail.push(
          new Article(
            this.articles[i].id,
            this.articles[i].nom,
            Number(this.articles[i].qte),
            Number(this.articles[i].qte),
            this.articles[i].type,
            this.articles[i].numSerie,
            this.articles[i].produit4Gs,
            this.articles[i].numeroLots,
            listeEmballageProduit,
            []
          )
        );
      }
    }
  }

  positionerMarquer(event: any) {
    //pour positionner un marqueur sur le map
    if (!this.positionExiste) {
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }
  }
  modifierPositionMarquer(event: any) {
    //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;
  }

  ouvrirBoiteDialogueEmballer(produit: any) {
    const dialogRef = this.dialog.open(BoiteDialogueEmballer, {
      width: '600px',
      maxWidth: '95vw',
      data: { produit: produit },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        produit.qteNonEmballe = result.qteNonEmballe;
        produit.listeEmballageChoisi = result.listeEmballageChoisi;
      }
      this.verifierValiditeListeProduits();
    });
  }
  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '600px',
      data: { produit: article },
    });
  }
  creerListeEmballageChoisi() {
    this.listeEmballageChoisi = [];
    this.listeArticlesDetail.forEach((article: any) => {
      this.listeEmballageChoisi = this.listeEmballageChoisi.concat(
        article.listeEmballageChoisi
      );
    });
  }

  verifierValiditeListeProduits() {
    let estValide = true;
    this.listeArticlesDetail.forEach((element: any) => {
      element.qteNonEmballe !== 0 ? (estValide = false) : '';
    });
    estValide
      ? this.secondFormGroup.get('secondCtrl').setValue('valide')
      : this.secondFormGroup.get('secondCtrl').setValue('');
  }
  getNombreArticles(article: any) {
    return article.qte * article.emballage.qte;
  }

  getDimensionsPack(article: any) {
    return (
      article.emballage.longueur +
      'x' +
      article.emballage.largeur +
      'x' +
      article.emballage.hauteur
    );
  }

  getVolumePack(article: any) {
    return article.emballage.volume * article.qte;
  }

  getPoidsPackNet(article: any) {
    return article.emballage.poids_total_net * article.qte;
  }

  getPoidsPackBrut(article: any) {
    return article.emballage.poids_emballage_total * article.qte;
  }

  async enregistrer() {
    let commande: any = new FormData();
    //creation position client s'il n'existe pas
    if (this.positionClient.idClient === undefined) {
      let position: any = new FormData();
      this.positionClient.longitude = this.lng;
      this.positionClient.latitude = this.lat;
      position.append('idClient', this.data.commande.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.positionClient.longitude);
      position.append('latitude', this.positionClient.latitude);
      await this.serviceCommande.creerPositionClient(position).toPromise();
      this.positionClient = await this.serviceCommande
        .dernierPositionClient()
        .toPromise();
    } else if (this.positionEstModifie) {
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      await this.serviceCommande.modifierPositionClient(position).toPromise();
    }

    for (let i = 0; i < this.listeEmballageChoisi.length; i++) {
      let listeColisage: any = new FormData();
      let emballage = this.listeEmballageChoisi[i];
      listeColisage.append('reference', this.data.commande.reference);
      listeColisage.append('idEmballage', emballage.emballage.id);
      listeColisage.append('emballage', emballage.emballage.nomEmballage);
      listeColisage.append('idProduit', emballage.emballage.idProduit);
      listeColisage.append('produit', emballage.emballage.nomProduit);
      listeColisage.append(
        'quantite',
        Number(this.getNombreArticles(emballage))
      );
      listeColisage.append(
        'quantiteDansEmballage',
        Number(emballage.emballage.qte)
      );
      listeColisage.append('nombrePack', Number(emballage.qte));
      listeColisage.append('dimensions', this.getDimensionsPack(emballage));
      listeColisage.append('volume', Number(this.getVolumePack(emballage)));
      listeColisage.append('poidsNet', Number(this.getPoidsPackNet(emballage)));
      listeColisage.append(
        'poidsBrut',
        Number(this.getPoidsPackBrut(emballage))
      );
      await this.serviceCommande.creerColis(listeColisage).toPromise();
    }

    commande.append('referenceDocument', this.data.commande.reference);
    commande.append('idClient', this.data.commande.idClient);
    commande.append('nomClient', this.data.commande.nomClient);
    commande.append('contact', this.data.commande.contact);
    commande.append('telephone', this.data.commande.telephone);
    commande.append('email', this.data.commande.email);
    commande.append('categorieClient', this.data.commande.categorieClient);
    commande.append('ville', this.data.commande.ville);
    commande.append('adresse', this.data.commande.adresse);
    commande.append('typePieceIdentite', this.data.commande.typePieceIdentite);
    commande.append('numPieceIdentite', this.data.commande.numeroPieceIdentite);
    commande.append('dateCreation', this.data.commande.dateCreation);
    commande.append('idPosition', this.positionClient.id);

    await this.serviceCommande.creerCommande(commande).toPromise();
    Swal.fire({
      icon: 'success',
      title: 'Commande bien ajoutée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.dialgRef.close();
  }

  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      nombrePack += emballage.qte;
    });
    return nombrePack;
  }

  get volumeTotal() {
    var volumeTotal = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      volumeTotal += emballage.emballage.volume;
    });
    return volumeTotal.toFixed(2);
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(2);
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(2);
  }
}

// ***********************************Boite de dialogue Emballer ******************************************************
@Component({
  selector: 'boite-dialogue-emballer',
  templateUrl: 'boite-dialogue-emballer.html',
  styleUrls: ['boite-dialogue-emballer.scss'],
})
export class BoiteDialogueEmballer implements OnInit {
  quantiteNonEmballee: number;
  listeEmballages: any;
  form: FormGroup;
  maxInput: number;
  minInput: number = 0;
  listeEmballagesChoisi: any = [];
  listeMax: number[] = [];
  quantiteNonEmballeePrecedente: number;
  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueEmballer>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceEmballage: EmballageService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.quantiteNonEmballee = Number(this.data.produit.qte);
    this.quantiteNonEmballeePrecedente = Number(this.data.produit.qte);
    this.form = this.fb.group({
      qte: this.fb.array([]),
    });
    await this.getListeEmballages();
    await this.ajouterChampQte();
    this.ajouterQuantiteEmballage();
  }
  get qteForm() {
    return this.form.get('qte') as FormArray;
  }
  async ajouterChampQte() {
    this.listeEmballages.forEach((emballage: any) => {
      let qte: any;
      if (emballage.qte > this.quantiteNonEmballee) {
        qte = this.fb.group({
          qte: [
            { value: 0, disabled: true },
            [
              Validators.max(
                Number(this.data.produit.qte) / Number(emballage.qte)
              ),
              Validators.min(0),
            ],
          ],
        });
      } else {
        if (this.data.produit.listeEmballageChoisi.length > 0) {
          const emb = this.data.produit.listeEmballageChoisi.filter(
            (emb: any) => emb.emballage.id === emballage.id
          );
          if (emb.length > 0) {
            qte = this.fb.group({
              qte: [emb[0].qte, [Validators.min(0)]],
            });
          } else {
            qte = this.fb.group({
              qte: [0, [Validators.min(0)]],
            });
          }
        } else {
          qte = this.fb.group({
            qte: [0, [Validators.min(0)]],
          });
        }
      }
      this.qteForm.push(qte);
      this.listeMax.push(Number(this.data.produit.qte) / Number(emballage.qte));
    });
  }
  async getListeEmballages() {
    this.listeEmballages = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
    this.listeEmballages = this.listeEmballages.filter(
      (emballage: any) => emballage.idProduit === this.data.produit.id
    );
    this.listeEmballages = this.listeEmballages.sort(
      (emballage1: any, emballage2: any) =>
        Number(emballage1.qte) > Number(emballage2.qte) ? 1 : -1
    );
  }
  updateMax(i: any) {
    var qteFormArray = this.form.get('qte') as FormArray;
    for (let j = 0; j < this.listeMax.length; j++) {
      if (j !== i && !qteFormArray.controls[j].disabled) {
        this.listeMax[j] =
          this.quantiteNonEmballee / Number(this.listeEmballages[j].qte) +
          this.form.get('qte').value[j].qte;
        this.listeMax[j] = Math.trunc(this.listeMax[j]);
      }
    }
    this.quantiteNonEmballeePrecedente = this.quantiteNonEmballee;
  }
  ajouterQuantiteEmballage() {
    var qteFormArray = this.form.get('qte') as FormArray;
    this.quantiteNonEmballee = Number(this.data.produit.qte);
    var quantiteProdEmballe = 0;
    var j = 0;
    var listeEmballage = [];
    for (let i = 0; i < qteFormArray.length; i++) {
      if (Number(this.listeEmballages[i].qte) <= this.quantiteNonEmballee) {
        quantiteProdEmballe +=
          Number(this.form.get('qte').value[i].qte) *
          Number(this.listeEmballages[i].qte);
        listeEmballage.push({
          emballage: this.listeEmballages[i],
          qte: this.form.get('qte').value[i].qte,
        });
      }
    }
    try {
      if (this.quantiteNonEmballee - quantiteProdEmballe >= 0) {
        this.quantiteNonEmballee -= quantiteProdEmballe;
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Valeur invalide...',
        text: 'Quantité necessaire est dépassée!',
      }).then((result) => {
        this.listeEmballages.forEach((emballage: any) => {
          if (
            this.form.get('qte').value[j].qte * emballage.qte >
            this.quantiteNonEmballee
          ) {
            qteFormArray.at(j).get('qte').setValue(0);
            j++;
          }
        });
      });
    }
    this.listeEmballagesChoisi = listeEmballage;
  }
  donnerSuggestion(emballage: any) {
    var listeSuggestion = this.data.produit.listeEmballage.filter(
      (emb: any) => emb.emballage.id === emballage.id
    );
    var qteSuggestion = 0;
    if (listeSuggestion.length > 0) {
      qteSuggestion = listeSuggestion[0].qteEmballage;
    }
    return qteSuggestion;
  }
  valider() {
    this.listeEmballagesChoisi = this.listeEmballagesChoisi.filter(
      (emballage: any) => emballage.qte > 0
    );
    const result = {
      qteNonEmballe: this.quantiteNonEmballee,
      listeEmballageChoisi: this.listeEmballagesChoisi,
    };
    this.dialogRef.close(result);
  }
  annuler() {
    const result = {
      qteNonEmballe: this.data.produit.qteNonEmballe,
      listeEmballageChoisi: this.data.produit.listeEmballageChoisi,
    };
    this.dialogRef.close(result);
  }
}
// --------------------------------------------------------------------------------------------------------------------
// *********************************** Boite Dialogue Detail produit **************************************************
// --------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'boite-dialogue-detail-produit',
  templateUrl: 'boite-dialogue-detail-produit.html',
  styleUrls: ['boite-dialogue-detail-produit.scss'],
})
export class BoiteDialogueDetailProduit implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueDetailProduit>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}

// -------------------------------------------------------------------------------------------------------------
// *************************************** Boite Dialogue modifier position ************************************
// -------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'boite-dialogue-modifier-position',
  templateUrl: 'boite-dialogue-modifier-position.html',
  styleUrls: ['boite-dialogue-modifier-position.scss'],
})
export class BoiteDialogueModifierPositionComponent implements OnInit {
  form: FormGroup;
  latMap: any = 34.74056;
  lngMap: any = 10.76028;
  lat: any = 0;
  lng: any = 0;
  zoom: number = 5;
  positionExiste = false;
  positionClient: any = {
    latitude: 34.74056,
    longitude: 10.76028,
  };
  positionsClientEnregistree: any = [];
  positionEstModifie: boolean = false;
  positionCommande: any;
  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueModifierPositionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private serviceCommande: CommandeService
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleAdresse: '',
    });
    await this.getPositionsEnregistrees();
  }

  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
    await this.getPositionCommande();
    this.selectionnerAdresse();
  }

  async getPositionCommande() {
    this.positionCommande = await this.serviceCommande
      .getPositionById(this.data.commande.idPosition)
      .toPromise();
    this.form.get('adresse').setValue(this.positionCommande);
  }

  async getPositionClient() {
    if (this.positionClient.idClient === undefined) {
      this.latMap = 34.74056;
      this.lngMap = 10.76028;
      this.zoom = 5;
      this.positionExiste = false;
    } else {
      this.lat = this.positionClient.latitude;
      this.lng = this.positionClient.longitude;
      this.latMap = Number(this.positionClient.latitude);
      this.lngMap = Number(this.positionClient.longitude);
      this.zoom = 15;
      this.positionExiste = true;
    }
  }

  ajouterAdresse() {
    this.positionsClientEnregistree.push({
      adresse: this.form.get('nouvelleAdresse').value,
      latitude: '',
      longitude: '',
    });
  }

  fonctionComparaisonPosition(option: any, value: any): boolean {
    return option.id === value.id;
  }

  selectionnerAdresse() {
    this.positionEstModifie = false;
    this.positionClient = this.form.get('adresse').value;
    this.getPositionClient();
  }

  positionerMarquer(event: any) {
    //pour positionner un marqueur sur le map
    if (!this.positionExiste) {
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }
  }
  modifierPositionMarquer(event: any) {
    //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;
  }

  async enregistrerModificationPositionClient() {
    if (this.positionClient.idClient === undefined) {
      let position: any = new FormData();
      this.positionClient.longitude = this.lng;
      this.positionClient.latitude = this.lat;
      position.append('idClient', this.data.commande.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.positionClient.longitude);
      position.append('latitude', this.positionClient.latitude);
      await this.serviceCommande.creerPositionClient(position).toPromise();
      this.positionClient = await this.serviceCommande
        .dernierPositionClient()
        .toPromise();
      let formData: any = new FormData();
      formData.append('id', this.data.commande.id);
      formData.append('idPosition', this.positionClient.id);
      await this.serviceCommande
        .modifierIdPositionDansTableCommande(formData)
        .toPromise();
    } else if (this.positionEstModifie) {
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      await this.serviceCommande.modifierPositionClient(position).toPromise();
    } else {
      let formData: any = new FormData();
      formData.append('id', this.data.commande.id);
      formData.append('idPosition', this.positionClient.id);
      await this.serviceCommande
        .modifierIdPositionDansTableCommande(formData)
        .toPromise();
    }
    Swal.fire({
      icon: 'success',
      title: 'Position bien modifiée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.dialogRef.close();
  }
}

// -------------------------------------------------------------------------------------------------------------
// ***************************************** Boite de dialogue modifier liste colisage *************************
// -------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'boite-dialogue-modifier-colisage',
  templateUrl: 'boite-dialogue-modifier-colisage.html',
  styleUrls: ['boite-dialogue-modifier-colisage.scss'],
})
export class BoiteDialogueModifierColisage implements OnInit {
  listeColis: any;
  listeArticlesDetail: any = [];
  indicateurTypeCommande: String;
  idDocument: Number;
  articles: any;
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
  typeDocument: String;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  listeEmballageChoisi: any = [];
  estValide: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<BoiteDialogueModifierColisage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceCommande: CommandeService,
    private dialog: MatDialog,
    private serviceEmballage: EmballageService
  ) {}

  async ngOnInit() {
    this.getListeColis();
    this.getTypeDocument();
    await this.getListeEmballage();
    this.getDetail();
  }

  async getListeColis() {
    this.listeColis = await this.serviceCommande
      .getListeColisParReference(this.data.commande.referenceDocument)
      .toPromise();
  }

  getTypeDocument() {
    this.indicateurTypeCommande =
      this.data.commande.referenceDocument.split('-')[0];
    this.idDocument = Number(
      this.data.commande.referenceDocument.split('-')[1]
    );
    if (this.indicateurTypeCommande === 'F') this.typeDocument = 'Facture';
    else this.typeDocument = 'Bon Livraison';
  }

  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }

  async getDetail() {
    let listeEmballageChoisi: any = [];
    if (this.indicateurTypeCommande === 'F') {
      var detail = await this.serviceCommande
        .Detail_Facture(this.idDocument)
        .toPromise();
      this.articles = await getDetailFacture(detail);
    } else {
      var detail = await this.serviceCommande
        .Detail_BL(this.idDocument)
        .toPromise();
      this.articles = await getDetailBL(detail);
    }
    for (let i = 0; i < this.articles.length; i++) {
      //pour chaque article
      let qteProduitCommande = Number(this.articles[i].qte);
      let listeEmballageProduit = [];
      this.listeProduitDansListeEmballage = this.listeEmballage.filter(
        (emballage: any) => emballage.idProduit === this.articles[i].id
      );
      let listeEmballageEnregistree = this.listeColis.filter(
        (element: any) =>
          Number(element.idProduit) === Number(this.articles[i].id)
      );
      listeEmballageChoisi = [];
      listeEmballageEnregistree.forEach((element: any) => {
        let dimensions = element.dimensions.split('x');
        let longueur = dimensions[0];
        let largeur = dimensions[1];
        let hauteur = dimensions[2];
        listeEmballageChoisi.push({
          emballage: {
            id: element.idEmballage,
            nomEmballage: element.emballage,
            nomProduit: this.articles[i].nom,
            idProduit: this.articles[i].id,
            longueur: longueur,
            largeur: largeur,
            hauteur: hauteur,
            poids_emballage_total: element.poidsBrut / element.nombrePack,
            poids_total_net: element.poidsNet / element.nombrePack,
            qte: element.quantiteDansEmballage,
            volume: element.volume / element.nombrePack,
          },
          qte: element.nombrePack,
        });
      });
      if (this.listeProduitDansListeEmballage.length > 0) {
        //s'il y a des element dans la listeProduitDansListeEmballage
        do {
          let differenceQte = (index: any) => {
            return (
              qteProduitCommande -
              Number(this.listeProduitDansListeEmballage[index].qte)
            );
          };
          let emballage: any;
          let qteEmballage;
          let differenceQuantite = 0;
          for (let j = 0; j < this.listeProduitDansListeEmballage.length; j++) {
            //pour chaque emballage d'un produit
            if (j !== 0) {
              //tous les element sauf le premier element
              if (
                qteProduitCommande >=
                Number(this.listeProduitDansListeEmballage[j].qte)
              ) {
                //si qte commande > qte emballage
                if (differenceQte(j) < differenceQuantite) {
                  differenceQuantite = differenceQte(j);
                  let difference = differenceQte(j);
                  qteEmballage = 0;
                  do {
                    difference -= Number(
                      this.listeProduitDansListeEmballage[j].qte
                    );
                    qteEmballage++;
                  } while (difference >= 0);
                  emballage = this.listeProduitDansListeEmballage[j];
                }
              }
            } else if (j == 0) {
              //si c'est le premier element du liste
              if (
                qteProduitCommande >=
                Number(this.listeProduitDansListeEmballage[j].qte)
              ) {
                differenceQuantite = differenceQte(j);
                let difference = differenceQte(j);
                qteEmballage = 0;
                do {
                  difference -= Number(
                    this.listeProduitDansListeEmballage[j].qte
                  );
                  qteEmballage++;
                } while (difference >= 0);
                emballage = this.listeProduitDansListeEmballage[j];
              }
            }
          }
          qteProduitCommande -= Number(emballage.qte) * qteEmballage;
          listeEmballageProduit.push({
            emballage: emballage,
            qteEmballage: qteEmballage,
          });
        } while (qteProduitCommande > 0);
        this.listeArticlesDetail.push(
          new Article(
            this.articles[i].id,
            this.articles[i].nom,
            Number(this.articles[i].qte),
            0,
            this.articles[i].type,
            this.articles[i].numSerie,
            this.articles[i].produit4Gs,
            this.articles[i].numeroLots,
            listeEmballageProduit,
            listeEmballageChoisi
          )
        );
      }
    }
  }
  ouvrirBoiteDialogueEmballer(produit: any) {
    const dialogRef = this.dialog.open(BoiteDialogueEmballer, {
      width: '600px',
      maxWidth: '95vw',
      data: { produit: produit },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        produit.qteNonEmballe = result.qteNonEmballe;
        produit.listeEmballageChoisi = result.listeEmballageChoisi;
      }
      this.verifierValiditeListeProduits();
    });
  }
  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '600px',
      data: { produit: article },
    });
  }

  creerListeEmballageChoisi() {
    this.listeEmballageChoisi = [];
    this.listeArticlesDetail.forEach((article: any) => {
      this.listeEmballageChoisi = this.listeEmballageChoisi.concat(
        article.listeEmballageChoisi
      );
    });
  }

  getNombreArticles(article: any) {
    return article.qte * article.emballage.qte;
  }

  getDimensionsPack(article: any) {
    return (
      article.emballage.longueur +
      'x' +
      article.emballage.largeur +
      'x' +
      article.emballage.hauteur
    );
  }

  getVolumePack(article: any) {
    return article.emballage.volume * article.qte;
  }

  getPoidsPackNet(article: any) {
    return article.emballage.poids_total_net * article.qte;
  }

  getPoidsPackBrut(article: any) {
    return article.emballage.poids_emballage_total * article.qte;
  }

  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      nombrePack += emballage.qte;
    });
    return nombrePack;
  }

  get volumeTotal() {
    var volumeTotal = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      volumeTotal += emballage.emballage.volume;
    });
    return volumeTotal.toFixed(2);
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(2);
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(2);
  }

  verifierValiditeListeProduits() {
    this.estValide = true;
    this.listeArticlesDetail.forEach((element: any) => {
      element.qteNonEmballe !== 0 ? (this.estValide = false) : '';
    });
  }

  //bouton valider
  async validerModification() {
    await this.serviceCommande
      .deleteColisParReference(this.data.commande.referenceDocument)
      .toPromise();
    for (let i = 0; i < this.listeEmballageChoisi.length; i++) {
      let listeColisage: any = new FormData();
      let emballage = this.listeEmballageChoisi[i];
      listeColisage.append('reference', this.data.commande.referenceDocument);
      listeColisage.append('idEmballage', emballage.emballage.id);
      listeColisage.append('emballage', emballage.emballage.nomEmballage);
      listeColisage.append('idProduit', emballage.emballage.idProduit);
      listeColisage.append('produit', emballage.emballage.nomProduit);
      listeColisage.append(
        'quantite',
        Number(this.getNombreArticles(emballage))
      );
      listeColisage.append(
        'quantiteDansEmballage',
        Number(emballage.emballage.qte)
      );
      listeColisage.append('nombrePack', Number(emballage.qte));
      listeColisage.append('dimensions', this.getDimensionsPack(emballage));
      listeColisage.append('volume', Number(this.getVolumePack(emballage)));
      listeColisage.append('poidsNet', Number(this.getPoidsPackNet(emballage)));
      listeColisage.append(
        'poidsBrut',
        Number(this.getPoidsPackBrut(emballage))
      );
      await this.serviceCommande.creerColis(listeColisage).toPromise();
    }
  }
}

// -------------------------------------------------------------------------------------------------------------
//********************************************** boite-dialogue-info-commande **********************************
// -------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'boite-dialogue-info-commande',
  templateUrl: 'boite-dialogue-info-commande.html',
  styleUrls: ['boite-dialogue-info-commande.scss'],
})
export class InformationCommandeComponent implements OnInit {
  localisationClient: any;
  longitude: number;
  latitude: number;
  listeColisage: any;

  constructor(
    private dialogRef: MatDialogRef<InformationCommandeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceCommande: CommandeService,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    this.getLocalisationClient();
    this.getListeColisage();
  }

  async getLocalisationClient() {
    this.localisationClient = await this.serviceCommande
      .getPositionById(this.data.commande.idPosition)
      .toPromise();
    this.longitude = Number(this.localisationClient.longitude);
    this.latitude = Number(this.localisationClient.latitude);
  }

  async getListeColisage() {
    this.listeColisage = await this.serviceCommande
      .getListeColisParReference(this.data.commande.referenceDocument)
      .toPromise();
  }

  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeColisage.forEach((colis: any) => {
      nombrePack += colis.nombrePack;
    });
    return nombrePack;
  }

  get volumeTotal() {
    var volumeTotal = 0;
    this.listeColisage.forEach((colis: any) => {
      volumeTotal += colis.volume;
    });
    return volumeTotal.toFixed(2);
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(2);
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(2);
  }

  ouvrirBoiteDialogueModifierPosition(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierPositionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      this.getLocalisationClient();
      this.getListeColisage();
    });
  }

  ouvrirBoiteDialogueModifierColisage(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierColisage, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      this.getLocalisationClient();
      this.getListeColisage();
    });
  }
}

// -------------------------------------------------------------------------------------------------------------
//**************************************************** fonctions reutilisable **********************************
// -------------------------------------------------------------------------------------------------------------
async function getDetailFacture(detail: any) {
  //pour avoir les ids et les qtes des produits dans une facture
  var facture: any;
  var xmldata: any;
  var new_obj: any;
  var articles: any = [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        articles = [];
        facture = reader.result;
        var parseString = require('xml2js').parseString;
        let data1;
        parseString(atob(facture.substr(28)), function (err: any, result: any) {
          data1 = result.Facture;
        });
        xmldata = data1;
        if (xmldata.Produits[0].Produits_Simples[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_Simples[0].Produit.length;
            i++
          ) {
            new_obj = {};
            new_obj.id =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte[0];
            new_obj.type = 'Produit simple';

            articles.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_Series[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let numSerie: any = [];
            new_obj.id =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Qte[0];
            new_obj.type = 'Produit serie';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0]
                .N_Serie.length;
              j++
            ) {
              numSerie.push(
                xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0]
                  .N_Serie[j]
              );
            }
            new_obj.numSerie = numSerie;

            articles.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_4Gs[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let produit4Gs: any = [];
            let produit4G: any = {};
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte[0];
            new_obj.type = 'Produit 4G';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0]
                .Produit_4G.length;
              j++
            ) {
              produit4G.numSerie =
                xmldata.Produits[0].Produits_4Gs[0].Produit[
                  i
                ].Produit_4Gs[0].Produit_4G[j].N_Serie[0];
              produit4G.numImei1 =
                xmldata.Produits[0].Produits_4Gs[0].Produit[
                  i
                ].Produit_4Gs[0].Produit_4G[j].E1[0];
              produit4G.numImei2 =
                xmldata.Produits[0].Produits_4Gs[0].Produit[
                  i
                ].Produit_4Gs[0].Produit_4G[j].E2[0];
              produit4Gs.push(produit4G);
            }
            new_obj.produit4Gs = produit4Gs;

            articles.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_N_Lot) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_N_Lot[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let numeroLots: any = [];
            let numeroLot: any = {};
            new_obj.id = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Qte[0];
            new_obj.type = 'Numero Lot';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot
                .length;
              j++
            ) {
              numeroLot.numero =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Numero[0];
              numeroLot.quantite =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Qte[0];
              numeroLot.date =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Date[0];
              numeroLots.push(numeroLot);
            }
            new_obj.numeroLots = numeroLots;
            articles.push(new_obj);
          }
        }
        resolve(articles);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(detail);
  });
}
async function getDetailBL(detail: any) {
  //pour avoir les ids et les qtes des produits dans un bon livraison
  var BL: any;
  var xmldata: any;
  var new_obj: any;
  var articlesBl: any = [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        articlesBl = [];
        BL = reader.result;
        var parseString = require('xml2js').parseString;
        let data1;
        parseString(atob(BL.substr(28)), function (err: any, result: any) {
          data1 = result.Bon_Livraison;
        });
        xmldata = data1;
        if (xmldata.Produits[0].Produits_Simples[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_Simples[0].Produit.length;
            i++
          ) {
            new_obj = {};
            new_obj.id =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte[0];
            new_obj.type = 'Produit simple';

            articlesBl.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_Series[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let numSerie: any = [];
            new_obj.id =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_Series[0].Produit[i].Qte[0];
            new_obj.type = 'Produit serie';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0]
                .N_Serie.length;
              j++
            ) {
              numSerie.push(
                xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0]
                  .N_Serie[j]
              );
            }
            new_obj.numSerie = numSerie;

            articlesBl.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_4Gs[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let produit4Gs: any = [];
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte[0];
            new_obj.type = 'Produit 4G';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0]
                .Produit_4G.length;
              j++
            ) {
              produit4Gs.push({
                numSerie:
                  xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0]
                    .Produit_4G[j].N_Serie[0],
                numImei1:
                  xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0]
                    .Produit_4G[j].E1[0],
                numImei2:
                  xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0]
                    .Produit_4G[j].E2[0],
              });
            }
            new_obj.produit4Gs = produit4Gs;

            articlesBl.push(new_obj);
          }
        }
        if (xmldata.Produits[0].Produits_N_Lot) {
          for (
            let i = 0;
            i < xmldata.Produits[0].Produits_N_Lot[0].Produit.length;
            i++
          ) {
            new_obj = {};
            let numeroLots: any = [];
            let numeroLot: any = {};
            new_obj.id = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Id[0];
            new_obj.nom =
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Nom[0];
            new_obj.qte =
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Qte[0];
            new_obj.type = 'Produit 4G';
            for (
              let j = 0;
              j <
              xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot
                .length;
              j++
            ) {
              numeroLot.numero =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Numero[0];
              numeroLot.quantite =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Qte[0];
              numeroLot.date =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Date[0];
              numeroLots.push(numeroLot);
            }
            new_obj.numeroLots = numeroLots;
            articlesBl.push(new_obj);
          }
        }
        resolve(articlesBl);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(detail);
  });
}

// *************************************************** Classes *****************************************
class Article {
  id: number;
  nom: string;
  qte: number;
  type: string;
  listeEmballage: any[];
  numSerie: any[];
  produit4Gs: any[];
  numeroLots: any[];
  qteNonEmballe: number;
  listeEmballageChoisi: any[];

  constructor(
    id: number,
    nom: string,
    qte: number,
    qteNonEmballe: number,
    type: string,
    numSerie: any[],
    produit4Gs: any[],
    numeroLots: any[],
    listeEmballage: any[],
    listeEmballageChoisi: any[]
  ) {
    this.id = id;
    this.nom = nom;
    this.qte = qte;
    this.qteNonEmballe = qteNonEmballe;
    this.type = type;
    this.numSerie = numSerie;
    this.produit4Gs = produit4Gs;
    this.numeroLots = numeroLots;
    this.listeEmballage = listeEmballage;
    this.listeEmballageChoisi = listeEmballageChoisi;
  }
}

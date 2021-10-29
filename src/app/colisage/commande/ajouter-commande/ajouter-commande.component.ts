import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from 'src/app/colisage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajouter-commande',
  templateUrl: './ajouter-commande.component.html',
  styleUrls: ['./ajouter-commande.component.scss']
})
export class AjouterCommandeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  listeFacturesDB: any;
  listeBLsDB: any;
  listeClients: any;
  listeFactures: Facture[] = []
  listeBonsLivraison: BonLivraison[] = []
  listeCommandes: any = []
  displayedColumns: string[] = ['reference', 'idClient', 'nomClient', 'ville', 'adresse', 'dateCreation', 'actions'];
  dataSource = new MatTableDataSource<TableCommandes>();
  filtre: FormGroup;
  villes = [
    { nom: 'Ariana', valeur: 'Ariana' },
    { nom: 'Béja', valeur: 'Beja' },
    { nom: 'Ben Arous', valeur: 'Ben_Arous' },
    { nom: 'Bizerte', valeur: 'Bizerte' },
    { nom: 'Gabès', valeur: 'Gabes' },
    { nom: 'Nabeul', valeur: 'Nabeul' },
    { nom: 'Jendouba', valeur: 'Jendouba' },
    { nom: 'Kairouan', valeur: 'Kairouan' },
    { nom: 'Kasserine', valeur: 'Kasserine' },
    { nom: 'Kebili', valeur: 'Kebili' },
    { nom: 'Kef', valeur: 'Kef' },
    { nom: 'Mahdia', valeur: 'Mahdia' },
    { nom: 'Manouba', valeur: 'Manouba' },
    { nom: 'Medenine', valeur: 'Medenine' },
    { nom: 'Monastir', valeur: 'Monastir' },
    { nom: 'Gafsa', valeur: 'Gafsa' },
    { nom: 'Sfax', valeur: 'Sfax' },
    { nom: 'Sidi Bouzid', valeur: 'Sidi_Bouzid' },
    { nom: 'Siliana', valeur: 'Siliana' },
    { nom: 'Sousse', valeur: 'Sousse' },
    { nom: 'Tataouine', valeur: 'Tataouine' },
    { nom: 'Tozeur', valeur: 'Tozeur' },
    { nom: 'Tunis', valeur: 'Tunis' },
    { nom: 'Zaghouan', valeur: 'Zaghouan' },
  ]

  constructor(private service: ColisageService, private dialogue: MatDialog, private fb: FormBuilder) { }

  async ngOnInit() {
    this.filtre = this.fb.group({
      type: 'F-',
      id: '',
      ville: '',
      trie: 'date-ascendant'
    })
    await this.getListeClients();
    await this.getListeFactures();
    await this.getListeBLs();
    this.listeCommandes = this.listeFactures.concat(this.listeBonsLivraison);
    this.dataSource.data = this.listeCommandes.sort((commandeA: any, commandeB: any) => commandeA.dateCreation > commandeB.dateCreation ? 1 : -1) as TableCommandes[];
  }

  get reference() {
    var type = this.filtre.get("type").value;
    var id = this.filtre.get("id").value;
    return type + id;
  }

  get idCommande() {
    return this.filtre.get("id").value;
  }

  get ville() {
    return this.filtre.get("ville").value;
  }
  get typeDeTrie() {
    return this.filtre.get("trie").value;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  async getListeFactures() {
    this.listeFacturesDB = await this.service.filtreFacture("etat", "Validée").toPromise();
    this.listeFacturesDB.forEach((facture: any) => {
      var client = this.listeClients.filter((client: any) => Number(client.id_Clt) === Number(facture.id_Clt));
      var factureConstruit: Facture = new Facture;
      factureConstruit.id = facture.id_Facture;
      factureConstruit.reference = "F-" + facture.id_Facture;
      factureConstruit.idClient = Number(facture.id_Clt);
      factureConstruit.nomClient = client[0].nom_Client;
      factureConstruit.ville = client[0].ville;
      factureConstruit.adresse = client[0].adresse;
      factureConstruit.contact = client[0].contact;
      factureConstruit.email = client[0].email;
      factureConstruit.telephone = Number(client[0].tel1);
      factureConstruit.typePieceIdentite = client[0].type_Piece_Identite;
      factureConstruit.numeroPieceIdentite = Number(client[0].n_Piece_Identite);
      factureConstruit.categorieClient = client[0].categorie_Client;
      factureConstruit.dateCreation = new Date(facture.date_Creation);
      this.listeFactures.push(factureConstruit);
    });
  }

  async getListeBLs() {
    this.listeBLsDB = await this.service.filtreBonLivraison("etat", "Validée").toPromise();
    this.listeBLsDB.forEach((bonLivraison: any) => {
      var client = this.listeClients.filter((client: any) => Number(client.id_Clt) === Number(bonLivraison.id_Clt));
      var bonLivraisonConstruit: BonLivraison = new BonLivraison;
      bonLivraisonConstruit.id = bonLivraison.id_Bl;
      bonLivraisonConstruit.reference = "BL-" + bonLivraison.id_Bl;
      bonLivraisonConstruit.idClient = Number(bonLivraison.id_Clt);
      bonLivraisonConstruit.nomClient = client[0].nom_Client;
      bonLivraisonConstruit.ville = client[0].ville;
      bonLivraisonConstruit.adresse = client[0].adresse;
      bonLivraisonConstruit.contact = client[0].contact;
      bonLivraisonConstruit.email = client[0].email;
      bonLivraisonConstruit.telephone = Number(client[0].tel1);
      bonLivraisonConstruit.typePieceIdentite = client[0].type_Piece_Identite;
      bonLivraisonConstruit.numeroPieceIdentite = Number(client[0].n_Piece_Identite);
      bonLivraisonConstruit.categorieClient = client[0].categorie_Client;
      bonLivraisonConstruit.dateCreation = new Date(bonLivraison.date_Creation);
      this.listeBonsLivraison.push(bonLivraisonConstruit);
    });
  }

  async getListeClients() {
    this.listeClients = await this.service.clients().toPromise();
  }

  ouvrirBoiteDialogueInfo(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueInfo, {
      width: '1000px',
      data: { commande: commande }
    });
  }

  ouvrirBoiteDialogueCreerCommande(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueCreerCommande, {
      width: '1000px',
      data: { commande: commande }
    });
  }

  filtrerParId() {
    if (this.idCommande) {
      this.dataSource.data = this.listeCommandes.filter((commande: any) => commande.reference === this.reference) as TableCommandes[];
    } else {
      this.dataSource.data = this.listeCommandes as TableCommandes[];
    }

  }

  filtrerParVille() {
    if (this.ville) {
      this.dataSource.data = this.listeCommandes.filter((commande: any) => commande.ville === this.ville) as TableCommandes[];
    } else {
      this.dataSource.data = this.listeCommandes as TableCommandes[];
    }
  }


}



// *********************************** Boite de dialogue info *********************************************************
@Component({
  selector: 'boite-dialogue-info',
  templateUrl: './boite-dialogue-info.html',
  styleUrls: ['./boite-dialogue-info.scss']
})

export class BoiteDialogueInfo implements OnInit {
  indicateurTypeCommande: String;
  typeDocument: String;
  articles: any;
  listeArticlesDetail: any = [];
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
  constructor(public dialogRef: MatDialogRef<BoiteDialogueInfo>, @Inject(MAT_DIALOG_DATA) public data: any, public serviceColisage: ColisageService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.indicateurTypeCommande = this.data.commande.reference.split("-")[0];
    this.getTypeCommande();
    await this.getListeEmballage();
    this.getDetail();
  }

  getTypeCommande() {
    if (this.indicateurTypeCommande === "F") {
      this.typeDocument = "Facture";
    }
    else {
      this.typeDocument = "Bon Livraison";
    }
  }
  async getListeEmballage() {
    this.listeEmballage = await this.serviceColisage.listeEmballage().toPromise();
  }

  async getDetail() {
    if (this.indicateurTypeCommande === "F") {
      var detail = await this.serviceColisage.Detail_Facture(this.data.commande.id).toPromise();
      this.articles = await getDetailFacture(detail);
    }
    else {
      var detail = await this.serviceColisage.Detail_BL(this.data.commande.id).toPromise();
      this.articles = await getDetailBL(detail);
    }
    for (let i = 0; i < this.articles.length; i++) {
      let qteProduitCommande = this.articles[i].qte;
      let listeEmballageProduit = [];
      this.listeProduitDansListeEmballage = this.listeEmballage.filter((emballage: any) => emballage.idProduit === this.articles[i].id);
      if (this.listeProduitDansListeEmballage.length > 0) {
        do {
          let differenceQte = (index: any) => { return qteProduitCommande - this.listeProduitDansListeEmballage[index].qte }
          let emballage: any;
          let qteEmballage
          for (let j = 0; j < this.listeProduitDansListeEmballage.length; j++) {
            if (j !== 0) {
              if ((qteProduitCommande >= this.listeProduitDansListeEmballage[j].qte) && (differenceQte(j) < differenceQte(j - 1))) {
                let difference = differenceQte(j);
                qteEmballage = 0;
                do {
                  difference -= this.listeProduitDansListeEmballage[j].qte
                  qteEmballage++;
                } while (difference > 0);
                emballage = this.listeProduitDansListeEmballage[j];
              }
            } else if ((qteProduitCommande >= this.listeProduitDansListeEmballage[j].qte) && j === 0) {
              let difference = differenceQte(j);
              qteEmballage = 0;
              do {
                difference -= this.listeProduitDansListeEmballage[j].qte
                qteEmballage++;
              } while (difference > 0);
              emballage = this.listeProduitDansListeEmballage[j];
            }
          }
          qteProduitCommande -= (emballage.qte * qteEmballage);
          listeEmballageProduit.push({ emballage: emballage, qteEmballage: qteEmballage });

        } while (qteProduitCommande > 0);
        this.listeArticlesDetail.push(new Article(this.articles[i].id, this.articles[i].nom, this.articles[i].qte, this.articles[i].qte, this.articles[i].type, this.articles[i].numSerie, this.articles[i].produit4Gs, this.articles[i].numeroLots, listeEmballageProduit, []));
      } else {
      }

    }
    console.log(this.articles)
  }

  fermerBoiteDialogue() {
    this.dialogRef.close()
  }

  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxHeight: '600px',
      data: { produit: article }
    })
  }
}

// *********************************** Boite de dialogue créer commande ***********************************************
@Component({
  selector: 'boite-dialogue-creer-commande',
  templateUrl: 'boite-dialogue-creer-commande.html',
  styleUrls: ['boite-dialogue-creer-commande.scss']
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
    latitude: 34.74056, longitude: 10.76028
  };
  positionsClientEnregistree: any = [];
  positionEstModifie: boolean = false;
  constructor(private fb: FormBuilder, public dialgRef: MatDialogRef<BoiteDialogueCreerCommande>, @Inject(MAT_DIALOG_DATA) public data: any, public serviceColisage: ColisageService, public dialog: MatDialog) { }

  async ngOnInit() {
    this.firstFormGroup = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleAdresse: ''
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    this.getTypeDocument();
    await this.getListeEmballage();
    await this.getPositionsEnregistrees();
    this.getDetail();
  }

  getTypeDocument() {
    console.log(this.data.commande)
    this.indicateurTypeCommande = this.data.commande.reference.split("-")[0]
    if (this.indicateurTypeCommande === "F")
      this.typeDocument = "Facture";
    else
      this.typeDocument = "Bon Livraison"
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

  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceColisage.positionClient(this.data.commande.idClient).toPromise();
    console.log(this.positionsClientEnregistree)
  }

  ajouterAdresse() {
    this.positionsClientEnregistree.push({ adresse: this.firstFormGroup.get('nouvelleAdresse').value, latitude: '', longitude: '' })
  }

  selectionnerAdresse() {
    this.positionClient = this.firstFormGroup.get('adresse').value;
    this.getPositionClient();
  }
  async getListeEmballage() {
    this.listeEmballage = await this.serviceColisage.listeEmballage().toPromise();
  }
  async getDetail() {
    if (this.indicateurTypeCommande === "F") {
      var detail = await this.serviceColisage.Detail_Facture(this.data.commande.id).toPromise();
      this.articles = await getDetailFacture(detail);
    }
    else {
      var detail = await this.serviceColisage.Detail_BL(this.data.commande.id).toPromise();
      this.articles = await getDetailBL(detail);
      console.log(this.articles);
    }
    for (let i = 0; i < this.articles.length; i++) { //pour chaque article
      let qteProduitCommande = Number(this.articles[i].qte);
      let listeEmballageProduit = [];
      this.listeProduitDansListeEmballage = this.listeEmballage.filter((emballage: any) => emballage.idProduit === this.articles[i].id);
      if (this.listeProduitDansListeEmballage.length > 0) { //s'il y a des element dans la listeProduitDansListeEmballage
        do {
          let differenceQte = (index: any) => { return qteProduitCommande - Number(this.listeProduitDansListeEmballage[index].qte) }
          let emballage: any;
          let qteEmballage;
          let differenceQuantite = 0;
          for (let j = 0; j < this.listeProduitDansListeEmballage.length; j++) { //pour chaque emballage d'un produit
            if (j !== 0) { //tous les element sauf le premier element
              // console.log((qteProduitCommande >= Number(this.listeProduitDansListeEmballage[j].qte)) && (differenceQte(j) < differenceQte(j - 1)))
              if (qteProduitCommande >= Number(this.listeProduitDansListeEmballage[j].qte)) { //si qte commande > qte emballage
                if (differenceQte(j) < differenceQuantite) {
                  differenceQuantite = differenceQte(j);
                  let difference = differenceQte(j);
                  qteEmballage = 0;
                  do {
                    difference -= Number(this.listeProduitDansListeEmballage[j].qte)
                    qteEmballage++;
                  } while (difference >= 0);
                  emballage = this.listeProduitDansListeEmballage[j];
                }

              }
            } else if (j == 0) { //si c'est le premier element du liste
              if (qteProduitCommande >= Number(this.listeProduitDansListeEmballage[j].qte)) {
                differenceQuantite = differenceQte(j);
                let difference = differenceQte(j);
                qteEmballage = 0;
                do {
                  difference -= Number(this.listeProduitDansListeEmballage[j].qte)
                  qteEmballage++;
                } while (difference >= 0);
                emballage = this.listeProduitDansListeEmballage[j];
              }

            }
          }
          qteProduitCommande -= (Number(emballage.qte) * qteEmballage);
          listeEmballageProduit.push({ emballage: emballage, qteEmballage: qteEmballage });

        } while (qteProduitCommande > 0);
        this.listeArticlesDetail.push(new Article(this.articles[i].id, this.articles[i].nom, Number(this.articles[i].qte), Number(this.articles[i].qte), this.articles[i].type, this.articles[i].numSerie, this.articles[i].produit4Gs, this.articles[i].numeroLots, listeEmballageProduit, []));
      }

    }
  }

  positionerMarquer(event: any) { //pour positionner un marqueur sur le map
    if (!this.positionExiste) {
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }

  }
  modifierPositionMarquer(event: any) { //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;

  }

  ouvrirBoiteDialogueEmballer(produit: any) {
    const dialogRef = this.dialog.open(BoiteDialogueEmballer, {
      width: '600px',
      data: { produit: produit }
    })
    dialogRef.afterClosed().subscribe(result => {
      produit.qteNonEmballe = result.qteNonEmballe;
      produit.listeEmballageChoisi = result.listeEmballageChoisi;
    });
  }
  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxHeight: '600px',
      data: { produit: article }
    })
  }
  creerListeEmballageChoisi() {
    this.listeArticlesDetail.forEach((article: any) => {
      this.listeEmballageChoisi = this.listeEmballageChoisi.concat(article.listeEmballageChoisi)
    });
  }
  getNombreArticles(article: any) {
    return article.qte * article.emballage.qte
  }

  getDimensionsPack(article: any) {
    return article.emballage.longueur + 'x' + article.emballage.largeur + 'x' + article.emballage.hauteur
  }

  getVolumePack(article: any) {
    return article.emballage.volume * article.qte
  }

  getPoidsPackNet(article: any) {
    return article.emballage.poids_total_net * article.qte
  }

  getPoidsPackBrut(article: any) {
    return article.emballage.poids_emballage_total * article.qte
  }

  async enregistrer() {
    let commande: any = new FormData
    if (this.positionClient.idClient === undefined) {
      let position: any = new FormData;
      this.positionClient.longitude = this.lng;
      this.positionClient.latitude = this.lat;
      position.append('idClient', this.data.commande.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.positionClient.longitude);
      position.append('latitude', this.positionClient.latitude);

      await this.serviceColisage.creerPositionClient(position).toPromise();
    } else if (this.positionEstModifie) {
      let position: any = new FormData;
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      this.serviceColisage.modifierPositionClient(position).toPromise();
    }

    for (let i = 0; i < this.listeEmballageChoisi.length; i++) {
      let listeColisage: any = new FormData;
      let emballage = this.listeEmballageChoisi[i];
      listeColisage.append('reference', this.data.commande.reference)
      listeColisage.append('emballage', emballage.emballage.nomEmballage)
      listeColisage.append('produit', emballage.emballage.nomProduit)
      listeColisage.append('quantite', Number(this.getNombreArticles(emballage)))
      listeColisage.append('nombrePack', Number(emballage.qte))
      listeColisage.append('dimensions', this.getDimensionsPack(emballage))
      listeColisage.append('volume', Number(this.getVolumePack(emballage)))
      listeColisage.append('poidsNet', Number(this.getPoidsPackNet(emballage)))
      listeColisage.append('poidsBrut', Number(this.getPoidsPackBrut(emballage)))
      console.log(typeof Number(this.getNombreArticles(emballage)))
      console.log(typeof Number(emballage.qte))
      console.log(typeof Number(this.getVolumePack(emballage)))
      console.log(typeof Number(this.getPoidsPackNet(emballage)))
      console.log(typeof Number(this.getPoidsPackBrut(emballage)))
      await this.serviceColisage.creerColis(listeColisage).toPromise();

    }

    commande.append('referenceDocument', this.data.commande.reference)
    commande.append('idClient', this.data.commande.idClient)
    commande.append('nomClient', this.data.commande.nomClient)
    commande.append('contact', this.data.commande.contact)
    commande.append('telephone', this.data.commande.telephone)
    commande.append('categorieClient', this.data.commande.categorieClient)
    commande.append('ville', this.data.commande.ville)
    commande.append('adresse', this.data.commande.adresse)
    commande.append('typePieceIdentite', this.data.commande.typePieceIdentite)
    commande.append('numPieceIdentite', this.data.commande.numeroPieceIdentite)
    commande.append('dateCreation', this.data.commande.dateCreation)

    await this.serviceColisage.creerCommande(commande).toPromise();
  }

  get nombrePackTotal() {
    var nombrePack = 0
    this.listeEmballageChoisi.forEach((emballage: any) => {
      nombrePack += emballage.qte
    });
    return nombrePack
  }

  get volumeTotal() {
    var volumeTotal = 0
    this.listeEmballageChoisi.forEach((emballage: any) => {
      volumeTotal += emballage.emballage.volume
    });
    return volumeTotal.toFixed(2)
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(2)
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(2)
  }

}

// ***********************************Boite de dialogue Emballer ******************************************************
@Component({
  selector: 'boite-dialogue-emballer',
  templateUrl: 'boite-dialogue-emballer.html',
  styleUrls: ['boite-dialogue-emballer.scss']
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
  constructor(public dialogRef: MatDialogRef<BoiteDialogueEmballer>, @Inject(MAT_DIALOG_DATA) public data: any, private serviceColisage: ColisageService, private fb: FormBuilder) { }

  async ngOnInit() {
    this.quantiteNonEmballee = Number(this.data.produit.qte);
    this.quantiteNonEmballeePrecedente = Number(this.data.produit.qte);
    this.form = this.fb.group({
      qte: this.fb.array([])

    })
    await this.getListeEmballages();
    await this.ajouterChampQte();
    this.ajouterQuantiteEmballage()
    console.log(this.data.produit)
  }
  get qteForm() {
    return this.form.get('qte') as FormArray;
  }
  async ajouterChampQte() {
    this.listeEmballages.forEach((emballage: any) => {
      let qte: any;
      if (emballage.qte > this.quantiteNonEmballee) {
        qte = this.fb.group({
          qte: [{ value: 0, disabled: true }, [Validators.max(Number(this.data.produit.qte) / Number(emballage.qte)), Validators.min(0)]]
        })
      } else {
        if (this.data.produit.listeEmballageChoisi.length > 0) {
          const emb = this.data.produit.listeEmballageChoisi.filter((emb: any) => emb.emballage.id === emballage.id)
          qte = this.fb.group({
            qte: [emb[0].qte, [Validators.min(0)]]
          })
        } else {
          qte = this.fb.group({
            qte: [0, [Validators.min(0)]]
          })
        }


      }
      this.qteForm.push(qte);
      this.listeMax.push(Number(this.data.produit.qte) / Number(emballage.qte))
    });
  }
  async getListeEmballages() {
    this.listeEmballages = await this.serviceColisage.listeEmballage().toPromise();
    this.listeEmballages = this.listeEmballages.filter((emballage: any) => emballage.idProduit === this.data.produit.id);
    this.listeEmballages = this.listeEmballages.sort((emballage1: any, emballage2: any) => Number(emballage1.qte) > Number(emballage2.qte) ? 1 : -1)
  }
  updateMax(i: any) {
    for (let j = 0; j < this.listeMax.length; j++) {
      if (j !== i) {
        this.listeMax[j] = (this.quantiteNonEmballee / Number(this.listeEmballages[j].qte) + this.form.get('qte').value[j].qte);
        this.listeMax[j] = Math.trunc(this.listeMax[j])
        console.log(this.listeMax[j])
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
        quantiteProdEmballe += Number(this.form.get('qte').value[i].qte) * Number(this.listeEmballages[i].qte);
        listeEmballage.push({ emballage: this.listeEmballages[i], qte: this.form.get('qte').value[i].qte })
      }
    }
    try {
      if ((this.quantiteNonEmballee - quantiteProdEmballe) >= 0) {
        this.quantiteNonEmballee -= quantiteProdEmballe;
      } else {
        throw new Error();

      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Valeur invalide...',
        text: 'Quantité necessaire est dépassée!'
      }).then((result) => {
        this.listeEmballages.forEach((emballage: any) => {
          if ((this.form.get('qte').value[j].qte * emballage.qte) > this.quantiteNonEmballee) {
            qteFormArray.at(j).get('qte').setValue(0);
            j++;
          }
        });
      })
    }
    this.listeEmballagesChoisi = listeEmballage;
  }
  donnerSuggestion(emballage: any) {
    var listeSuggestion = this.data.produit.listeEmballage.filter((emb: any) => emb.emballage.id === emballage.id);
    var qteSuggestion = 0;
    if (listeSuggestion.length > 0) {
      qteSuggestion = listeSuggestion[0].qteEmballage;
    }
    return qteSuggestion
  }
  valider() {
    this.listeEmballagesChoisi = this.listeEmballagesChoisi.filter((emballage: any) => emballage.qte > 0)
    const result = { qteNonEmballe: this.quantiteNonEmballee, listeEmballageChoisi: this.listeEmballagesChoisi }
    this.dialogRef.close(result);
  }
  annuler() {
    const result = { qteNonEmballe: this.data.produit.qteNonEmballe, listeEmballageChoisi: this.data.produit.listeEmballageChoisi }
    this.dialogRef.close(result);
  }
}
// --------------------------------------------------------------------------------------------------------------------
// *********************************** Boite Dialogue Detail produit **************************************************
// --------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'boite-dialogue-detail-produit',
  templateUrl: 'boite-dialogue-detail-produit.html',
  styleUrls: ['boite-dialogue-detail-produit.scss']
})

export class BoiteDialogueDetailProduit implements OnInit {
  constructor(public dialogRef: MatDialogRef<BoiteDialogueDetailProduit>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() { }
}


// --------------------------------------------------------------------------------------------------------------------
//************************************ Declaration des classe pour construire les objets ******************************
// --------------------------------------------------------------------------------------------------------------------
class Facture {
  id: Number;
  reference: String;
  idClient: Number;
  nomClient: String;
  ville: String;
  adresse: String;
  contact: String;
  email: String;
  telephone: Number;
  typePieceIdentite: String;
  numeroPieceIdentite: Number;
  categorieClient: String;
  dateCreation: Date;

  constructor() { }

}
class BonLivraison {
  id: Number;
  reference: String;
  idClient: Number;
  nomClient: String;
  ville: String;
  adresse: String;
  contact: String;
  email: String;
  telephone: Number;
  typePieceIdentite: String;
  numeroPieceIdentite: Number;
  categorieClient: String;
  dateCreation: Date;

  constructor() { }

}
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
  listeEmballageChoisi: any[]

  constructor(id: number, nom: string, qte: number, qteNonEmballe: number, type: string, numSerie: any[], produit4Gs: any[], numeroLots: any[], listeEmballage: any[], listeEmballageChoisi: any[]) {
    this.id = id;
    this.nom = nom
    this.qte = qte;
    this.qteNonEmballe = qteNonEmballe
    this.type = type;
    this.numSerie = numSerie
    this.produit4Gs = produit4Gs
    this.numeroLots = numeroLots
    this.listeEmballage = listeEmballage;
    this.listeEmballageChoisi = listeEmballageChoisi;
  }

}

// -----------------------------------------------------------------------------------------
// ******************************* Interfaces pour afficher les tableau ********************
// -----------------------------------------------------------------------------------------
interface TableCommandes {
  id: Number;
  reference: String;
  idClient: Number;
  nomClient: String;
  ville: String;
  adresse: String;
  contact: String;
  email: String;
  telephone: Number;
  typePieceIdentite: String;
  numeroPieceIdentite: Number;
  categorieClient: String;
  dateCreation: Date;
}



// -------------------------------------------------------------------------------------------------------------
//**************************************************** fonctions reutilisable **********************************
// -------------------------------------------------------------------------------------------------------------
async function getDetailFacture(detail: any) { //pour avoir les ids et les qtes des produits dans une facture
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

        })
        xmldata = data1
        if (xmldata.Produits[0].Produits_Simples[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Simples[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_Simples[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_Simples[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte[0];
            new_obj.type = "Produit simple";

            articles.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

            new_obj = {}
            let numSerie: any = []
            new_obj.id = xmldata.Produits[0].Produits_Series[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_Series[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_Series[0].Produit[i].Qte[0];
            new_obj.type = "Produit serie";
            for (let j = 0; j < xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0].N_Serie.length; j++) {
              numSerie.push(xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0].N_Serie[j])

            }
            new_obj.numSerie = numSerie;

            articles.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

            new_obj = {}
            let produit4Gs: any = [];
            let produit4G: any = {};
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte[0];
            new_obj.type = "Produit 4G";
            for (let j = 0; j < xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G.length; j++) {
              produit4G.numSerie = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].N_Serie[0];
              produit4G.numImei1 = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].E1[0];
              produit4G.numImei2 = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].E2[0];
              produit4Gs.push(produit4G);
            }
            new_obj.produit4Gs = produit4Gs;

            articles.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_N_Lot) {
          for (let i = 0; i < xmldata.Produits[0].Produits_N_Lot[0].Produit.length; i++) {

            new_obj = {}
            let numeroLots: any = [];
            let numeroLot: any = {};
            new_obj.id = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Qte[0];
            new_obj.type = "Numero Lot";
            for (let j = 0; j < xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot.length; j++) {
              numeroLot.numero = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Numero[0];
              numeroLot.quantite = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Qte[0];
              numeroLot.date = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Date[0];
              numeroLots.push(numeroLot);
            }
            new_obj.numeroLots = numeroLots;
            articles.push(new_obj)
          }
        }
        resolve(articles)
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(detail);
  });
}
async function getDetailBL(detail: any) {  //pour avoir les ids et les qtes des produits dans un bon livraison
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

        })
        xmldata = data1
        if (xmldata.Produits[0].Produits_Simples[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Simples[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_Simples[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_Simples[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte[0];
            new_obj.type = "Produit simple";

            articlesBl.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

            new_obj = {}
            let numSerie: any = []
            new_obj.id = xmldata.Produits[0].Produits_Series[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_Series[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_Series[0].Produit[i].Qte[0];
            new_obj.type = "Produit serie";
            for (let j = 0; j < xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0].N_Serie.length; j++) {
              numSerie.push(xmldata.Produits[0].Produits_Series[0].Produit[i].N_Series[0].N_Serie[j])

            }
            new_obj.numSerie = numSerie;

            articlesBl.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

            new_obj = {}
            let produit4Gs: any = [];
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte[0];
            new_obj.type = "Produit 4G";
            for (let j = 0; j < xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G.length; j++) {
              produit4Gs.push({
                numSerie: xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].N_Serie[0],
                numImei1: xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].E1[0],
                numImei2: xmldata.Produits[0].Produits_4Gs[0].Produit[i].Produit_4Gs[0].Produit_4G[j].E2[0]
              });
            }
            new_obj.produit4Gs = produit4Gs;

            articlesBl.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_N_Lot) {
          for (let i = 0; i < xmldata.Produits[0].Produits_N_Lot[0].Produit.length; i++) {

            new_obj = {}
            let numeroLots: any = [];
            let numeroLot: any = {};
            new_obj.id = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Id[0];
            new_obj.nom = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Nom[0];
            new_obj.qte = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].Qte[0];
            new_obj.type = "Produit 4G";
            for (let j = 0; j < xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot.length; j++) {
              numeroLot.numero = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Numero[0];
              numeroLot.quantite = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Qte[0];
              numeroLot.date = xmldata.Produits[0].Produits_N_Lot[0].Produit[i].N_Lots[0].N_Lot[j].Date[0];
              numeroLots.push(numeroLot);
            }
            new_obj.numeroLots = numeroLots;
            articlesBl.push(new_obj)
          }
        }
        resolve(articlesBl)
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(detail);
  }
  )
}

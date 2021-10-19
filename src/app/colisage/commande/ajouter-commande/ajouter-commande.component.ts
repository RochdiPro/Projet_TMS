import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from 'src/app/colisage.service';

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
      width: '800px',
      data: { commande: commande }
    });
  }

  ouvrirBoiteDialogueCreerCommande(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueCreerCommande, {
      width: '800px',
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

  trierTableau() {
    switch (this.typeDeTrie) {
      case "date-ascendant":
        this.dataSource.data = this.listeCommandes.sort((commandeA: any, commandeB: any) => commandeA.dateCreation > commandeB.dateCreation ? 1 : -1) as TableCommandes[];
        break;
      case "date-descendant":
        this.dataSource.data = this.listeCommandes.sort((commandeA: any, commandeB: any) => commandeA.dateCreation > commandeB.dateCreation ? -1 : 1) as TableCommandes[];
        break;
      case "nom-ascendant":
        this.dataSource.data = this.listeCommandes.sort((commandeA: any, commandeB: any) => commandeA.nomClient > commandeB.nomClient ? 1 : -1) as TableCommandes[];
        break;
      case "nom-descendant":
        this.dataSource.data = this.listeCommandes.sort((commandeA: any, commandeB: any) => commandeA.nomClient > commandeB.nomClient ? -1 : 1) as TableCommandes[];
        break;

      default:
        break;
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
  listeColisage: any;
  constructor(public dialogRef: MatDialogRef<BoiteDialogueInfo>, @Inject(MAT_DIALOG_DATA) public data: any, public serviceColisage: ColisageService) { }

  async ngOnInit() {
    this.indicateurTypeCommande = this.data.commande.reference.split("-")[0];
    this.getTypeCommande();
    await this.getDetail();
  }

  getTypeCommande() {
    if (this.indicateurTypeCommande === "F") {
      this.typeDocument = "Facture";
    }
    else {
      this.typeDocument = "Bon Livraison";
    }
  }
  async getListeColisage(){
    this.listeColisage = await this.serviceColisage.listeColisage().toPromise();
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

  }

  fermerBoiteDialogue() {
    this.dialogRef.close()
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
  constructor(public dialgRef: MatDialogRef<BoiteDialogueCreerCommande>, @Inject(MAT_DIALOG_DATA) public data: any, public serviceColisage: ColisageService) { }

  ngOnInit() {
    this.indicateurTypeCommande = this.data.commande.reference.split("-")[0]
    if (this.indicateurTypeCommande === "F")
      this.typeDocument = "Facture";
    else
      this.typeDocument = "Bon Livraison";
  }

}


//************************************ Declaration des classe pour construire les objets ******************************
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

// ******************************* Interfaces pour afficher les tableau ********************
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
//************************** fonctions reutilisable ***************
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
            new_obj.id = xmldata.Produits[0].Produits_Simples[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte;

            articles.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_Series[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_Series[0].Produit[i].Qte;

            articles.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte;

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
            new_obj.id = xmldata.Produits[0].Produits_Simples[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte;

            articlesBl.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_Series[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_Series[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_Series[0].Produit[i].Qte;

            articlesBl.push(new_obj)
          }
        }
        if (xmldata.Produits[0].Produits_4Gs[0].Produit) {
          for (let i = 0; i < xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

            new_obj = {}
            new_obj.id = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id;
            new_obj.qte = xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte;

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

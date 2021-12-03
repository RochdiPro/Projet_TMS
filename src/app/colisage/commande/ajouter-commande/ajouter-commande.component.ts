import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  BoiteDialogueCreerCommande,
  BoiteDialogueInfo,
} from '../dialogs/dialogs.component';
import { CommandeService } from '../services/commande.service';
// svp installer le package xlsx "npm i xlsx"
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-ajouter-commande',
  templateUrl: './ajouter-commande.component.html',
  styleUrls: ['./ajouter-commande.component.scss'],
})
export class AjouterCommandeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  listeFacturesDB: any;
  listeBLsDB: any;
  listeClients: any;
  listeFactures: Facture[] = [];
  listeBonsLivraison: BonLivraison[] = [];
  listeCommandes: any = [];
  displayedColumns: string[] = [
    'reference',
    'idClient',
    'nomClient',
    'ville',
    'adresse',
    'dateCreation',
    'actions',
  ];
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
  ];

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  estManuel: false;
  data: [][];

  constructor(
    private serviceCommande: CommandeService,
    private dialogue: MatDialog,
    private fb: FormBuilder
  ) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1000200');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  async ngOnInit() {
    this.filtre = this.fb.group({
      type: 'F-',
      id: '',
      ville: '',
      trie: 'date-ascendant',
    });
    await this.getListeClients();
    if (this.estManuel) {
      this.listeCommandes = [];
    } else {
      await this.getListeFactures();
      await this.getListeBLs();
      this.listeCommandes = this.listeFactures.concat(this.listeBonsLivraison);
      this.afficherListeCommandes();
    }
  }

  afficherListeCommandes() {
    this.dataSource.data = this.listeCommandes.sort(
      (commandeA: any, commandeB: any) =>
        commandeA.dateCreation > commandeB.dateCreation ? 1 : -1
    ) as TableCommandes[];
  }

  get reference() {
    var type = this.filtre.get('type').value;
    var id = this.filtre.get('id').value;
    return type + id;
  }

  get idCommande() {
    return this.filtre.get('id').value;
  }

  get ville() {
    return this.filtre.get('ville').value;
  }
  get typeDeTrie() {
    return this.filtre.get('trie').value;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getListeFactures() {
    this.listeFacturesDB = await this.serviceCommande
      .filtreFacture('etat', 'Validée')
      .toPromise();
    this.listeFacturesDB.forEach((facture: any) => {
      var client = this.listeClients.filter(
        (client: any) => Number(client.id_Clt) === Number(facture.id_Clt)
      );
      var factureConstruit: Facture = new Facture();
      factureConstruit.id = facture.id_Facture;
      factureConstruit.reference = 'F-' + facture.id_Facture;
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
    this.listeBLsDB = await this.serviceCommande
      .filtreBonLivraison('etat', 'Validée')
      .toPromise();
    this.listeBLsDB.forEach((bonLivraison: any) => {
      var client = this.listeClients.filter(
        (client: any) => Number(client.id_Clt) === Number(bonLivraison.id_Clt)
      );
      var bonLivraisonConstruit: BonLivraison = new BonLivraison();
      bonLivraisonConstruit.id = bonLivraison.id_Bl;
      bonLivraisonConstruit.reference = 'BL-' + bonLivraison.id_Bl;
      bonLivraisonConstruit.idClient = Number(bonLivraison.id_Clt);
      bonLivraisonConstruit.nomClient = client[0].nom_Client;
      bonLivraisonConstruit.ville = client[0].ville;
      bonLivraisonConstruit.adresse = client[0].adresse;
      bonLivraisonConstruit.contact = client[0].contact;
      bonLivraisonConstruit.email = client[0].email;
      bonLivraisonConstruit.telephone = Number(client[0].tel1);
      bonLivraisonConstruit.typePieceIdentite = client[0].type_Piece_Identite;
      bonLivraisonConstruit.numeroPieceIdentite = Number(
        client[0].n_Piece_Identite
      );
      bonLivraisonConstruit.categorieClient = client[0].categorie_Client;
      bonLivraisonConstruit.dateCreation = new Date(bonLivraison.date_Creation);
      this.listeBonsLivraison.push(bonLivraisonConstruit);
    });
  }

  async getListeClients() {
    this.listeClients = await this.serviceCommande.clients().toPromise();
  }

  ouvrirBoiteDialogueInfo(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueInfo, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande },
    });
  }

  ouvrirBoiteDialogueCreerCommande(commande: any) {
    console.log(commande);
    const dialogRef = this.dialogue.open(BoiteDialogueCreerCommande, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { commande: commande },
    });
  }

  filtrerParId() {
    if (this.idCommande) {
      this.dataSource.data = this.listeCommandes.filter(
        (commande: any) => commande.reference === this.reference
      ) as TableCommandes[];
    } else {
      this.dataSource.data = this.listeCommandes as TableCommandes[];
    }
  }

  filtrerParVille() {
    if (this.ville) {
      this.dataSource.data = this.listeCommandes.filter(
        (commande: any) => commande.ville === this.ville
      ) as TableCommandes[];
    } else {
      this.dataSource.data = this.listeCommandes as TableCommandes[];
    }
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;

      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      console.log(ws);

      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      console.log(this.data);

      this.listeCommandes = [];

      for (let i = 1; i < this.data.length; i++) {
        const commande: any[] = this.data[i];
        let typeCommande = commande[0].split('-')[0];
        if (typeCommande === 'F' || typeCommande === 'BL') {
          let objCommande = new Commande(
            commande[1],
            commande[0],
            commande[2],
            commande[3],
            commande[7],
            commande[8],
            commande[4],
            commande[6],
            commande[5],
            commande[9],
            commande[10],
            commande[11],
            commande[12]
          );
          this.listeCommandes.push(objCommande);
        }
      }
      this.afficherListeCommandes();
    };

    reader.readAsBinaryString(target.files[0]);
  }
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

  constructor() {}
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

  constructor() {}
}

class Commande {
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

  constructor(
    id: Number,
    reference: String,
    idClient: Number,
    nomClient: String,
    ville: String,
    adresse: String,
    contact: String,
    email: String,
    telephone: Number,
    typePieceIdentite: String,
    numeroPieceIdentite: Number,
    categorieClient: String,
    dateCreation: Date
  ) {
    this.id = id;
    this.reference = reference;
    this.idClient = idClient;
    this.nomClient = nomClient;
    this.ville = ville;
    this.adresse = adresse;
    this.contact = contact;
    this.email = email;
    this.telephone = telephone;
    this.typePieceIdentite = typePieceIdentite;
    this.numeroPieceIdentite = numeroPieceIdentite;
    this.categorieClient = categorieClient;
    this.dateCreation = dateCreation;
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

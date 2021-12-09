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
    'type',
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
  estManuel = true;
  data: [][];
  today = new Date();
  date = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate(),
    0,
    0,
    0
  );
  datesDispo: string[];

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
      date: this.date,
    });
    await this.getListeClients();
    this.listeCommandes = [];
    if (this.estManuel) {
      let generation = await this.serviceCommande.genererXML().toPromise();
      console.log(generation)
      this.datesDispo = await this.serviceCommande
        .datesDisponibles()
        .toPromise();
      let dateDivise = this.datesDispo[this.datesDispo.length - 1].split('-');
      let date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      this.filtre.get('date').setValue(new Date(date));
      this.getCommandesModeManuel();
    } else {
      await this.getListeFactures();
      await this.getListeBLs();
      this.listeCommandes = this.listeFactures.concat(this.listeBonsLivraison);
      this.afficherListeCommandes();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      factureConstruit.type = "Facture";
      factureConstruit.reference = facture.id_Facture;
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
      bonLivraisonConstruit.type = "BL";
      bonLivraisonConstruit.reference = bonLivraison.id_Bl;
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

  // charger la liste des commandes en mode manuel
  async getCommandesModeManuel() {
    let date = new Date(this.filtre.get('date').value);
    // let dateStr = date.toISOString().split('T')[0];
    let dateStr =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    console.log(dateStr);
    this.listeCommandes = await this.serviceCommande
      .commandesModeManuel(dateStr)
      .toPromise();
    this.afficherListeCommandes();
  }

  // diminuer la date dans le date picker par un jour
  async datePrecedente() {
    let dateChoisi = this.filtre.get('date').value;
    let date =
      ('0' + dateChoisi.getDate()).slice(-2) +
      '-' +
      (dateChoisi.getMonth() + 1) +
      '-' +
      dateChoisi.getFullYear();
    let index = this.datesDispo.findIndex((d) => date === d);
    if (index > 0) {
      let dateDivise = this.datesDispo[index - 1].split('-');
      let nouveauDateChoisi =
        dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      this.filtre.get('date').setValue(new Date(nouveauDateChoisi));
    }
    this.getCommandesModeManuel();
  }

  // augmenter le date dans le date picker par un jour
  async dateSuivante() {
    let dateChoisi = this.filtre.get('date').value;
    let date =
      ('0' + dateChoisi.getDate()).slice(-2) +
      '-' +
      (dateChoisi.getMonth() + 1) +
      '-' +
      dateChoisi.getFullYear();
    let index = this.datesDispo.findIndex((d) => date === d);
    if (index < this.datesDispo.length - 1) {
      let dateDivise = this.datesDispo[index + 1].split('-');
      let nouveauDateChoisi =
        dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      this.filtre.get('date').setValue(new Date(nouveauDateChoisi));
    }
    this.getCommandesModeManuel();
  }

  myFilter = (d: Date | null): boolean => {
    // disable les dates qui ne sont pas dans la liste datesDispo
    let dateEstDisponible = false;
    if (this.datesDispo) {
      this.datesDispo.forEach((dateStr) => {
        let dateDivise = dateStr.split('-');
        let dateString =
          dateDivise[1] + '-' + dateDivise[0] + '-' + dateDivise[2];
        let date = new Date(dateString);
        date.getTime() === d.getTime() ? (dateEstDisponible = true) : '';
      });
    }
    return dateEstDisponible;
  };

  ouvrirBoiteDialogueInfo(commande: any) {
    console.log(commande)
    const dialogRef = this.dialogue.open(BoiteDialogueInfo, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande, modeManuel: this.estManuel },
    });
  }

  ouvrirBoiteDialogueCreerCommande(commande: any) {
    console.log(commande);
    const dialogRef = this.dialogue.open(BoiteDialogueCreerCommande, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { commande: commande, modeManuel: this.estManuel },
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
}

// --------------------------------------------------------------------------------------------------------------------
//************************************ Declaration des classe pour construire les objets ******************************
// --------------------------------------------------------------------------------------------------------------------
class Facture {
  id: Number;
  type: string;
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
  type: string;
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
  type: string;
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
  nomFichier: string;
  totalTTC: number;
}

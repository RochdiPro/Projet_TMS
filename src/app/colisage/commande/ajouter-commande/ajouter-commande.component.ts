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

  listeClients: any;
  listeFactures: Facture[] = [];
  listeBonsLivraison: BonLivraison[] = [];
  listeCommandes: any = [];
  // les champs qui vont être afficher dans le tableau
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

  filtreFormGroup: FormGroup;
  // liste des villes tunisiennes pour le filtrage par ville
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
  estManuel = false;
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
    // code accés presentée d'une facon manuelle
    // enlever les deux lignes suivantes lors du deployement
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1000200');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  async ngOnInit() {
    // ajout des formControls dans le formGroup des filtres
    this.filtreFormGroup = this.fb.group({
      type: 'Facture',
      id: '',
      ville: '',
      date: this.date,
    });
    await this.getListeClients();

    if (this.estManuel) {
      // si le mode est manuel:
      // 1- on genere les fichiers XML a partir des fichiers Excels
      // 2- on recupére la liste des dates qui ont des dossiers dans le dossier DATA
      // 3- on recupére la derniére date enegistrée dans le dossier DATA
      // 4- on met ce date on format ("yyyy-mm-dd") pour q'on peut mettre cette date dans l'input du datePicker
      // 5- on recupére les commandes pour cette date
      await this.serviceCommande.genererXML().toPromise();
      this.datesDispo = await this.serviceCommande
        .datesDisponibles()
        .toPromise();
      let dateDivise = this.datesDispo[this.datesDispo.length - 1].split('-');
      let date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      this.filtreFormGroup.get('date').setValue(new Date(date));
      this.getCommandesModeManuel();
    } else {
      // pour le mode non manuel on recupére la liste des factures et des bls depuis la base des données
      await this.getListeFactures();
      await this.getListeBLs();
      // les commandes recupérées depuis la liste des factures et les bls sont fusionnée dans une liste commune qui s'appele listeCommandes
      this.listeCommandes = this.listeFactures.concat(this.listeBonsLivraison);
      this.afficherListeCommandes();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // on injecte la liste des commandes triée par date ascendant dans le dataSource pour l'afficher dans le tableau
  afficherListeCommandes() {
    this.dataSource.data = this.listeCommandes.sort(
      (commandeA: any, commandeB: any) =>
        commandeA.dateCreation > commandeB.dateCreation ? 1 : -1
    ) as TableCommandes[];
  }

  // recuperer la reference a rechrcher depuis le input du filtre reference
  get referenceCherche() {
    return this.filtreFormGroup.get('id').value;
  }

  // recuperer la ville a avec elle qu'on va filtrer depuis le select du filtre ville
  get ville() {
    return this.filtreFormGroup.get('ville').value;
  }

  // recuperer la liste des factures qui ont l'etat validée
  async getListeFactures() {
    const listeFacturesDB = await this.serviceCommande
      .filtreFacture('etat', 'Validée')
      .toPromise();

    listeFacturesDB.forEach((facture: any) => {
      this.listeFactures = []
      // pour chaque facture on recupére le client depuis la liste des clients puis on construit notre objet facture qui contient les informations necessaire
      var client = this.listeClients.filter(
        (client: any) => Number(client.id_Clt) === Number(facture.id_Clt)
      );
      var factureConstruit: Facture = new Facture();
      factureConstruit.id = facture.id_Facture;
      factureConstruit.type = 'Facture';
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
      // on push la facture resultante dans listeFactures qui va etre ajoutée a la listeCommandes
      this.listeFactures.push(factureConstruit);
    });
  }

  // recuperer la liste des BLs qui ont l'etat validée
  async getListeBLs() {
    this.listeBonsLivraison= []
    const listeBLsDB = await this.serviceCommande
      .filtreBonLivraison('etat', 'Validée')
      .toPromise();
    listeBLsDB.forEach((bonLivraison: any) => {
      // pour chaque BL on recupére le client depuis la liste des clients puis on construit notre objet bonLivraison qui contient les informations necessaire
      var client = this.listeClients.filter(
        (client: any) => Number(client.id_Clt) === Number(bonLivraison.id_Clt)
      );
      var bonLivraisonConstruit: BonLivraison = new BonLivraison();
      bonLivraisonConstruit.id = bonLivraison.id_Bl;
      bonLivraisonConstruit.type = 'BL';
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
      // on push le bonLivraison resultant dans listeBonsLivraison qui va etre ajoutée a la listeCommandes
      this.listeBonsLivraison.push(bonLivraisonConstruit);
    });
  }

  // recupérer la liste des clients
  async getListeClients() {
    this.listeClients = await this.serviceCommande.clients().toPromise();
  }

  // charger la liste des commandes en mode manuel pour la date dans le datePicker
  async getCommandesModeManuel() {
    let date = new Date(this.filtreFormGroup.get('date').value);
    let dateStr =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    this.listeCommandes = await this.serviceCommande
      .commandesModeManuel(dateStr)
      .toPromise();
    this.afficherListeCommandes();
  }

  // diminuer la date dans le date picker par un jour
  async datePrecedente() {
    let dateChoisi = this.filtreFormGroup.get('date').value;
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
      this.filtreFormGroup.get('date').setValue(new Date(nouveauDateChoisi));
    }
    this.getCommandesModeManuel();
  }

  // augmenter la date dans le date picker par un jour
  async dateSuivante() {
    let dateChoisi = this.filtreFormGroup.get('date').value;
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
      this.filtreFormGroup.get('date').setValue(new Date(nouveauDateChoisi));
    }
    this.getCommandesModeManuel();
  }

  disableDateNonExistante = (d: Date | null): boolean => {
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

  // ouvrir la boite de dialogue information
  ouvrirBoiteDialogueInfo(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueInfo, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande, modeManuel: this.estManuel },
    });
  }

  // ouvrir la boite de dialogue créer commande
  ouvrirBoiteDialogueCreerCommande(commande: any) {
    const dialogRef = this.dialogue.open(BoiteDialogueCreerCommande, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { commande: commande, modeManuel: this.estManuel },
    });
    dialogRef.afterClosed().subscribe(async () => {
      // si le mode est manuel, apres la fermeture du boite de dialogue on rafraichit les fichiers XML et la liste des commandes
      if (this.estManuel) {
        await this.serviceCommande.genererXML().toPromise();
        this.getCommandesModeManuel();
      } else {
        // pour le mode non manuel on recupére la liste des factures et des bls depuis la base des données
        await this.getListeFactures();
        await this.getListeBLs();
        // les commandes recupérées depuis la liste des factures et les bls sont fusionnée dans une liste commune qui s'appele listeCommandes
        this.listeCommandes = this.listeFactures.concat(
          this.listeBonsLivraison
        );
        this.afficherListeCommandes();
      }
    });
  }

  // filtrerage par reference
  filtrerParReference() {
    if (this.referenceCherche) {
      // si il'y a quelque chose tapée dans le input de reference en filtre par type et par reference
      let type = this.filtreFormGroup.get('type').value;
      this.dataSource.data = this.listeCommandes.filter(
        (commande: any) =>
          commande.type === type && commande.reference == this.referenceCherche
      ) as TableCommandes[];
    } else {
      // si le input de reference est vide on recupére la liste des commandes sans filtrage
      this.dataSource.data = this.listeCommandes as TableCommandes[];
    }
  }

  // filtrage par ville
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

// class Facture
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

// class BonLivraison
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
  etat: String;
}

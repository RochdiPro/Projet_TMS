import { MapsAPILoader } from '@agm/core';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
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
/**
 * Boite dialogue permet d'afficher les informations d'une commande à ajouter (dans interface ajouter commande)
 * Liste des fonctions:
  - getTypeCommande: get le type du document source de la commande (BL ou Facture).
  - getDetail: recupérer les details d'une commande depuis le fichier XML convenable.
  - fermerBoiteDialogue: fermer la boite de dialogue info.
  - ouvrirBoiteDialogueDetailProduit: ouvrir la boite de dialogue detail qui contient les numero de serie et les numeros imeis pour chaque produit.
 */
@Component({
  selector: 'boite-dialogue-info',
  templateUrl: './boite-dialogue-info.html',
  styleUrls: ['./boite-dialogue-info.scss'],
})
export class BoiteDialogueInfo implements OnInit {
  typeDocument: String;
  articles: any;
  listeArticlesDetail: any = [];
  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueInfo>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public serviceEmballage: EmballageService,
    public serviceCommande: CommandeService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.getTypeCommande();
    this.getDetail();
  }

  // get le type du document source de la commande (BL ou Facture)
  getTypeCommande() {
    if (this.data.commande.type === 'Facture') {
      this.typeDocument = 'Facture';
    } else {
      this.typeDocument = 'Bon Livraison';
    }
  }

  // recupérer les details d'une commande depuis le fichier XML convenable
  async getDetail() {
    if (this.data.modeManuel) {
      // si le mode est manuel on recupére le fichiers xml local on donnant la date du commande desirée et le nom du fichier
      let date = this.data.commande.dateCreation;
      let dateDivise = date.split('-');
      date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      let nomFichier = this.data.commande.nomFichier;
      let detail = await this.serviceCommande
        .loadXML(date, nomFichier)
        .toPromise();
      //selon le type de la commande on appele la fonction qui permet l'extrait des details depuis le fichier xml
      this.typeDocument === 'Facture'
        ? (this.articles = await getDetail(detail, 'facture'))
        : (this.articles = await getDetail(detail, 'bl'));
    } else {
      // si le mode n'est pas mode manuel on recupere le fichier xml depuis la base des données on donnant l'id du commande desirée
      if (this.typeDocument === 'Facture') {
        let detail = await this.serviceCommande
          .Detail_Facture(this.data.commande.id)
          .toPromise();

        //selon le type de la commande on appele la fonction qui permet l'extrait des details depuis le fichier xml
        this.articles = await getDetail(detail, 'facture');
      } else {
        let detail = await this.serviceCommande
          .Detail_BL(this.data.commande.id)
          .toPromise();

        //selon le type de la commande on appele la fonction qui permet l'extrait des details depuis le fichier xml
        this.articles = await getDetail(detail, 'bl');
      }
    }
    console.log(this.articles);
    for (let i = 0; i < this.articles.length; i++) {
      // pour chaque article qu'on a recupérer depuis le fichier detail on construit avec ses données un objet article
      // avec les informations desirées et on l'ajoute a la listeArticlesDetail
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
          [],
          []
        )
      );
    }
  }

  // fermer la boite de dialogue info
  fermerBoiteDialogue() {
    this.dialogRef.close();
  }

  // ouvrir la boite de dialogue detail qui contient les numero de serie et les numeros imeis pour chaque produit
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
/**
 * Boite dialogue permet de créer une nouvelle commande
 * Liste des fonctions:
  - getTypeDocument: indiquer le type du coommande (facture ou bl).
  - setPositionClient: on change les variable lat, lng, latMap, lngMap, on zoom et on change positionExiste vers 'true' pour afficher la position du client proprement.
  - getPositionsEnregistrees: on recupére les positions enregistrées pour un client a l'aide de son id.
  - ajouterAdresse: fonction utilisée dans le bouton d'ajout position.
  - selectionnerAdresse: fonction qu s'execute lors du changement du selection d'adresse.
  - selectionnerVille: fonction qu s'execute lors du changement du selection de la ville.
  - getListeEmballage: recuperer la liste des emballages.
  - getDetail: recuperer les fichier des details des commandes et generer un liste embllage suggérée pour chaque produit puis les enregistrer dans listeArticlesDetail.
  - modifierPositionMarquer: pour modifier la position du marqueur existant.
  - ouvrirBoiteDialogueEmballer: ouvrir boite de dialogue emballer.
  - ouvrirBoiteDialogueDetailProduit: ouvrir boite de dialogue detail produit.
  - creerListeEmballageChoisi: creation de la liste qui contient les emballages choisit de toute les articles.
  - setValiditeListeProduits: verifier si tou les articles on était emballé avec succés, si oui on valide et autorisee le passage au step suivant.
  - verifierValiditeDeuxiemeStep: si on essaie de clicker suivant mais il'y a des produit qui ne sont pas totalement emballés on affiche un alerte pour informer l'utilisateur.
  - getNombreArticles: retourne le nombre d'article on calculant le nombre d'emballage * qte articles dans l'emballage.
  - getDimensionsPack: retourne les dimensions de l'emballage sous la forme suivante (LxlxH).
  - getVolumePack: retourne le volume total de l'emballage.
  - getPoidsPackNet: retourne le poids total net de l'emballage.
  - getPoidsPackBrut: retourne le poids total brut de l'emballage.
  - calculerScoreCommande: calculer le score de la commande.
  - trackingNumber: generer le tracking number.
  - enregistrer: enregistrer la commande crée.
  - get nombrePackTotal: retourne le nombre total des emballages.
  - get volumeTotal: retourne le volume total des emballages.
  - get poidsTotalNet: retourne le poids total net des emballages.
  - get poidsTotalBrut: retourne le poids total brut des emballages.
 */
@Component({
  selector: 'boite-dialogue-creer-commande',
  templateUrl: 'boite-dialogue-creer-commande.html',
  styleUrls: ['boite-dialogue-creer-commande.scss'],
})
export class BoiteDialogueCreerCommande implements OnInit {
  typeDocument: String;
  articles: any;
  listeArticlesDetail: any = [];
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
  listeEmballageChoisi: any = [];

  // formGroup du premier step du stepper
  firstFormGroup: FormGroup;
  // formGroup du deuxieme step du stepper
  secondFormGroup: FormGroup;

  // les variables pour le map
  latMap: any = 34.74056;
  lngMap: any = 10.76028;
  lat: any = 0;
  lng: any = 0;
  zoom: number = 5;

  // on n'affiche le pin de localisation qu si la position existe
  positionExiste = false;

  // position client initialisé au centre ville sfax
  positionClient: any = {
    latitude: 34.74056,
    longitude: 10.76028,
  };
  // liste des position deja enregistre pour un client
  positionsClientEnregistree: any = [];
  // un flag pour indiquer si la position a été modifié ou non
  positionEstModifie: boolean = false;
  score: Number;

  // liste des villes qui contient le nom de toute les villes tunisiennes avec les coordonnées de leurs frontières et les coordonnées de leurs centres
  villes: any[] = [
    {
      nom: 'Bizerte',
      restriction: {
        latLngBounds: {
          east: 10.281852848894673,
          north: 37.34829803653758,
          south: 36.73985364691916,
          west: 9.078166160370051,
        },
        strictBounds: true,
      },
      centre: { lat: 37.27126, lng: 9.87275 },
    },
    {
      nom: 'Tunis',
      restriction: {
        latLngBounds: {
          east: 10.369407,
          north: 36.944782,
          south: 36.692089,
          west: 10.002771,
        },
        strictBounds: true,
      },
      centre: { lat: 36.80873, lng: 10.17725 },
    },
    {
      nom: 'Ariana',
      restriction: {
        latLngBounds: {
          east: 10.369407,
          north: 37.115684,
          south: 36.822141,
          west: 9.964339,
        },
        strictBounds: true,
      },
      centre: { lat: 36.866846352390134, lng: 10.16443428348491 },
    },
    {
      nom: 'Manouba',
      restriction: {
        latLngBounds: {
          east: 10.120446,
          north: 36.971596,
          south: 36.586412,
          west: 9.566758,
        },
        strictBounds: true,
      },
      centre: { lat: 36.83930078907781, lng: 9.851480819913181 },
    },
    {
      nom: 'Ben_Arous',
      restriction: {
        latLngBounds: {
          east: 10.409405,
          north: 36.808078,
          south: 36.455402,
          west: 10.036292,
        },
        strictBounds: true,
      },
      centre: { lat: 36.74323106793157, lng: 10.231852178069953 },
    },
    {
      nom: 'Zaghouan',
      restriction: {
        latLngBounds: {
          east: 10.391918,
          north: 36.665134,
          south: 36.001048,
          west: 9.589744,
        },
        strictBounds: true,
      },
      centre: { lat: 36.40887492219488, lng: 10.142431842323615 },
    },
    {
      nom: 'Nabeul',
      restriction: {
        latLngBounds: {
          east: 11.158589,
          north: 37.147098,
          south: 36.352522,
          west: 10.331798,
        },
        strictBounds: true,
      },
      centre: { lat: 36.45260407823169, lng: 10.733978179154175 },
    },
    {
      nom: 'Jendouba',
      restriction: {
        latLngBounds: {
          east: 9.079501,
          north: 37.010252,
          south: 36.351258,
          west: 8.151019,
        },
        strictBounds: true,
      },
      centre: { lat: 36.507273277503444, lng: 8.775626272270108 },
    },
    {
      nom: 'Beja',
      restriction: {
        latLngBounds: {
          east: 9.391172,
          north: 37.158356,
          south: 36.336546,
          west: 8.9106,
        },
        strictBounds: true,
      },
      centre: { lat: 36.733215168781705, lng: 9.183747660605322 },
    },
    {
      nom: 'Kef',
      restriction: {
        latLngBounds: {
          east: 9.167497,
          north: 36.454129,
          south: 35.611709,
          west: 8.253016,
        },
        strictBounds: true,
      },
      centre: { lat: 36.167803516442035, lng: 8.709592875826498 },
    },
    {
      nom: 'Siliana',
      restriction: {
        latLngBounds: {
          east: 9.77319,
          north: 36.478602,
          south: 35.4764,
          west: 8.926576,
        },
        strictBounds: true,
      },
      centre: { lat: 36.088625662341, lng: 9.365415531851905 },
    },
    {
      nom: 'Sousse',
      restriction: {
        latLngBounds: {
          east: 10.686171,
          north: 36.392708,
          south: 35.393671,
          west: 10.158135,
        },
        strictBounds: true,
      },
      centre: { lat: 35.824329709576716, lng: 10.634715497107086 },
    },
    {
      nom: 'Monastir',
      restriction: {
        latLngBounds: {
          east: 11.05078,
          north: 35.787226,
          south: 35.430507,
          west: 10.489467,
        },
        strictBounds: true,
      },
      centre: { lat: 35.76538079332432, lng: 10.810260717481093 },
    },
    {
      nom: 'Mahdia',
      restriction: {
        latLngBounds: {
          east: 11.165002,
          north: 35.589525,
          south: 35.07529,
          west: 10.15838,
        },
        strictBounds: true,
      },
      centre: { lat: 35.502026673770764, lng: 11.04582501599056 },
    },
    {
      nom: 'Kairouan',
      restriction: {
        latLngBounds: {
          east: 10.308173,
          north: 36.140414,
          south: 35.001079,
          west: 9.267905,
        },
        strictBounds: true,
      },
      centre: { lat: 35.67094533847933, lng: 10.10034611238224 },
    },
    {
      nom: 'Kasserine',
      restriction: {
        latLngBounds: {
          east: 9.332721,
          north: 35.793797,
          south: 34.622838,
          west: 8.247822,
        },
        strictBounds: true,
      },
      centre: { lat: 35.171870051979106, lng: 8.830651951411204 },
    },
    {
      nom: 'Sidi_Bouzid',
      restriction: {
        latLngBounds: {
          east: 10.06405,
          north: 35.48863,
          south: 34.262869,
          west: 8.918955,
        },
        strictBounds: true,
      },
      centre: { lat: 35.03605440343467, lng: 9.479140994112937 },
    },
    {
      nom: 'Sfax',
      restriction: {
        latLngBounds: {
          east: 11.392654,
          north: 35.27722,
          south: 34.171222,
          west: 9.686976,
        },
        strictBounds: true,
      },
      centre: { lat: 34.73984922073761, lng: 10.759952254881535 },
    },
    {
      nom: 'Gabes',
      restriction: {
        latLngBounds: {
          east: 10.483058,
          north: 34.28492,
          south: 33.265003,
          west: 9.231218,
        },
        strictBounds: true,
      },
      centre: { lat: 33.88798724691624, lng: 10.097962350508025 },
    },
    {
      nom: 'Mednine',
      restriction: {
        latLngBounds: {
          east: 11.607194,
          north: 33.91901,
          south: 32.261158,
          west: 9.703215,
        },
        strictBounds: true,
      },
      centre: { lat: 33.339915708515406, lng: 10.495960924901047 },
    },
    {
      nom: 'Tataouine',
      restriction: {
        latLngBounds: {
          east: 11.346294,
          north: 33.230216,
          south: 30.230582,
          west: 8.354969,
        },
        strictBounds: true,
      },
      centre: { lat: 32.92089024890151, lng: 10.451014949925623 },
    },
    {
      nom: 'Gafsa',
      restriction: {
        latLngBounds: {
          east: 9.580529,
          north: 34.813475,
          south: 34.064037,
          west: 8.028102,
        },
        strictBounds: true,
      },
      centre: { lat: 34.431806117336656, lng: 8.775923307783737 },
    },
    {
      nom: 'Tozeur',
      restriction: {
        latLngBounds: {
          east: 8.638445,
          north: 34.51628,
          south: 33.421554,
          west: 7.511445,
        },
        strictBounds: true,
      },
      centre: { lat: 33.919494971929026, lng: 8.123099702941756 },
    },
    {
      nom: 'Kebili',
      restriction: {
        latLngBounds: {
          east: 9.98737,
          north: 34.194418,
          south: 32.497867,
          west: 7.740516,
        },
        strictBounds: true,
      },
      centre: { lat: 33.707124933652835, lng: 8.971489104616344 },
    },
  ];
  //view port restrictions
  countryRestriction = {
    latLngBounds: {
      east: -149.73088535701655,
      north: 37.44246759017879,
      south: -35.95190678813464,
      west: -127.05509132479719,
    },
    strictBounds: true,
  };
  estNouvelleAdresse = false;
  private geoCoder: any;
  address: string;
  infoMarqueur: string;
  boutonValiderEstActive = true;


  constructor(
    private fb: FormBuilder,
    public dialgRef: MatDialogRef<BoiteDialogueCreerCommande>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public serviceCommande: CommandeService,
    public serviceEmballage: EmballageService,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    // trier la liste des villes par l'ordre alphabétique
    this.villes.sort((a: any, b: any) => (a.nom > b.nom ? 1 : -1));
    // construction des formGroups
    this.firstFormGroup = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleVille: '',
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

  // indiquer le type du coommande (facture ou bl)
  getTypeDocument() {
    this.data.commande.type === 'Facture'
      ? (this.typeDocument = 'Facture')
      : (this.typeDocument = 'Bon Livraison');
  }

  // on change les variable lat, lng, latMap, lngMap, on zoom et on change positionExiste vers 'true' pour afficher la position du client proprement
  setPositionClient() {
    this.lat = Number(this.positionClient.latitude);
    this.lng = Number(this.positionClient.longitude);
    this.latMap = Number(this.positionClient.latitude);
    this.lngMap = Number(this.positionClient.longitude);
    this.zoom = 15;
    this.positionExiste = true;

    // pour afficher l'adresse du client dans une petite pop up si on clique la position du client
    this.infoMarqueur = this.positionClient.adresse;
  }

  // on recupére les positions enregistrées pour un client a l'aide de son id
  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
  }

  // fonction utilisée dans le bouton d'ajout position
  ajouterAdresse() {
    if (!this.estNouvelleAdresse) {
      // si la variable estNouvelleAdresse == false on affiche le champs d'ajout d'une nouvelle adresse on changeant l'etat de cette variable ver true
      this.estNouvelleAdresse = true;
    } else if (
      this.firstFormGroup.get('nouvelleAdresse').value !== '' &&
      this.firstFormGroup.get('nouvelleVille').value !== ''
    ) {
      // si la variable estNouvelleAdresse == true et les champs du ville et adresse ne sont pas vides on ajoute cette nouvelle adresse dans positionsClientEnregistree
      this.positionsClientEnregistree.push({
        adresse: this.firstFormGroup.get('nouvelleAdresse').value,
        ville: this.firstFormGroup.get('nouvelleVille').value.nom,
        latitude: this.lat,
        longitude: this.lng,
      });
      // on vide les champs
      this.firstFormGroup.get('nouvelleAdresse').setValue('');
      this.firstFormGroup.get('nouvelleVille').setValue('');
      // on selectionne automatiquement l'adresse ajouté
      this.firstFormGroup
        .get('adresse')
        .setValue(this.positionsClientEnregistree.length - 1);
      // on on change la position du client vers la nouvelle position
      this.positionClient =
        this.positionsClientEnregistree[
          this.positionsClientEnregistree.length - 1
        ];
      this.estNouvelleAdresse = false;
    }
  }

  // fonction qu s'execute lors du changement du selection d'adresse
  selectionnerAdresse() {
    let ville: any;
    // changer positionClient
    this.positionClient =
      this.positionsClientEnregistree[this.firstFormGroup.get('adresse').value];
    //changer les valeurs des frontiers pour changer la ville affichée su map
    this.villes.forEach((v) => {
      v.nom === this.positionClient.ville ? (ville = v) : '';
    });
    this.countryRestriction = ville.restriction;
    this.setPositionClient();
  }

  // fonction qu s'execute lors du changement du selection de la ville
  selectionnerVille() {
    //changer les valeurs des frontiers pour changer la ville affichée su map
    this.countryRestriction =
      this.firstFormGroup.get('nouvelleVille').value.restriction;
    // on affiche la ville et on donne comme position par defaut le centre de la ville
    this.latMap = this.firstFormGroup.get('nouvelleVille').value.centre.lat;
    this.lngMap = this.firstFormGroup.get('nouvelleVille').value.centre.lng;
    this.positionExiste = true;
    this.lat = this.firstFormGroup.get('nouvelleVille').value.centre.lat;
    this.lng = this.firstFormGroup.get('nouvelleVille').value.centre.lng;
  }

  // recuperer la liste des emballages
  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }

  // recuperer les fichier des details des commandes et generer un liste embllage suggérée pour chaque produit puis les enregistrer dans listeArticlesDetail
  async getDetail() {
    if (this.data.modeManuel) {
      // si le mode est manuel on recupere le fichier xml detail depuis la machine local
      let date = this.data.commande.dateCreation;
      let dateDivise = date.split('-');
      date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      let nomFichier = this.data.commande.nomFichier;
      let detail = await this.serviceCommande
        .loadXML(date, nomFichier)
        .toPromise();
      // on recupére les detail necessaire depuis le fichier qu'on a chargé
      this.typeDocument === 'Facture'
        ? (this.articles = await getDetail(detail, 'facture'))
        : (this.articles = await getDetail(detail, 'bl'));
    } else {
      // si le mode n'est pa manuel on recupere le fichier xml depuis la base des données puis on enregistre les details des articles dans la variable articles
      if (this.typeDocument === 'Facture') {
        var detail = await this.serviceCommande
          .Detail_Facture(this.data.commande.id)
          .toPromise();
        this.articles = await getDetail(detail, 'facture');
      } else {
        var detail = await this.serviceCommande
          .Detail_BL(this.data.commande.id)
          .toPromise();
        this.articles = await getDetail(detail, 'bl');
      }
    }
    //pour chaque article
    for (let i = 0; i < this.articles.length; i++) {
      // qte produit desirée par le client
      let qteProduitCommande = Number(this.articles[i].qte);
      let listeEmballageProduit = [];

      //liste emballage enregistrées dans base de donnée pour un produit specifique
      this.listeProduitDansListeEmballage = this.listeEmballage.filter(
        (emballage: any) => emballage.idProduit === this.articles[i].id
      );
      if (this.listeProduitDansListeEmballage.length > 0) {
        //s'il y a des element dans la listeProduitDansListeEmballage
        do {
          // retourne la difference entre la qte desirée et la qte du produit dans un emballage
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
              //tous les elements sauf le premier
              if (
                qteProduitCommande >=
                Number(this.listeProduitDansListeEmballage[j].qte)
              ) {
                //si qte commande > qte emballage
                if (differenceQte(j) < differenceQuantite) {
                  // si la nouvelle difference entre la quantite de la commande et la quantité dans l'emballage est moins que la difference precedente
                  // pour avoir l'emballage avec la quantité inferieur a quantité du commande et la plus proche de cette quantité
                  differenceQuantite = differenceQte(j);
                  let difference = differenceQte(j);
                  qteEmballage = 0;
                  // boucle qui permet de calculer le nombre max de l'emballage sans que la quantité total depasse la quantité du commande
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
          // on diminue la qteProduitCommande pour avoir la qte desirée restante aprés emballage
          qteProduitCommande -= Number(emballage.qte) * qteEmballage;
          listeEmballageProduit.push({
            emballage: emballage,
            qteEmballage: qteEmballage,
          });
        } while (qteProduitCommande > 0);
        // on ajoute les articles avec leurs liste d'emballage suggérée par l'algorithme precedent dans listeArticlesDetail qui contient les articles avec leurs details necessaires
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

  //pour modifier la position du marqueur existant
  modifierPositionMarquer(event: any) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;
    // this.getAddress(this.lat, this.lat);
  }

  // ouvrir boite de dialogue emballer
  ouvrirBoiteDialogueEmballer(produit: any) {
    const dialogRef = this.dialog.open(BoiteDialogueEmballer, {
      width: '600px',
      maxWidth: '95vw',
      data: { produit: produit },
    });
    dialogRef.afterClosed().subscribe((result) => {
      // apres fermeture du boite dialogue si la fermeture est effectué par le bouton valider on aura un objet result on test si cet objet existe a chaque fermeture di dialog
      if (result) {
        // on reintitalise la qteNonEmballe pour savoir combien de qte reste non emballée
        produit.qteNonEmballe = result.qteNonEmballe;
        // initialement cette liste etait vide. Aprés fermeture du dialog on a choisi une liste emballage on l'enregistre dans nos details
        produit.listeEmballageChoisi = result.listeEmballageChoisi;
      }
      this.setValiditeListeProduits();
    });
  }

  // ouvrir boite de dialogue detail produit
  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '600px',
      data: { produit: article },
    });
  }
  // creation de la liste qui contient les emballages choisit de toute les articles
  creerListeEmballageChoisi() {
    this.listeEmballageChoisi = [];
    this.listeArticlesDetail.forEach((article: any) => {
      this.listeEmballageChoisi = this.listeEmballageChoisi.concat(
        article.listeEmballageChoisi
      );
    });
  }

  // verifier si tou les articles on était emballé avec succés, si oui on valide et autorisee le passage au step suivant
  setValiditeListeProduits() {
    let deuxiemeStepEstValide = true;
    this.listeArticlesDetail.forEach((element: any) => {
      element.qteNonEmballe !== 0 ? (deuxiemeStepEstValide = false) : '';
    });
    deuxiemeStepEstValide
      ? this.secondFormGroup.get('secondCtrl').setValue('valide')
      : this.secondFormGroup.get('secondCtrl').setValue('');
  }

  // si on essaie de clicker suivant mais il'y a des produit qui ne sont pas totalement emballés on affiche un alerte pour informer l'utilisateur
  verifierValiditeDeuxiemeStep() {
    if (this.secondFormGroup.get('secondCtrl').value === '') {
      Swal.fire({
        icon: 'error',
        text: "Il y'a des produits qui ne sont pas encore emballés!",
      });
    }
  }

  // retourne le nombre d'article on calculant le nombre d'emballage * qte articles dans l'emballage
  getNombreArticles(emballage: any) {
    return emballage.qte * emballage.emballage.qte;
  }

  // retourne les dimensions de l'emballage sous la forme suivante (LxlxH)
  getDimensionsPack(emballage: any) {
    return (
      emballage.emballage.longueur +
      'x' +
      emballage.emballage.largeur +
      'x' +
      emballage.emballage.hauteur
    );
  }

  // retourne le volume total de l'emballage
  getVolumePack(emballage: any) {
    return emballage.emballage.volume * emballage.qte;
  }

  // retourne le poids total net de l'emballage
  getPoidsPackNet(emballage: any) {
    return emballage.emballage.poids_total_net * emballage.qte;
  }

  // retourne le poids total brut de l'emballage
  getPoidsPackBrut(article: any) {
    return article.emballage.poids_emballage_total * article.qte;
  }

  // calculer le score de la commande
  async calculerScoreCommande() {
    // formule: score = prixFacture * coefficientPrixFacture + fraisLivraison * coefficientFraisLivraison + scoreClient * coefficientScoreClient + retard * coefficientRetard
    // 1- get coefficients
    // 2- get les valeurs(prixFacture/prixBonLivraison, fraisLivraison, scoreClient, retard) pour les injecter dans la formule de calcul dy score
    // 3- calculer score
    let coefficientScoreCommande = await this.serviceCommande
      .getCoefficientsScoreCommande()
      .toPromise(); //get les coefficients

    // get prix
    let prix;
    if (this.data.modeManuel) {
      prix = this.data.commande.totalTTC;
    } else {
      if (this.typeDocument === 'Facture') {
        //si le type est Facture on recupere le prix de la facture
        let facture = await this.serviceCommande
          .facture(this.data.commande.id)
          .toPromise();
        prix = facture.total_TTC;
      } else if (this.typeDocument === 'Bon Livraison') {
        //si le type est Bon Livraison on recupere le prix du bon livraison
        let bonLivraison = await this.serviceCommande
          .bonLivraison(this.data.commande.id)
          .toPromise();
        prix = bonLivraison.total_TTC;
      }
    }
    // calcul du frais livraison
    // get coefficients frais livraison
    let coefficientFraisLivraison = await this.serviceCommande.fraisLivraison().toPromise() as CoefficientsFraisLivraison;
    let fraisLivraison = coefficientFraisLivraison.taxeFixe;
    if (coefficientFraisLivraison.uniteLimite === "kg") {
      if(Number(this.poidsTotalBrut) > coefficientFraisLivraison.limite) {
        let poidsSupplimentaire = Number(this.poidsTotalBrut) - coefficientFraisLivraison.limite;
        let nbrFoisAjoutTaxSupp = Math.ceil(poidsSupplimentaire/coefficientFraisLivraison.limiteTaxeSupp);
        for (let i = 0; i < nbrFoisAjoutTaxSupp; i++) {
          fraisLivraison += coefficientFraisLivraison.taxeSupplimentaire;
        }
      }
    } else {
      if(Number(this.volumeTotal) > coefficientFraisLivraison.limite) {
        let volumeSupplimentaire = Number(this.volumeTotal) - coefficientFraisLivraison.limite;
        let nbrFoisAjoutTaxSupp = Math.ceil(volumeSupplimentaire/coefficientFraisLivraison.limiteTaxeSupp);
        for (let i = 0; i < nbrFoisAjoutTaxSupp; i++) {
          fraisLivraison += coefficientFraisLivraison.taxeSupplimentaire;
        }
      }
    }
    // get le score du client
    let scoreClient = 0;
    switch (this.data.commande.categorieClient) {
      case 'Passager':
        scoreClient = 0.1;
        break;
      case 'Fidèle':
        scoreClient = 0.2;
        break;
      case 'SuperFidèle':
        scoreClient = 0.3;
        break;
      case 'Revendeur':
        scoreClient = 0.4;
        break;

      default:
        break;
    }

    // calcul du retard
    let dateCreationCommande;
    if (this.data.modeManuel) {
      let date = new Date(this.data.commande.dateCreation);
      dateCreationCommande = date;
    } else {
      dateCreationCommande = this.data.commande.dateCreation;
    }
    var dateActuel = new Date();
    let retard = dateActuel.getTime() - dateCreationCommande.getTime();
    this.score =
      prix * coefficientScoreCommande.prixFacture +
      fraisLivraison * coefficientScoreCommande.fraisLivraison +
      scoreClient * coefficientScoreCommande.client +
      retard * coefficientScoreCommande.retard;
  }

  // generer le tracking number
  trackingNumber = () => {
    let trackingNumber = '';
    for (let i = 0; i < 15; i++) trackingNumber += ~~(Math.random() * 10);
    return Number(trackingNumber);
  };

  // enregistrer la commande crée
  async enregistrer() {
    // on desactive le bouton valider pour eviter que l'utilisateur le clique une autre fois lors de l'execution des services du back
    // car l'envoie d'email prend un peut de temp selon la qualité de l'internet de l'utilisateur
    this.boutonValiderEstActive = false;
    await this.calculerScoreCommande();
    let commande: any = new FormData();
    //creation position client s'il n'existe pas
    if (this.positionClient.idClient === undefined) {
      let position: any = new FormData();
      this.positionClient.longitude = this.lng;
      this.positionClient.latitude = this.lat;
      position.append('idClient', this.data.commande.idClient);
      position.append('ville', this.positionClient.ville);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.positionClient.longitude);
      position.append('latitude', this.positionClient.latitude);
      await this.serviceCommande.creerPositionClient(position).toPromise();
      this.positionClient = await this.serviceCommande
        .dernierPositionClient()
        .toPromise();
    } else if (this.positionEstModifie) {
      // si la position deja existe mais elle a été modifié
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('ville', this.positionClient.ville);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      await this.serviceCommande.modifierPositionClient(position).toPromise();
    }

    // creation de la commande
    commande.append('referenceDocument', this.data.commande.reference);
    commande.append('idClient', this.data.commande.idClient);
    commande.append('nomClient', this.data.commande.nomClient);
    commande.append('contact', this.data.commande.contact);
    commande.append('telephone', this.data.commande.telephone);
    commande.append('email', this.data.commande.email);
    commande.append('categorieClient', this.data.commande.categorieClient);
    commande.append('ville', this.positionClient.ville);
    commande.append('adresse', this.positionClient.adresse);
    commande.append('typePieceIdentite', this.data.commande.typePieceIdentite);
    commande.append('numPieceIdentite', this.data.commande.numeroPieceIdentite);
    if (this.data.modeManuel) {
      let date = new Date(this.data.commande.dateCreation);
      commande.append('dateCreation', date);
    } else {
      commande.append('dateCreation', this.data.commande.dateCreation);
    }
    commande.append('idPosition', this.positionClient.id);
    commande.append('etat', 'En cours de traitement');
    commande.append('score', this.score);
    commande.append('poids', this.poidsTotalBrut);
    commande.append('volume', this.volumeTotal);
    commande.append('trackingNumber', this.trackingNumber());
    commande.append('type', this.typeDocument);
    if (this.data.modeManuel) {
      commande.append('nomFichier', this.data.commande.nomFichier);
    } else {
      commande.append('nomFichier', "");
    }

    await this.serviceCommande.creerCommande(commande).toPromise();
    // recupérer la derniére commande enregistrée
    const derniereCommandeEnregistree = await this.serviceCommande
      .getDerniereCommande()
      .toPromise();

    // creation de la liste de colisage
    for (let i = 0; i < this.listeEmballageChoisi.length; i++) {
      let listeColisage: any = new FormData();
      let emballage = this.listeEmballageChoisi[i];
      listeColisage.append('idCommande', derniereCommandeEnregistree.id);
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
    // si on est dans le mode manuel on modifie l'etat de la commande dans le fichier excel correspondant
    if (this.data.modeManuel) {
      await this.serviceCommande
        .modifierEtatCommandeDansExcel(
          this.data.commande.dateCreation,
          this.data.commande.type,
          this.data.commande.nomFichier,
          "crée"
        )
        .toPromise();
    } else {
      if (this.typeDocument === "Facture") {
        let formData = new FormData();
        formData.append("Id", this.data.commande.reference)
        formData.append("Etat", "En cours de transport")
        this.serviceCommande.modifierEtatFacture(formData);
      } else if(this.typeDocument === "Bon Livraison") {
        let formData: any = new FormData();
        formData.append("Id", Number(this.data.commande.reference))
        formData.append("Etat", "En cours de transport")
        this.serviceCommande.modifierEtatBonLivraison(formData);
      }
    }
    Swal.fire({
      icon: 'success',
      title: 'Commande bien ajoutée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.dialgRef.close();
  }

  // retourne le nombre total des emballages
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      nombrePack += emballage.qte;
    });
    return nombrePack;
  }

  // retourne le volume total des emballages
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      volumeTotal += this.getVolumePack(emballage);
    });
    return volumeTotal.toFixed(3);
  }

  // retourne le poids total net des emballages
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(3);
  }

  // retourne le poids total brut des emballages
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(3);
  }
}

// ***********************************Boite de dialogue Emballer ******************************************************
/**
 * Boite dialogue permet de préciser le nombre et le type d'emballage a affecter dans une commande
 * Liste des fonctions:
 - get qteForm(): retourne le FormArray qte sous forme d'un array.
 - ajouterChampQte: fonction qui permet d'ajouter les formControl 'qte' dans le FormArray 'qte.
 - getListeEmballages: recupérer la liste des emballages.
 - updateMax: mise a jour du limite max de l'input qte pour eviter les fautes.
 - ajouterQuantiteEmballage: fonction qui permet l'emballage du produit a chaque fois q'on change la valeur de l'input de qte.
 - donnerSuggestion: pour afficher la qte suggérée pour chaque emballage.
 */
@Component({
  selector: 'boite-dialogue-emballer',
  templateUrl: 'boite-dialogue-emballer.html',
  styleUrls: ['boite-dialogue-emballer.scss'],
})
export class BoiteDialogueEmballer implements OnInit {
  quantiteNonEmballee: number;
  listeEmballages: any;
  form: FormGroup;
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
    // la quantité no emballé avant de faire l'emballage
    this.quantiteNonEmballeePrecedente = Number(this.data.produit.qte);

    // creation du formGroup
    this.form = this.fb.group({
      qte: this.fb.array([]),
    });
    await this.getListeEmballages();
    await this.ajouterChampQte();
    this.ajouterQuantiteEmballage();
  }

  // retourne le FormArray qte sous forme d'un array
  get qteForm() {
    return this.form.get('qte') as FormArray;
  }

  // fonction qui permet d'ajouter les formControl 'qte' dans le FormArray 'qte
  async ajouterChampQte() {
    // pour chaque emballage on ajoute un formControl
    this.listeEmballages.forEach((emballage: any) => {
      let qte: any;

      if (emballage.qte > this.quantiteNonEmballee) {
        // si la quantité dans l'emballage est supérieur a la quantité non emballé on ajoute le formControl mais on le disable
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
          // si on a deja emballé le produit on recupére les emballages depuis listeEmballageChoisi
          const emb = this.data.produit.listeEmballageChoisi.filter(
            (emb: any) => emb.emballage.id === emballage.id
          );
          if (emb.length > 0) {
            // si l'emballage existe dans listeEmballageChoisi on met la valeur du formControl = qte emballage
            qte = this.fb.group({
              qte: [emb[0].qte, [Validators.min(0), Validators.required]],
            });
          } else {
            // si l'emballage n'existe pas la valeur du formControl = 0
            qte = this.fb.group({
              qte: [0, [Validators.min(0), Validators.required]],
            });
          }
        } else {
          // si on n'a pas encore emballer un produit les valeurs des formControls = 0
          qte = this.fb.group({
            qte: [0, [Validators.min(0), Validators.required]],
          });
        }
      }
      // on ajoute le formControl crée au formArray
      this.qteForm.push(qte);
      // liste des valeurs max que le formControle peut atteindre
      this.listeMax.push(Number(this.data.produit.qte) / Number(emballage.qte));
    });
  }

  // recupérer la liste des emballages
  async getListeEmballages() {
    this.listeEmballages = await this.serviceEmballage
      .listeEmballage()
      .toPromise();

    // recupérer la liste des emballage d'un produit spécifique
    this.listeEmballages = this.listeEmballages.filter(
      (emballage: any) => emballage.idProduit === this.data.produit.id
    );
    // trier la liste d'emballage selon qte produit ascendante
    this.listeEmballages = this.listeEmballages.sort(
      (emballage1: any, emballage2: any) =>
        Number(emballage1.qte) > Number(emballage2.qte) ? 1 : -1
    );
  }
  // mise a jour du limite max de l'input qte pour eviter les fautes
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

  // fonction qui permet l'emballage du produit a chaque fois q'on change la valeur de l'input de qte
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

  // pour afficher la qte suggérée pour chaque emballage
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

  // bouton valider
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
  // bouton annuler
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

  ngOnInit() {
    console.log(this.data);
  }
}

// -------------------------------------------------------------------------------------------------------------
// *************************************** Boite Dialogue modifier position ************************************
// -------------------------------------------------------------------------------------------------------------
/**
 * Boite dialogue permet de modifier la position de destination du commande
 * Liste des fonctions:
 - getPositionsEnregistrees: recuperer les positions enregistrées pour un client specifique.
 - getPositionCommande: recuperer la position du commande a modifier.
 - setPositionClient: changer les variables du map pour afficher l'adresse selectionnée.
 - ajouterAdresse: ajouter une nouvelle adresse.
 - selectionnerAdresse: affecter l'adresse selectionné au variable positionClient puis on affiche la ville et la position du client.
 - selectionnerVille: on selectionnant une ville lors de l'ajout d'une nouvelle adresse on change la restrection pour afficher cette ville
   et on affiche le pin de localisation au centre de cette ville
 - positionerMarquer: pour positionner un marqueur sur le map.
 - modifierPositionMarquer: pour modifier la position du marqueur existant.
 - enregistrerModificationPositionClient: enregistrer les modifications
*/

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

  // liste des ville: restriction contienne les coordonnées des frontiers
  villes: any[] = [
    {
      nom: 'Bizerte',
      restriction: {
        latLngBounds: {
          east: 10.281852848894673,
          north: 37.34829803653758,
          south: 36.73985364691916,
          west: 9.078166160370051,
        },
        strictBounds: true,
      },
      centre: { lat: 37.27126, lng: 9.87275 },
    },
    {
      nom: 'Tunis',
      restriction: {
        latLngBounds: {
          east: 10.369407,
          north: 36.944782,
          south: 36.692089,
          west: 10.002771,
        },
        strictBounds: true,
      },
      centre: { lat: 36.80873, lng: 10.17725 },
    },
    {
      nom: 'Ariana',
      restriction: {
        latLngBounds: {
          east: 10.369407,
          north: 37.115684,
          south: 36.822141,
          west: 9.964339,
        },
        strictBounds: true,
      },
      centre: { lat: 36.866846352390134, lng: 10.16443428348491 },
    },
    {
      nom: 'Manouba',
      restriction: {
        latLngBounds: {
          east: 10.120446,
          north: 36.971596,
          south: 36.586412,
          west: 9.566758,
        },
        strictBounds: true,
      },
      centre: { lat: 36.83930078907781, lng: 9.851480819913181 },
    },
    {
      nom: 'Ben_Arous',
      restriction: {
        latLngBounds: {
          east: 10.409405,
          north: 36.808078,
          south: 36.455402,
          west: 10.036292,
        },
        strictBounds: true,
      },
      centre: { lat: 36.74323106793157, lng: 10.231852178069953 },
    },
    {
      nom: 'Zaghouan',
      restriction: {
        latLngBounds: {
          east: 10.391918,
          north: 36.665134,
          south: 36.001048,
          west: 9.589744,
        },
        strictBounds: true,
      },
      centre: { lat: 36.40887492219488, lng: 10.142431842323615 },
    },
    {
      nom: 'Nabeul',
      restriction: {
        latLngBounds: {
          east: 11.158589,
          north: 37.147098,
          south: 36.352522,
          west: 10.331798,
        },
        strictBounds: true,
      },
      centre: { lat: 36.45260407823169, lng: 10.733978179154175 },
    },
    {
      nom: 'Jendouba',
      restriction: {
        latLngBounds: {
          east: 9.079501,
          north: 37.010252,
          south: 36.351258,
          west: 8.151019,
        },
        strictBounds: true,
      },
      centre: { lat: 36.507273277503444, lng: 8.775626272270108 },
    },
    {
      nom: 'Beja',
      restriction: {
        latLngBounds: {
          east: 9.391172,
          north: 37.158356,
          south: 36.336546,
          west: 8.9106,
        },
        strictBounds: true,
      },
      centre: { lat: 36.733215168781705, lng: 9.183747660605322 },
    },
    {
      nom: 'Kef',
      restriction: {
        latLngBounds: {
          east: 9.167497,
          north: 36.454129,
          south: 35.611709,
          west: 8.253016,
        },
        strictBounds: true,
      },
      centre: { lat: 36.167803516442035, lng: 8.709592875826498 },
    },
    {
      nom: 'Siliana',
      restriction: {
        latLngBounds: {
          east: 9.77319,
          north: 36.478602,
          south: 35.4764,
          west: 8.926576,
        },
        strictBounds: true,
      },
      centre: { lat: 36.088625662341, lng: 9.365415531851905 },
    },
    {
      nom: 'Sousse',
      restriction: {
        latLngBounds: {
          east: 10.686171,
          north: 36.392708,
          south: 35.393671,
          west: 10.158135,
        },
        strictBounds: true,
      },
      centre: { lat: 35.824329709576716, lng: 10.634715497107086 },
    },
    {
      nom: 'Monastir',
      restriction: {
        latLngBounds: {
          east: 11.05078,
          north: 35.787226,
          south: 35.430507,
          west: 10.489467,
        },
        strictBounds: true,
      },
      centre: { lat: 35.76538079332432, lng: 10.810260717481093 },
    },
    {
      nom: 'Mahdia',
      restriction: {
        latLngBounds: {
          east: 11.165002,
          north: 35.589525,
          south: 35.07529,
          west: 10.15838,
        },
        strictBounds: true,
      },
      centre: { lat: 35.502026673770764, lng: 11.04582501599056 },
    },
    {
      nom: 'Kairouan',
      restriction: {
        latLngBounds: {
          east: 10.308173,
          north: 36.140414,
          south: 35.001079,
          west: 9.267905,
        },
        strictBounds: true,
      },
      centre: { lat: 35.67094533847933, lng: 10.10034611238224 },
    },
    {
      nom: 'Kasserine',
      restriction: {
        latLngBounds: {
          east: 9.332721,
          north: 35.793797,
          south: 34.622838,
          west: 8.247822,
        },
        strictBounds: true,
      },
      centre: { lat: 35.171870051979106, lng: 8.830651951411204 },
    },
    {
      nom: 'Sidi_Bouzid',
      restriction: {
        latLngBounds: {
          east: 10.06405,
          north: 35.48863,
          south: 34.262869,
          west: 8.918955,
        },
        strictBounds: true,
      },
      centre: { lat: 35.03605440343467, lng: 9.479140994112937 },
    },
    {
      nom: 'Sfax',
      restriction: {
        latLngBounds: {
          east: 11.392654,
          north: 35.27722,
          south: 34.171222,
          west: 9.686976,
        },
        strictBounds: true,
      },
      centre: { lat: 34.73984922073761, lng: 10.759952254881535 },
    },
    {
      nom: 'Gabes',
      restriction: {
        latLngBounds: {
          east: 10.483058,
          north: 34.28492,
          south: 33.265003,
          west: 9.231218,
        },
        strictBounds: true,
      },
      centre: { lat: 33.88798724691624, lng: 10.097962350508025 },
    },
    {
      nom: 'Mednine',
      restriction: {
        latLngBounds: {
          east: 11.607194,
          north: 33.91901,
          south: 32.261158,
          west: 9.703215,
        },
        strictBounds: true,
      },
      centre: { lat: 33.339915708515406, lng: 10.495960924901047 },
    },
    {
      nom: 'Tataouine',
      restriction: {
        latLngBounds: {
          east: 11.346294,
          north: 33.230216,
          south: 30.230582,
          west: 8.354969,
        },
        strictBounds: true,
      },
      centre: { lat: 32.92089024890151, lng: 10.451014949925623 },
    },
    {
      nom: 'Gafsa',
      restriction: {
        latLngBounds: {
          east: 9.580529,
          north: 34.813475,
          south: 34.064037,
          west: 8.028102,
        },
        strictBounds: true,
      },
      centre: { lat: 34.431806117336656, lng: 8.775923307783737 },
    },
    {
      nom: 'Tozeur',
      restriction: {
        latLngBounds: {
          east: 8.638445,
          north: 34.51628,
          south: 33.421554,
          west: 7.511445,
        },
        strictBounds: true,
      },
      centre: { lat: 33.919494971929026, lng: 8.123099702941756 },
    },
    {
      nom: 'Kebili',
      restriction: {
        latLngBounds: {
          east: 9.98737,
          north: 34.194418,
          south: 32.497867,
          west: 7.740516,
        },
        strictBounds: true,
      },
      centre: { lat: 33.707124933652835, lng: 8.971489104616344 },
    },
  ];
  //view port restrictions => les restrictions pour afficher que la tunisie si on n'a pas encore selectionner une ville ou adresse
  countryRestriction = {
    latLngBounds: {
      east: -149.73088535701655,
      north: 37.44246759017879,
      south: -35.95190678813464,
      west: -127.05509132479719,
    },
    strictBounds: true,
  };
  estNouvelleAdresse = false;
  private geoCoder: any;
  address: string;
  infoMarqueur: string;

  // @ViewChild('search')
  // public searchElementRef: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<BoiteDialogueModifierPositionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private serviceCommande: CommandeService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      adresse: ['', Validators.required],
      nouvelleVille: '',
      nouvelleAdresse: '',
    });
    await this.getPositionsEnregistrees();
    // this.initialiserMap()
  }

  // pour l'API de recherche des adresse presenté par google (besoin de payement)
  // initialiserMap() {
  //   //load Places Autocomplete
  //   this.mapsAPILoader.load().then(() => {
  //     this.geoCoder = new google.maps.Geocoder();
  //     let autocomplete = new google.maps.places.Autocomplete(
  //       this.searchElementRef.nativeElement
  //     );
  //     autocomplete.addListener('place_changed', () => {
  //       this.ngZone.run(() => {
  //         //get the place result
  //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();

  //         //verify result
  //         if (place.geometry === undefined || place.geometry === null) {
  //           return;
  //         }

  //         //set latitude, longitude and zoom
  //         this.latMap = place.geometry.location.lat();
  //         this.lngMap = place.geometry.location.lng();
  //         this.zoom = 12;
  //       });
  //     });
  //   });
  // }
  // getAddress(latitude: any, longitude: any) {
  //   this.geoCoder.geocode(
  //     { location: { lat: latitude, lng: longitude } },
  //     (results: any, status: any) => {
  //       console.log(results);
  //       console.log(status);
  //       if (status === 'OK') {
  //         if (results[0]) {
  //           this.zoom = 12;
  //           this.address = results[0].formatted_address;
  //         } else {
  //           window.alert('No results found');
  //         }
  //       } else {
  //         window.alert('Geocoder failed due to: ' + status);
  //       }
  //     }
  //   );
  // }

  // recuperer les positions enregistrées pour un client specifique
  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
    this.getPositionCommande();
    this.selectionnerAdresse();
  }

  // recuperer la position du commande a modifier
  getPositionCommande() {
    let i = this.positionsClientEnregistree.findIndex(
      (position: any) => position.id === this.data.commande.idPosition
    );
    this.form.get('adresse').setValue(i);
  }

  // changer les variables du map pour afficher l'adresse selectionnée
  async setPositionClient() {
    this.lat = this.positionClient.latitude;
    this.lng = this.positionClient.longitude;
    this.latMap = Number(this.positionClient.latitude);
    this.lngMap = Number(this.positionClient.longitude);
    this.zoom = 15;
    this.positionExiste = true;
    this.infoMarqueur = this.positionClient.adresse;
  }

  // ajouter une nouvelle adresse
  ajouterAdresse() {
    if (!this.estNouvelleAdresse) {
      // on affiche les input d'ajout adresse
      this.estNouvelleAdresse = true;
    } else if (
      this.form.get('nouvelleAdresse').value !== '' &&
      this.form.get('nouvelleVille').value !== ''
    ) {
      // creer et ajouter l'adresse a la liste des adresse enregistrées
      this.positionsClientEnregistree.push({
        adresse: this.form.get('nouvelleAdresse').value,
        ville: this.form.get('nouvelleVille').value.nom,
        latitude: this.lat,
        longitude: this.lng,
      });
      this.form.get('nouvelleAdresse').setValue('');
      this.form.get('nouvelleVille').setValue('');
      this.form
        .get('adresse')
        .setValue(this.positionsClientEnregistree.length - 1);
      this.positionClient =
        this.positionsClientEnregistree[
          this.positionsClientEnregistree.length - 1
        ];
      this.estNouvelleAdresse = false;
    }
  }

  // affecter l'adresse selectionné au variable positionClient puis on affiche la ville et la position du client
  selectionnerAdresse() {
    let ville: any;
    this.positionClient =
      this.positionsClientEnregistree[this.form.get('adresse').value];
    this.villes.forEach((v) => {
      v.nom === this.positionClient.ville ? (ville = v) : '';
    });
    this.countryRestriction = ville.restriction;
    this.setPositionClient();
  }

  // on selectionnant une ville lors de l'ajout d'une nouvelle adresse on change la restrection pour afficher cette ville
  // et on affiche le pin de localisation au centre de cette ville
  selectionnerVille() {
    this.countryRestriction = this.form.get('nouvelleVille').value.restriction;
    this.latMap = this.form.get('nouvelleVille').value.centre.lat;
    this.lngMap = this.form.get('nouvelleVille').value.centre.lng;
    this.positionExiste = true;
    this.lat = this.form.get('nouvelleVille').value.centre.lat;
    this.lng = this.form.get('nouvelleVille').value.centre.lng;
  }

  //pour positionner un marqueur sur le map
  positionerMarquer(event: any) {
    if (!this.positionExiste) {
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }
  }
  //pour modifier la position du marqueur existant
  modifierPositionMarquer(event: any) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;
    // this.getAddress(this.lat, this.lat);
  }

  // enregistrer les modifications
  async enregistrerModificationPositionClient() {
    // lors de creation d'une nouvelle position on n'a pas ajouté l'id du client donc si idClient est undefined ca veut dire que
    // c'est une nouvelle adresse qui n'est pas enregitrée dans la base de donnée donc on l'enregistre
    if (this.positionClient.idClient === undefined) {
      let position: any = new FormData();
      this.positionClient.longitude = this.lng;
      this.positionClient.latitude = this.lat;
      position.append('idClient', this.data.commande.idClient);
      position.append('ville', this.positionClient.ville);
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
      formData.append('ville', this.positionClient.ville);
      formData.append('adresse', this.positionClient.adresse);

      await this.serviceCommande
        .modifierIdPositionDansTableCommande(formData)
        .toPromise();
    } else if (this.positionEstModifie) {
      // si la position deja existe on teste si elle etait modifié ou non si elle est modifié en enregistre les modifications dans la table position
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('ville', this.positionClient.ville);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      await this.serviceCommande.modifierPositionClient(position).toPromise();
    }
    // a la fin de nos modifications on change l'id du position, l'adresse et la ville dans le table commande
    this.data.commande.idPosition = this.positionClient.id;
    let formData: any = new FormData();
    formData.append('id', this.data.commande.id);
    formData.append('idPosition', this.positionClient.id);
    formData.append('ville', this.positionClient.ville);
    formData.append('adresse', this.positionClient.adresse);
    await this.serviceCommande
      .modifierIdPositionDansTableCommande(formData)
      .toPromise();

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
/**
 * Boite dialogue permet de modifier la liste de colisage
 * Liste des fonctions:
 - getListeColis: recuperer la liste des colis.
 - getListeEmballage: recuperer liste emballages.
 - getDetail: recuperer les details des commandes depuis le fichier xml
 - ouvrirBoiteDialogueEmballer: ouvrir boite de dialogue emballer.
 - ouvrirBoiteDialogueDetailProduit: ouvrir boite de dialogue detail produit.
 - creerListeEmballageChoisi: permet la creation de la liste des emballage que l'utilisateur a choisi.
 - getNombreArticles: retourne le nombre d'articles.
 - getDimensionsPack: retourne les dimensions d'un emballage.
 - getVolumePack: retourne le volume d'un emballage.
 - getPoidsPackNet: retourne le poids total net d'emballage.
 - getPoidsPackBrut: retourne le poids total brut d'un emballage.
 - nombrePackTotal: retourne le nombre d'emballages total.
 - volumeTotal: retourne le volume total d'une commande.
 - poidsTotalNet: retourne le poids total net d'une commande.
 - poidsTotalBrut: retourne le poids total brut d'une commande.
 - verifierValiditeListeProduits: ne permet pas la validation si la quantité non emballée diffirente de 0.
 - validerModification: valider la modification.
 */
@Component({
  selector: 'boite-dialogue-modifier-colisage',
  templateUrl: 'boite-dialogue-modifier-colisage.html',
  styleUrls: ['boite-dialogue-modifier-colisage.scss'],
})
export class BoiteDialogueModifierColisage implements OnInit {
  listeColis: any;
  listeArticlesDetail: any = [];
  indicateurTypeCommande: String;
  articles: any;
  listeEmballage: any;
  listeProduitDansListeEmballage: any;
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
    await this.getListeEmballage();
    this.getDetail();
  }

  // recuperer la liste des colis
  async getListeColis() {
    this.listeColis = await this.serviceCommande
      .getListeColisParIdCommande(this.data.commande.referenceDocument)
      .toPromise();
  }

  // recuperer liste emballages
  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }

  // recuperer les details des commandes depuis le fichier xml
  async getDetail() {
    let listeEmballageChoisi: any = [];
    if (this.data.modeManuel) {
      // si le mode est manuel on recupere le fichier xml detail depuis la machine local
      let date = this.data.commande.dateCreation.split('T');
      let dateDivise = date[0].split('-');
      date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      let nomFichier = this.data.commande.nomFichier;
      let detail = await this.serviceCommande
        .loadXML(date, nomFichier)
        .toPromise();
      // on recupére les detail necessaire depuis le fichier qu'on a chargé
      this.data.commande.type === 'Facture'
        ? (this.articles = await getDetail(detail, 'facture'))
        : (this.articles = await getDetail(detail, 'bl'));
    } else {
      if (this.data.commande.type === 'Facture') {
        var detail = await this.serviceCommande
          .Detail_Facture(this.data.commande.referenceDocument)
          .toPromise();
        this.articles = await getDetail(detail, 'facture');
      } else {
        var detail = await this.serviceCommande
          .Detail_BL(this.data.commande.referenceDocument)
          .toPromise();
        this.articles = await getDetail(detail, 'bl');
      }
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

  // ouvrir boite de dialogue emballer
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

  // ouvrir boite de dialogue detail produit
  ouvrirBoiteDialogueDetailProduit(article: any) {
    const dialogRef = this.dialog.open(BoiteDialogueDetailProduit, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '600px',
      data: { produit: article },
    });
  }

  // permet la creation de la liste des emballage que l'utilisateur a choisi
  creerListeEmballageChoisi() {
    this.listeEmballageChoisi = [];
    this.listeArticlesDetail.forEach((article: any) => {
      this.listeEmballageChoisi = this.listeEmballageChoisi.concat(
        article.listeEmballageChoisi
      );
    });
  }

  // retourne le nombre d'articles
  getNombreArticles(article: any) {
    return article.qte * article.emballage.qte;
  }

  // retourne les dimensions d'un emballage
  getDimensionsPack(article: any) {
    return (
      article.emballage.longueur +
      'x' +
      article.emballage.largeur +
      'x' +
      article.emballage.hauteur
    );
  }

  //  retourne le volume d'un emballage
  getVolumePack(article: any) {
    return article.emballage.volume * article.qte;
  }

  // retourne le poids total net d'emballage
  getPoidsPackNet(article: any) {
    return article.emballage.poids_total_net * article.qte;
  }

  // retourne le poids total brut d'un emballage
  getPoidsPackBrut(article: any) {
    return article.emballage.poids_emballage_total * article.qte;
  }

  // retourne le nombre d'emballages total
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      nombrePack += emballage.qte;
    });
    return nombrePack;
  }

  // retourne le volume total d'une commande
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      volumeTotal += emballage.emballage.volume;
    });
    return volumeTotal.toFixed(2);
  }

  // retourne le poids total net d'une commande
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(2);
  }

  // retourne le poids total brut d'une commande
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(2);
  }

  // ne permet pas la validation si la quantité non emballée diffirente de 0
  verifierValiditeListeProduits() {
    this.estValide = true;
    this.listeArticlesDetail.forEach((element: any) => {
      element.qteNonEmballe !== 0 ? (this.estValide = false) : '';
    });
  }

  //valider la modification
  async validerModification() {
    await this.serviceCommande
      .deleteColisParIdCommande(this.data.commande.id)
      .toPromise();
    for (let i = 0; i < this.listeEmballageChoisi.length; i++) {
      let listeColisage: any = new FormData();
      let emballage = this.listeEmballageChoisi[i];
      listeColisage.append('idCommande', this.data.commande.id);
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
      Swal.fire({
        icon: 'success',
        title: 'Liste colisage est bien modifiée',
        showConfirmButton: false,
        timer: 1500,
      });
      this.dialogRef.close();
    }
  }
}

// -------------------------------------------------------------------------------------------------------------
//********************************************** boite-dialogue-info-commande **********************************
// -------------------------------------------------------------------------------------------------------------
/**
 * Boite dialogue permet d'afficher les détails d'une commande
 * Liste des fonctions:
 - getLocalisationClient: recuperer la position du client pour la commande selectionnée.
 - getListeColisage: recuperer la liste de colisage du commande selectionnée.
 - get nombrePackTotal: retourne le nombre d'emballages total.
 - get volumeTotal: retourne le volume total d'une commande.
 - get poidsTotalNet: retourne le poids total net d'une commande.
 - get poidsTotalBrut: retourne le poids total brut d'une commande.
 - ouvrirBoiteDialogueModifierPosition: ouvrir la boite de dialogue de modification de position.
 - ouvrirBoiteDialogueModifierColisage: ouvrir boite de dialogue modifier colisage.
 */
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
  ville: string;
  adresse: string;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  constructor(
    private dialogRef: MatDialogRef<InformationCommandeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceCommande: CommandeService,
    private dialog: MatDialog
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }
  async ngOnInit() {
    await this.getLocalisationClient();
    await this.getListeColisage();
  }

  // recuperer la position du client pour la commande selectionnée
  async getLocalisationClient() {
    this.localisationClient = await this.serviceCommande
      .getPositionById(this.data.commande.idPosition)
      .toPromise();
    this.longitude = Number(this.localisationClient.longitude);
    this.latitude = Number(this.localisationClient.latitude);
    this.ville = this.localisationClient.ville;
    this.adresse = this.localisationClient.adresse;
  }

  // recuperer la liste de colisage du commande selectionnée
  async getListeColisage() {
    this.listeColisage = await this.serviceCommande
      .getListeColisParIdCommande(this.data.commande.id)
      .toPromise();
  }

  // retourne le nombre d'emballages total
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeColisage.forEach((colis: any) => {
      nombrePack += colis.nombrePack;
    });
    return nombrePack;
  }

  // retourne le volume total d'une commande
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeColisage.forEach((colis: any) => {
      volumeTotal += colis.volume;
    });
    return volumeTotal.toFixed(3);
  }

  // retourne le poids total net d'une commande
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(3);
  }

  // retourne le poids total brut d'une commande
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(3);
  }

  // ouvrir la boite de dialogue de modification de position
  ouvrirBoiteDialogueModifierPosition(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierPositionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getLocalisationClient();
      this.getListeColisage();
    });
  }

  // ouvrir boite de dialogue modifier colisage
  ouvrirBoiteDialogueModifierColisage(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierColisage, {
      width: '1000px',
      maxWidth: '95vw',
      data: { commande: commande, modeManuel: this.data.modeManuel },
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
//pour avoir les ids et les qtes des produits dans une facture
async function getDetail(detail: any, typeCommande: string) {
  var fichier: any;
  var xmldata: any;
  var new_obj: any;
  var articles: any = [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        articles = [];
        fichier = reader.result;
        var parseString = require('xml2js').parseString;
        let data1;
        parseString(atob(fichier.substr(28)), function (err: any, result: any) {
          typeCommande === 'facture'
            ? (data1 = result.Facture)
            : (data1 = result.Bon_Livraison);
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
        if (xmldata.Produits[0].Produits_N_Lot[0].Produit) {
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
              numeroLot.dateFabrication =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Date_Fabrication[0];
              numeroLot.dateValidite =
                xmldata.Produits[0].Produits_N_Lot[0].Produit[
                  i
                ].N_Lots[0].N_Lot[j].Date_Validite[0];
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

class CoefficientsFraisLivraison {
  id: number;
  taxeFixe: number;
  limite: number;
  uniteLimite: string;
  taxeSupplimentaire: number;
  limiteTaxeSupp: number;

  constructor( 
    taxeFixe: number, 
    limite: number, 
    uniteLimite: string, 
    taxeSupplimentaire: number, 
    limiteTaxeSupp: number
) {
    this.taxeFixe = taxeFixe
    this.limite = limite
    this.uniteLimite = uniteLimite
    this.taxeSupplimentaire = taxeSupplimentaire
    this.limiteTaxeSupp = limiteTaxeSupp
  }

}

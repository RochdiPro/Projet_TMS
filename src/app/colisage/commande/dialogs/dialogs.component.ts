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

  getTypeCommande() {
    if (this.data.commande.type === 'Facture') {
      this.typeDocument = 'Facture';
    } else {
      this.typeDocument = 'Bon Livraison';
    }
  }

  async getDetail() {
    if (this.data.modeManuel) {
      let date = this.data.commande.dateCreation;
      let dateDivise = date.split('-');
      date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      let nomFichier = this.data.commande.nomFichier;
      let detail = await this.serviceCommande
        .loadXML(date, nomFichier)
        .toPromise();
      this.data.commande.type === 'Facture'
        ? (this.articles = await getDetail(detail, 'facture'))
        : (this.articles = await getDetail(detail, 'bl'));
    } else {
      if (this.data.commande.type === 'Facture') {
        let detail = await this.serviceCommande
          .Detail_Facture(this.data.commande.id)
          .toPromise();
        this.articles = await getDetail(detail, 'facture');
      } else {
        let detail = await this.serviceCommande
          .Detail_BL(this.data.commande.id)
          .toPromise();
        this.articles = await getDetail(detail, 'bl');
      }
    }
    for (let i = 0; i < this.articles.length; i++) {
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
  score: Number;
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

  // @ViewChild('search')
  // public searchElementRef: ElementRef;

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
    this.villes.sort((a: any, b: any) => (a.nom > b.nom ? 1 : -1));
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
    // this.initialiserMap()
  }

  getTypeDocument() {
    this.indicateurTypeCommande = this.data.commande.reference.split('-')[0];
    if (this.indicateurTypeCommande === 'F') this.typeDocument = 'Facture';
    else this.typeDocument = 'Bon Livraison';
  }

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

  async setPositionClient() {
    this.lat = Number(this.positionClient.latitude);
    this.lng = Number(this.positionClient.longitude);
    this.latMap = Number(this.positionClient.latitude);
    this.lngMap = Number(this.positionClient.longitude);
    this.zoom = 15;
    this.positionExiste = true;
    this.infoMarqueur = this.positionClient.adresse;
  }

  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
  }

  ajouterAdresse() {
    if (!this.estNouvelleAdresse) {
      this.estNouvelleAdresse = true;
    } else if (
      this.firstFormGroup.get('nouvelleAdresse').value !== '' &&
      this.firstFormGroup.get('nouvelleVille').value !== ''
    ) {
      this.positionsClientEnregistree.push({
        adresse: this.firstFormGroup.get('nouvelleAdresse').value,
        ville: this.firstFormGroup.get('nouvelleVille').value.nom,
        latitude: this.lat,
        longitude: this.lng,
      });
      this.firstFormGroup.get('nouvelleAdresse').setValue('');
      this.firstFormGroup.get('nouvelleVille').setValue('');
      this.firstFormGroup
        .get('adresse')
        .setValue(this.positionsClientEnregistree.length - 1);
      this.positionClient =
        this.positionsClientEnregistree[
          this.positionsClientEnregistree.length - 1
        ];
      this.estNouvelleAdresse = false;
    }
  }

  selectionnerAdresse() {
    let ville: any;
    this.positionClient =
      this.positionsClientEnregistree[this.firstFormGroup.get('adresse').value];
    this.villes.forEach((v) => {
      v.nom === this.positionClient.ville ? (ville = v) : '';
    });
    this.countryRestriction = ville.restriction;
    this.setPositionClient();
  }

  selectionnerVille() {
    this.countryRestriction =
      this.firstFormGroup.get('nouvelleVille').value.restriction;
    this.latMap = this.firstFormGroup.get('nouvelleVille').value.centre.lat;
    this.lngMap = this.firstFormGroup.get('nouvelleVille').value.centre.lng;
    this.positionExiste = true;
    this.lat = this.firstFormGroup.get('nouvelleVille').value.centre.lat;
    this.lng = this.firstFormGroup.get('nouvelleVille').value.centre.lng;
  }

  async getListeEmballage() {
    this.listeEmballage = await this.serviceEmballage
      .listeEmballage()
      .toPromise();
  }
  async getDetail() {
    if (this.data.modeManuel) {
      let date = this.data.commande.dateCreation;
      let dateDivise = date.split('-');
      date = dateDivise[2] + '-' + dateDivise[1] + '-' + dateDivise[0];
      let nomFichier = this.data.commande.nomFichier;
      let detail = await this.serviceCommande
        .loadXML(date, nomFichier)
        .toPromise();
      this.data.commande.type === 'Facture'
        ? (this.articles = await getDetail(detail, 'facture'))
        : (this.articles = await getDetail(detail, 'bl'));
    } else {
      if (this.data.commande.type === 'Facture') {
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

  modifierPositionMarquer(event: any) {
    //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.positionEstModifie = true;
    // this.getAddress(this.lat, this.lat);
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
      this.setValiditeListeProduits();
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

  setValiditeListeProduits() {
    let deuxiemeStepEstValide = true;
    this.listeArticlesDetail.forEach((element: any) => {
      element.qteNonEmballe !== 0 ? (deuxiemeStepEstValide = false) : '';
    });
    deuxiemeStepEstValide
      ? this.secondFormGroup.get('secondCtrl').setValue('valide')
      : this.secondFormGroup.get('secondCtrl').setValue('');
  }

  verifierValiditeDeuxiemeStep() {
    if (this.secondFormGroup.get('secondCtrl').value === '') {
      Swal.fire({
        icon: 'error',
        text: "Il y'a des produits qui ne sont pas encore emballés!",
      });
    }
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
      if (this.data.commande.type === 'Facture') {
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
    let fraisLivraison = 7; //frais livraison temporaire jusqu'a avoir la formule
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

    let retard = 0; //provisoirement jusqu'a savoir comment calculer le retard
    this.score =
      prix * coefficientScoreCommande.prixFacture +
      fraisLivraison * coefficientScoreCommande.fraisLivraison +
      scoreClient * coefficientScoreCommande.client +
      retard * coefficientScoreCommande.retard;
  }

  trackingNumber = () => {
    let trackingNumber = '';
    for (let i = 0; i < 15; i++) trackingNumber += ~~(Math.random() * 10);
    return Number(trackingNumber);
  };

  async enregistrer() {
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
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('ville', this.positionClient.ville);
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

    await this.serviceCommande.creerCommande(commande).toPromise();
    await this.serviceCommande
      .modifierEtatCommandeDansExcel(
        this.data.commande.dateCreation,
        this.data.commande.type,
        this.data.commande.nomFichier
      )
      .toPromise();
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
      volumeTotal += this.getVolumePack(emballage);
    });
    return volumeTotal.toFixed(3);
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalNet += this.getPoidsPackNet(emballage);
    });
    return poidsTotalNet.toFixed(3);
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeEmballageChoisi.forEach((emballage: any) => {
      poidsTotalBrut += this.getPoidsPackBrut(emballage);
    });
    return poidsTotalBrut.toFixed(3);
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
              qte: [emb[0].qte, [Validators.min(0), Validators.required]],
            });
          } else {
            qte = this.fb.group({
              qte: [0, [Validators.min(0)], Validators.required],
            });
          }
        } else {
          qte = this.fb.group({
            qte: [0, [Validators.min(0), Validators.required]],
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

  async getPositionsEnregistrees() {
    this.positionsClientEnregistree = await this.serviceCommande
      .positionClient(this.data.commande.idClient)
      .toPromise();
    this.getPositionCommande();
    this.selectionnerAdresse();
  }

  getPositionCommande() {
    let i = this.positionsClientEnregistree.findIndex(
      (position: any) => position.id === this.data.commande.idPosition
    );
    this.form.get('adresse').setValue(i);
  }

  async setPositionClient() {
    this.lat = this.positionClient.latitude;
    this.lng = this.positionClient.longitude;
    this.latMap = Number(this.positionClient.latitude);
    this.lngMap = Number(this.positionClient.longitude);
    this.zoom = 15;
    this.positionExiste = true;
    this.infoMarqueur = this.positionClient.adresse;
  }

  ajouterAdresse() {
    if (!this.estNouvelleAdresse) {
      this.estNouvelleAdresse = true;
    } else if (
      this.form.get('nouvelleAdresse').value !== '' &&
      this.form.get('nouvelleVille').value !== ''
    ) {
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

  fonctionComparaisonPosition(option: any, value: any): boolean {
    return option.id === value.id;
  }

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

  selectionnerVille() {
    this.countryRestriction = this.form.get('nouvelleVille').value.restriction;
    this.latMap = this.form.get('nouvelleVille').value.centre.lat;
    this.lngMap = this.form.get('nouvelleVille').value.centre.lng;
    this.positionExiste = true;
    this.lat = this.form.get('nouvelleVille').value.centre.lat;
    this.lng = this.form.get('nouvelleVille').value.centre.lng;
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
    // this.getAddress(this.lat, this.lat);
  }

  async enregistrerModificationPositionClient() {
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
      let position: any = new FormData();
      position.append('id', this.positionClient.id);
      position.append('idClient', this.positionClient.idClient);
      position.append('ville', this.positionClient.ville);
      position.append('adresse', this.positionClient.adresse);
      position.append('longitude', this.lng);
      position.append('latitude', this.lat);

      await this.serviceCommande.modifierPositionClient(position).toPromise();
    }
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
      this.articles = await getDetail(detail, 'facture');
    } else {
      var detail = await this.serviceCommande
        .Detail_BL(this.idDocument)
        .toPromise();
      this.articles = await getDetail(detail, 'bl');
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

  async getLocalisationClient() {
    this.localisationClient = await this.serviceCommande
      .getPositionById(this.data.commande.idPosition)
      .toPromise();
    this.longitude = Number(this.localisationClient.longitude);
    this.latitude = Number(this.localisationClient.latitude);
    this.ville = this.localisationClient.ville;
    this.adresse = this.localisationClient.adresse;
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
    return volumeTotal.toFixed(3);
  }

  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(3);
  }

  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColisage.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(3);
  }

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
async function getDetail(detail: any, typeCommande: string) {
  //pour avoir les ids et les qtes des produits dans une facture
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
        console.log(typeCommande);
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
        console.log(articles);
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

import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MissionsService } from './services/missions.service';


//les interfaces necessaires pour le chargement des tableau

export interface tableMissions { //inteface pour charger le table mission
  id: number;
  nom: string;
  matricule: String;
  dateLivraison: String;
  etatMission: String;
  idE: number;
}

export interface Commandes { //interface pour charger la liste des commandes
  reference: number;
  id_expediteur: number;
  expediteur: String;
  adresse_expediteur: String;
  contact_expediteur: String;
  telephone_expediteur: number;
  id_destinataire: number;
  destinataire: String;
  adresse_destinataire: String;
  contact_destinataire: String;
  telephone_destinataire: number;
  date_commande: String;
  type: String;
  nbr_obj: number;
  description: String;
  articles: String;
}

export interface tableCommandes {
  id: number;
  idMission: number;
  referenceCommande: number;
  destinataire: string;
  destination: String;
  etat: String;
}

export interface tableFactures { //interface pour charger liste des factures
  id_Facture: number;
  id_Clt: number;
}

export interface tableBL { //interface pour charger liste des bls
  id_Bl: number;
  id_Clt: number;
}

//--------------------------------------------------------------------------------------------------------------
//----------------------------------------------- TAB MISSIONS -------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})

export class MissionsComponent implements OnInit {
  listerMissionEstActive = false;
  ajouterMissionEstActive = false;


  constructor(public router: Router) { }

  ngOnInit() {
    if (this.router.url === '/Menu/TMS/Missions/Liste_Missions') this.activerListerMissions();
    if (this.router.url === '/Menu/TMS/Missions/Ajouter_Missions') this.activerAjouterMissions();
  }

  activerListerMissions() {
    this.listerMissionEstActive = true;
    this.ajouterMissionEstActive = false;
  }
  activerAjouterMissions() {
    this.listerMissionEstActive = false;
    this.ajouterMissionEstActive = true;
  }
}


// *******************************************************************************************************************
// ***************************************Lister Missions*************************************************************
// *******************************************************************************************************************
// @Component({
//   selector: 'app-lister-missions',
//   templateUrl: './lister-missions.html',
//   styleUrls: ['./lister-missions.scss']
// })

// export class ListerMissionsComponent implements OnInit, AfterViewInit {
//   today = new Date();
//   date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0);
//   form = new FormGroup({ dateL: new FormControl(this.date), nom: new FormControl(""), matricule: new FormControl("") });
//   filtreEtatMission = "";  //utilisée dans le filtrage par etat mission
//   nomFiltre = false;   //utilisée pour l'activation ou désactivation du filtrage par nom
//   matriculeFiltre = false;  //utilisée pour l'activation ou désactivation du filtrage par matricule
//   dateFiltre = false;   //utilisée pour l'activation ou désactivation du filtrage par date
//   etatMissionFiltre = false;  //utilisée pour l'activation ou désactivation du filtrage par etatMission
//   displayedColumns: string[] = ['id', 'nom', 'matricule', 'dateLivraison', 'trajet', 'etatMission', 'actions', 'Detail']; //les colonne du tableau mission
//   dataSource = new MatTableDataSource<tableMissions>();
//   dateRecherche: any;
//   check = true;
//   mission: any;
//   trajet: any;
//   destinations: any = [];
//   destinationsOptimise: any = [];
//   commande: any;



//   constructor(public service: MissionsService, public datepipe: DatePipe, private router: Router, private dialog: MatDialog) {
//     // this.refresh();
//   }
//   // refresh() { // rafraichir la liste des missions
//   //   this.service.missions().subscribe(res => {
//   //     this.dataSource.data = res as tableMissions[];
//   //     this.filtrerMission();

//   //   });
//   // }
//   viderNom() { //pour vider le champs de filtrage par chauffeur
//     this.nomFiltre = false;
//     this.form.controls['nom'].setValue('');
//     this.filtrerMission();
//   }
//   viderMatricule() { //pour vider le champs de filtrage par matricule
//     this.matriculeFiltre = false;
//     this.form.controls['matricule'].setValue('');
//     this.filtrerMission();
//   }
//   filtrerMission() { //pour faire le filtrage des missions
//     if (this.filtreEtatMission === undefined) this.filtreEtatMission = "";
//     this.date = new Date(this.form.get('dateL').value);
//     this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
//     this.service.filtrerMissions("date_creation", this.dateRecherche, "nom_chauffeur", this.form.get('nom').value, "matricule", this.form.get('matricule').value, "etat_mission", this.filtreEtatMission).subscribe(res => {
//       this.dataSource.data = res as tableMissions[];
//       this.dataSource.sort = this.sort;
//       this.dataSource.paginator = this.paginator;
//     });
//   }
//   disableEnableDate() { //pour activer et desactiver le filtrage par date
//     if (this.check) {
//       this.form.controls['dateL'].enable();
//     } else {
//       this.form.controls['dateL'].disable();
//     }
//   }
//   changerEtatMission(id: any) { //pour changer l'état du mission
//     // this.service.filtrerCommande("id_mission", id).subscribe(res => {
//     //   this.commande = res;
//     //   var formData: any = new FormData();
//     //   var termine = true;
//     //   this.commande.forEach((element: any) => {
//     //     if (element.etat === "En Cours") {
//     //       termine = false;
//     //     }
//     //   });
//     //   if (termine) { //si la mission est terminée on change l'etat du véhicule vers disponible est on réinitialise la surface et le poids restants du véhicule

//     //     formData.append("id", id);
//     //     formData.append("valeur", "Terminée"); //mise a jour etat mission vers terminée
//     //     this.service.mission(id).subscribe((affectation: any) => {
//     //       this.service.vehicules().subscribe((vehicule: any) => {
//     //         let v = vehicule.filter((x: any) => x.matricule == affectation.matricule);


//     //         let formData = new FormData();
//     //         formData.append("id", v[0].id);
//     //         formData.append("etatVehicule", "Disponible"); //changer etat vehicule vers disponible
//     //         this.service.majEtatVehicule(formData);
//     //         let formData2: any = new FormData();
//     //         formData2.append("id", v[0].id);
//     //         formData2.append("charge_restante", v[0].charge_utile);
//     //         formData2.append("surface_restante", v[0].longueur * v[0].largeur * v[0].hauteur); //reinitialise le poids et la surface
//     //         // this.service.majChargeEtSurface(formData2);
//     //       });
//     //     });
//     //   } else {
//     //     formData.append("id", id);
//     //     formData.append("valeur", "En Cours"); //mise a jour etat mission vers en cours
//     //     this.service.mission(id).subscribe((affectation: any) => {
//     //       this.service.vehicules().subscribe((vehicule: any) => {
//     //         let v = vehicule.filter((x: any) => x.matricule == affectation.matricule);


//     //         let formData3 = new FormData();
//     //         formData3.append("id", v[0].id);
//     //         formData3.append("etatVehicule", "En Mission"); //changer etat vehicule vers en mission
//     //         this.service.majEtatVehicule(formData3);
//     //       });
//     //     });
//     //   }

//     //   this.service.majEtatMission(formData);
//     //   setTimeout(() => { this.refresh() }, 100);

//     // });
//   }
//   supprimmerMission(id: any) {

//   }
//   // ouvrirQR(id: any) {
//   //   localStorage.setItem("idMission", id);
//   //   this.service.affectation(id).subscribe((aff: any) => {
//   //     localStorage.setItem("etatMission", aff.etatMission);
//   //     const dialogRef = this.dialog.open(QrCodeComponent, {
//   //       width: '200px',
//   //       height: '200px',
//   //       panelClass: 'qr-code',
//   //       autoFocus: false,
//   //     });
//   //   });

//   // }


//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;


//   ngAfterViewInit() {
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }

//   ngOnInit(): void {
//   }


//   ouvrirAffecterCommande() { // ouvrir la boite de dialogue d'affectation des commandes
//     localStorage.setItem('date', this.form.get('dateL').value);
//     const dialogRef = this.dialog.open(AffecterCommande, {
//       width: '450px',
//       panelClass: "custom-dialog",
//       autoFocus: false,
//     });
//     dialogRef.afterClosed().subscribe(result => {
//       this.filtrerMission();


//     });
//   }



//   detailDialog(id: any, idM: any): void { // ouvrir la boite de dialogue de détail d'une mission
//     localStorage.setItem('idC', id);
//     localStorage.setItem('idM', idM);
//     const dialogRef = this.dialog.open(DetailComponent, {
//       width: '70vw',
//       panelClass: "custom-dialog-detail",
//       autoFocus: false,
//     });

//   }
//   ouvrirMap(id: any, type: any) { // ouvrir google map avec le trajet
//     this.service.mission(id).subscribe(res => {
//       this.mission = res;
//       this.trajet = this.mission.trajet.split("/"); //recuperation du trajet
//       var origine = this.trajet[0].split(":");
//       origine = origine[1]; //definitionde l'origine
//       var finChemin = this.trajet[this.trajet.length - 1].split(":");
//       finChemin = finChemin[1]; //definition du fin de chemin
//       var pointStop = '';
//       for (let i = 1; i < this.trajet.length - 1; i++) {
//         var x = this.trajet[i].split(":");
//         pointStop += x[1] + '%7C';
//       }
//       pointStop = pointStop.slice(0, -3); //definition des points de stop
//       window.open("https://www.google.com/maps/dir/?api=1&origin=" + origine + "&destination=" + finChemin + "&travelmode=driving&waypoints=" + pointStop); //affichage du map avec le trajet

//     });

//   }



// }




//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------Detail Component------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

// @Component({
//   selector: 'app-detail',
//   templateUrl: './detail.html',
//   styleUrls: ['./detail.scss'],
//   animations: [
//     trigger('detailExpand', [
//       state('collapsed', style({ height: '0px', minHeight: '0' })),
//       state('expanded', style({ height: '*' })),
//       transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
//     ]),
//   ],
// })
// export class DetailComponent implements OnInit {
//   employe: any;
//   id: any;
//   idMission: any;
//   mission: any;
//   mis: any;
//   nbr_commandes: any;
//   poids_global = 0;
//   surface_globale = 0;
//   displayedColumns: string[] = ['referenceCommande', 'expediteur', 'mapExp', 'destinataire', 'mapDest', 'dateLivraison', 'etat', 'action'];
//   dataSource = new MatTableDataSource<tableCommandes>();
//   expandedElement: tableCommandes | null;
//   date_creation: any;
//   constructor(public serviceMission: MissionsService, private serviceChauffeur: ChauffeurService, public _DomSanitizationService: DomSanitizer, private dialog: MatDialog, private router: Router) {
//     this.refresh();
//   }
//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;


//   ngAfterViewInit() {
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }


//   ngOnInit(): void {
//   }
//   refresh() { // rafraichier la liste des commandes et calcule du poids et surface global
//     this.id = localStorage.getItem('idC');
//     this.idMission = localStorage.getItem('idM');
//     this.serviceChauffeur.employe(this.id).subscribe((data) => {
//       this.employe = data;
//     });
//     this.serviceMission.mission(this.idMission).subscribe(res => {
//       this.mission = res;
//       this.date_creation = this.mission.date_creation;

//     });
//     this.serviceMission.filtrerCommande("id_mission", this.idMission).subscribe(res => { //recuperer la commande par l'id du mission
//       this.dataSource.data = res as tableCommandes[];
//       this.dataSource.sort = this.sort;
//       this.dataSource.paginator = this.paginator;
//       this.mis = res;
//       this.nbr_commandes = this.mis.length;
//       this.mis.forEach((x: any) => {
//       });
//       this.mis.forEach((x: any) => {
//         let articlesCommande = x.articles.split(",");
//         let surfaceCommande = 0;
//         let poidsCommande = 0;
//         articlesCommande.forEach((element: any) => {
//           let article = element.split("/");
//           let poidsArticle = article[2].split(":")[1];
//           let dimensionsArticle = article[1].split(":")[1].split("x");
//           let surfaceArticle = 1;
//           dimensionsArticle.forEach((d: any) => {
//             surfaceArticle *= Number(d);
//           });
//           poidsArticle *= article[0].split("x")[0];
//           poidsCommande += poidsArticle;
//           surfaceArticle *= article[0].split("x")[0];
//           surfaceCommande += surfaceArticle;
//         });
//         this.surface_globale += surfaceCommande;
//         this.poids_global += poidsCommande;
//       });
//     });
//   }

//   supprimerCommande(id: any) { // supprimer une commande
//     this.serviceMission.supprimerCommande(id);
//     window.setTimeout(() => {
//       this.refresh();
//     }, 100);

//   }
//   terminerCommande(id: any) { //marquer une commande comme livrée
//     var formData: any = new FormData();
//     formData.append("etat", "Done");
//     this.serviceMission.majEtat(id, formData);
//     window.setTimeout(() => {
//       this.refresh();
//     }, 100);
//   }
//   ouvrirMap(id: any, type: any) { // ouvrir le map avec la position du client ou de l'expediteur

//     localStorage.setItem('idCom', id);
//     localStorage.setItem('type', type)
//     const dialogRef = this.dialog.open(MapsComponent, {
//       width: '70vw',
//       autoFocus: false,
//     });
//   }

// }


//------------------------------boite dialogue MAPS-------------------------------

// @Component({
//   selector: 'app-maps',
//   templateUrl: './maps.html',
//   styleUrls: ['./maps.scss'],
// })
// export class MapsComponent {
//   lat: any;
//   long: any
//   id: any;
//   commande: any;
//   type: any;
//   expediteur = false;
//   destinataire = false;
//   trajet = false;

//   origin: ILatLng = {
//     latitude: 34.74056,
//     longitude: 10.76028
//   };
//   destination: ILatLng = {
//     latitude: 34.74056,
//     longitude: 10.76028
//   };
//   displayDirections = false;
//   zoom = 15;


//   constructor(public serviceMission: MissionsService) {
//     this.id = localStorage.getItem("idCom");
//     this.type = localStorage.getItem("type");
//     this.serviceMission.commande(this.id).subscribe((data) => {
//       this.commande = data;
//       if (this.type === "expediteur") { //afficher la position de l'expediteur
//         var x = this.commande.positionExp.split(",");
//         this.lat = Number(x[0]);
//         this.long = Number(x[1]);
//         this.origin.latitude = Number(x[0]);
//         this.origin.longitude = Number(x[1]);
//         this.displayDirections = false;
//         this.expediteur = true;
//       } else if (this.type === "destinataire") { //afficher la position de l'expediteur
//         var x = this.commande.positionDest.split(",");
//         this.lat = Number(x[0]);
//         this.long = Number(x[1]);
//         this.destination.latitude = Number(x[0]);
//         this.destination.longitude = Number(x[1]);
//         this.displayDirections = false;
//         this.destinataire = true;

//       }
//     });
//   }


// }

//--------------------------------------------------------------------------------------------------------------------
//------------------------------------Boite de dialogue affecter commandes--------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'app-affecterCommande',
  templateUrl: './affecterCommande.html',
  styleUrls: ['./affecterCommande.scss'],
})
export class AffecterCommande {
  commandes: Commandes[] = [
    {
      reference: 100920211, id_expediteur: 1, expediteur: 'Hydrogen', adresse_expediteur: "Sfax", contact_expediteur: 'Salah', telephone_expediteur: 22222222,
      id_destinataire: 1, destinataire: "Foulen1", adresse_destinataire: "Tunis", contact_destinataire: "Foulen1", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:8x9x10/poids:6.8,10xarticle2/dimensions:7x8x10/poids:6.8"
    },
    {
      reference: 100920212, id_expediteur: 2, expediteur: 'Helium', adresse_expediteur: "Sfax", contact_expediteur: 'Ali', telephone_expediteur: 22222222,
      id_destinataire: 2, destinataire: "Foulen2", adresse_destinataire: "Sfax", contact_destinataire: "Foulen2", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:12x7x10/poids:8.8,10xarticle2/dimensions:8x7x10/poids:6.8"
    },
    {
      reference: 100920213, id_expediteur: 3, expediteur: 'Lithium', adresse_expediteur: "Sfax", contact_expediteur: 'Med', telephone_expediteur: 22222222,
      id_destinataire: 3, destinataire: "Foulen3", adresse_destinataire: "Sousse", contact_destinataire: "Foulen3", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:6x9x10/poids:5.8,10xarticle2/dimensions:9x6x10/poids:6.8"
    },
  ];
  surfaceCommande: any;
  poidsCommande: any;

  toppings = new FormControl();
  commandeSelectionne: any;

  commandesFiltrees: any;
  minDate = new Date();
  today = new Date();
  date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0);
  form = new FormGroup({ dateLivraison: new FormControl(this.date), commande: new FormControl(""), mission: new FormControl("") });


  constructor(public fb: FormBuilder, public datepipe: DatePipe, public dialogRef: MatDialogRef<MissionsComponent>, private dialog: MatDialog) {
    this.assignCopy();//when you fetch collection from server.

  }


  // ouvrirAjouterMission() { // ouvrir la boite de dialogue d'ajouter mission
  //   localStorage.setItem('date', this.form.get('dateLivraison').value);
  //   const dialogRef = this.dialog.open(AjouterMissionComponent, {
  //     width: '450px',
  //     panelClass: "custom-dialog",
  //     autoFocus: false,
  //   });
  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

  assignCopy() {
    this.commandesFiltrees = Object.assign([], this.commandes);
  }
  filtrerCommandes(value: any) {
    if (!value) {
      this.assignCopy();
    } // when nothing has typed
    this.commandesFiltrees = Object.assign([], this.commandes).filter(
      item => item.reference.toString().toLowerCase().indexOf(value.toLowerCase()) > -1
    )
  }
}

//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------QR CODE-----------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'app-qrCode',
  templateUrl: './qrCode.html'
})
export class QrCodeComponent {
  valeurQr: any;
  constructor() {
    this.valeurQr = localStorage.getItem("idMission") + "/" + localStorage.getItem("etatMission");
  }
}

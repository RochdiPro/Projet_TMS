import { AfterViewInit, Component, ViewChild, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ParcTransportService } from 'src/app/parc-transport.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ILatLng } from 'src/app/directions-map.directive';
import { SelectAutocompleteComponent } from 'mat-select-autocomplete';




@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})
//--------------------------------------------------------------------------------------------------------------
//----------------------------------------------- TAB MISSIONS -------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
export class MissionsComponent implements OnInit, AfterViewInit {
  today = new Date();
  date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0);
  form = new FormGroup({ dateL: new FormControl(this.date), nom: new FormControl(""), matricule: new FormControl("") });
  filtreEtatMission = "";  //utilisée dans le filtrage par etat mission
  nomFiltre = false;   //utilisée pour l'activation ou désactivation du filtrage par nom
  matriculeFiltre = false;  //utilisée pour l'activation ou désactivation du filtrage par matricule
  dateFiltre = false;   //utilisée pour l'activation ou désactivation du filtrage par date
  etatMissionFiltre = false;  //utilisée pour l'activation ou désactivation du filtrage par etatMission
  displayedColumns: string[] = ['id', 'nom', 'matricule', 'dateLivraison', 'trajet', 'etatMission', 'actions', 'Detail']; //les colonne du tableau mission
  dataSource = new MatTableDataSource<tableMissions>();
  dateRecherche: any;
  check = true;
  mission: any;
  trajet: any;
  destinations: any = [];
  destinationsOptimise: any = [];
  commande: any;



  constructor(public service: ParcTransportService, public datepipe: DatePipe, private router: Router, private dialog: MatDialog) {
    this.refresh();
  }
  refresh() { // rafraichir la liste des missions
    this.service.missions().subscribe(res => {
      this.dataSource.data = res as tableMissions[];
      this.filtrerMission();

    });
  }
  viderNom() { //pour vider le champs de filtrage par chauffeur
    this.nomFiltre = false;
    this.form.controls['nom'].setValue('');
    this.filtrerMission();
  }
  viderMatricule() { //pour vider le champs de filtrage par matricule
    this.matriculeFiltre = false;
    this.form.controls['matricule'].setValue('');
    this.filtrerMission();
  }
  filtrerMission() { //pour faire le filtrage des missions
    if (this.filtreEtatMission === undefined) this.filtreEtatMission = "";
    this.date = new Date(this.form.get('dateL').value);
    this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
    this.service.filtrerMissions("date_creation", this.dateRecherche, "nom_chauffeur", this.form.get('nom').value, "matricule", this.form.get('matricule').value, "etat_mission", this.filtreEtatMission).subscribe(res => {
      this.dataSource.data = res as tableMissions[];
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }
  disableEnableDate() { //pour activer et desactiver le filtrage par date
    if (this.check) {
      this.form.controls['dateL'].enable();
    } else {
      this.form.controls['dateL'].disable();
    }
  }
  changerEtatMission(id: any) { //pour changer l'état du mission
    this.service.filtrerCommande("id_mission", id).subscribe(res => {
      this.commande = res;
      var formData: any = new FormData();
      var termine = true;
      this.commande.forEach((element: any) => {
        if (element.etat === "En Cours") {
          termine = false;
        }
      });
      if (termine) { //si la mission est terminée on change l'etat du véhicule vers disponible est on réinitialise la surface et le poids restants du véhicule

        formData.append("id", id);
        formData.append("valeur", "Terminée"); //mise a jour etat mission vers terminée
        this.service.mission(id).subscribe((affectation: any) => {
          this.service.vehicules().subscribe((vehicule: any) => {
            let v = vehicule.filter((x: any) => x.matricule == affectation.matricule);


            let formData = new FormData();
            formData.append("id", v[0].id);
            formData.append("etatVehicule", "Disponible"); //changer etat vehicule vers disponible
            this.service.majEtatVehicule(formData);
            let formData2: any = new FormData();
            formData2.append("id", v[0].id);
            formData2.append("charge_restante", v[0].charge_utile);
            formData2.append("surface_restante", v[0].longueur * v[0].largeur * v[0].hauteur); //reinitialise le poids et la surface
            this.service.majChargeEtSurface(formData2);
          });
        });
      } else {
        formData.append("id", id);
        formData.append("valeur", "En Cours"); //mise a jour etat mission vers en cours
        this.service.mission(id).subscribe((affectation: any) => {
          this.service.vehicules().subscribe((vehicule: any) => {
            let v = vehicule.filter((x: any) => x.matricule == affectation.matricule);


            let formData3 = new FormData();
            formData3.append("id", v[0].id);
            formData3.append("etatVehicule", "En Mission"); //changer etat vehicule vers en mission
            this.service.majEtatVehicule(formData3);
          });
        });
      }

      this.service.majEtatMission(formData);
      setTimeout(() => { this.refresh() }, 100);

    });
  }
  supprimmerMission(id: any) {

  }
  // ouvrirQR(id: any) {
  //   localStorage.setItem("idMission", id);
  //   this.service.affectation(id).subscribe((aff: any) => {
  //     localStorage.setItem("etatMission", aff.etatMission);
  //     const dialogRef = this.dialog.open(QrCodeComponent, {
  //       width: '200px',
  //       height: '200px',
  //       panelClass: 'qr-code',
  //       autoFocus: false,
  //     });
  //   });

  // }


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
  }


  ouvrirAffecterCommande() { // ouvrir la boite de dialogue d'affectation des commandes
    localStorage.setItem('date', this.form.get('dateL').value);
    const dialogRef = this.dialog.open(AffecterCommande, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.filtrerMission();


    });
  }



  detailDialog(id: any, idM: any): void { // ouvrir la boite de dialogue de détail d'une mission
    localStorage.setItem('idC', id);
    localStorage.setItem('idM', idM);
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '70vw',
      panelClass: "custom-dialog-detail",
      autoFocus: false,
    });

  }
  ouvrirMap(id: any, type: any) { // ouvrir google map avec le trajet
    this.service.mission(id).subscribe(res => {
      this.mission = res;
      this.trajet = this.mission.trajet.split("/"); //recuperation du trajet
      var origine = this.trajet[0].split(":");
      origine = origine[1]; //definitionde l'origine
      var finChemin = this.trajet[this.trajet.length - 1].split(":");
      finChemin = finChemin[1]; //definition du fin de chemin
      var pointStop = '';
      for (let i = 1; i < this.trajet.length - 1; i++) {
        var x = this.trajet[i].split(":");
        pointStop += x[1] + '%7C';
      }
      pointStop = pointStop.slice(0, -3); //definition des points de stop
      window.open("https://www.google.com/maps/dir/?api=1&origin=" + origine + "&destination=" + finChemin + "&travelmode=driving&waypoints=" + pointStop); //affichage du map avec le trajet

    });

  }

}

export interface tableMissions {
  id: number;
  nom: string;
  matricule: String;
  dateLivraison: String;
  etatMission: String;
  idE: number;
}

export interface Commandes {
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


//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------Ajouter Mission Component---------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'app-ajouterMission',
  templateUrl: './ajouterMission.html',
  styleUrls: ['./ajouterMission.scss'],
})
export class AjouterMissionComponent implements OnInit {
  chauffeurSelectionne: any;
  vehiculeSelectionnee: any;
  commandeSelectionne: any;
  employes: any;
  employe: any;
  chauffeurs: any;
  vehicules: any;
  vehicule: any;
  chauffeurSelect = true;
  vehiculeSelectionne = true;
  bonSelect = false;
  currentLat: any;
  currentLong: any;
  date: Date;
  dateRecherche: any;
  mission: any;
  nvmission: any;
  latMap: any = 34.74056;
  lngMap: any = 10.76028;
  lat: any = 0;
  lng: any = 0;
  zoom: number = 5;
  affectations: any;
  chauffeurDispo: any[];
  positionExiste = false;
  destinations: any = [];
  destinationsOptimise: any = [];
  trajet: any;
  adresse_destinataire = "";
  form: FormGroup;
  positionClient: any = {
    latitude: 34.74056, longitude: 10.76028
  };

  commandes: Commandes[] = [
    {
      reference: 1, id_expediteur: 1, expediteur: 'Hydrogen', adresse_expediteur: "Sfax", contact_expediteur: 'Salah', telephone_expediteur: 22222222,
      id_destinataire: 1, destinataire: "Foulen1", adresse_destinataire: "Tunis", contact_destinataire: "Foulen1", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:8x9x10/poids:6.8,10xarticle2/dimensions:7x8x10/poids:6.8"
    },
    {
      reference: 2, id_expediteur: 2, expediteur: 'Helium', adresse_expediteur: "Sfax", contact_expediteur: 'Ali', telephone_expediteur: 22222222,
      id_destinataire: 2, destinataire: "Foulen2", adresse_destinataire: "Sfax", contact_destinataire: "Foulen2", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:12x7x10/poids:8.8,10xarticle2/dimensions:8x7x10/poids:6.8"
    },
    {
      reference: 3, id_expediteur: 3, expediteur: 'Lithium', adresse_expediteur: "Sfax", contact_expediteur: 'Med', telephone_expediteur: 22222222,
      id_destinataire: 3, destinataire: "Foulen3", adresse_destinataire: "Sousse", contact_destinataire: "Foulen3", telephone_destinataire: 44444444,
      date_commande: "12/03/2021", type: "Box", nbr_obj: 1, description: "", articles: "10xarticle1/dimensions:6x9x10/poids:5.8,10xarticle2/dimensions:9x6x10/poids:6.8"
    },
  ];
  surfaceCommande: any;
  poidsCommande: any;

  constructor(public fb: FormBuilder, public service: ParcTransportService, public datepipe: DatePipe, public dialogRef: MatDialogRef<MissionsComponent>) {
    this.service.employes().subscribe((data) => {
      this.employes = data;
      this.chauffeurs = this.employes.filter((x: any) => x.role == "chauffeur");
    });
    this.service.vehicules().subscribe((data) => {
      this.vehicules = data;
    });
    this.service.missions().subscribe((data) => {
      this.affectations = data;
    });
    this.form = this.fb.group({
      refCommande: ['', [Validators.required]],
      vehicule: ['', [Validators.required]],
      chauffeur: ['', [Validators.required]],
      adresse: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
  }
  compatibiliteVehicule() { //verifier la compatibilité du vehicule avec la commande et sa disponibilité
    let articlesCommande = this.commandeSelectionne.articles.split(","); //recuperer liste des articles par commande
    this.surfaceCommande = 0;
    this.poidsCommande = 0;
    articlesCommande.forEach((element: any) => {
      let article = element.split("/");
      let poidsArticle = article[2].split(":")[1]; //recuperer le poids d'un seul article et le nombre d'articles
      let dimensionsArticle = article[1].split(":")[1].split("x"); //recupérer dimensions d'articles
      let surfaceArticle = 1;
      dimensionsArticle.forEach((d: any) => {
        surfaceArticle *= Number(d); //calcul du surface pris par les articles
      });
      poidsArticle *= article[0].split("x")[0]; //calcul du poids total d'un article
      this.poidsCommande += poidsArticle; //calcul poids total d'une commande
      surfaceArticle *= article[0].split("x")[0];  //calcul du surface total d'un article
      this.surfaceCommande += surfaceArticle; //calcul du surface d'une commande
    });

    this.vehicule = [];
    for (let i = 0; i < this.vehicules.length; i++) {
      if ((this.vehicules[i].etatVehicule === "Disponible" || this.vehicules[i].etatVehicule === "Reservée") && this.vehicules[i].charge_restante > this.poidsCommande && this.vehicules[i].surface_restante > this.surfaceCommande) {
        this.vehicule.push(this.vehicules[i]);
      }
    }
  }
  compatibiliteChauffeur() { // verifie la compatibilite du chauffeur avec le vehicule
    this.chauffeurSelect = false;
    this.chauffeurDispo = [];
    var x = this.vehiculeSelectionnee.categories.split("/");

    x.forEach((value: any) => {
      this.chauffeurs.forEach((chauffeur: any) => {
        if (value == chauffeur.categorie_Permis) {
          this.chauffeurDispo.push(chauffeur);
        }
      });
    });
  }

  selectionnerChauffeur() { // impoter les données du chauffeur selectinnée
    this.service.employe(this.chauffeurSelectionne).subscribe((data) => {
      this.employe = data;
    });
  }
  selectionnerCommande() { // importer les données de la commande sélectionnée et tracer la position du client sur la map si il existe
    this.bonSelect = false;
    this.adresse_destinataire = this.commandeSelectionne.adresse_destinataire;
    this.form.get("adresse").setValue(this.adresse_destinataire);
    this.service.positionClient(this.commandeSelectionne.id_destinataire).subscribe((data: any) => {
      this.positionClient = data;
      if (this.positionClient === null) {
        this.latMap = 34.74056;
        this.lngMap = 10.76028;
        this.zoom = 5;
        this.positionExiste = false;
      } else {
        this.lat = this.positionClient.latitude;
        this.lng = this.positionClient.longitude;
        this.latMap = Number(data.latitude);
        this.lngMap = Number(data.longitude);
        this.zoom = 15;
        this.positionExiste = true;


      }
    });

  }
  ajouterMission() { //  enregistrer mission
    this.chercherMoi();
    this.date = new Date(localStorage.getItem('date'));
    this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
    this.service.filtrerMissions("date_creation", this.dateRecherche, "nom_chauffeur", this.form.get('chauffeur').value, "matricule", this.form.get('vehicule').value, "etat_mission", "").subscribe(res => {
      this.mission = res;

      if (this.mission[0] === undefined) { // tester si c'est une nouvelle mission 
        var formData: any = new FormData();
        formData.append("nom", this.employe.nom);
        formData.append("idE", this.employe.id_Employe);
        formData.append("matricule", this.vehiculeSelectionnee.matricule);
        formData.append("dateLivraison", this.date);
        formData.append("trajet", this.commandeSelectionne.expediteur + ":" + this.currentLat + "," + this.currentLong + "/" + this.commandeSelectionne.destinataire + ":" + this.lat + "," + this.lng)
        formData.append("etatMission", "Accordée");
        this.service.creerMission(formData);

        setTimeout(() => {

          this.service.missions().subscribe(res => {
            this.nvmission = res;
            var formData2: any = new FormData();
            if (this.nvmission[this.nvmission.length - 1] === undefined) {
              formData2.append("id_mission", 1);
            }
            else {
              formData2.append("id_mission", this.nvmission[this.nvmission.length - 1].id);
            }
            formData2.append("reference_commande", this.commandeSelectionne.reference);
            formData2.append("expediteur", this.commandeSelectionne.expediteur);
            formData2.append("adresse_expediteur", this.commandeSelectionne.adresse_expediteur);
            formData2.append("contact_expediteur", this.commandeSelectionne.contact_expediteur);
            formData2.append("tel_expediteur", this.commandeSelectionne.telephone_expediteur);
            formData2.append("destinataire", this.commandeSelectionne.destinataire);
            formData2.append("adresse_destinataire", this.commandeSelectionne.adresse_destinataire);
            formData2.append("contact_destinataire", this.commandeSelectionne.contact_destinataire);
            formData2.append("tel_destinataire", this.commandeSelectionne.telephone_destinataire);
            formData2.append("date_commande", this.commandeSelectionne.date_commande);
            formData2.append("type", this.commandeSelectionne.type);
            formData2.append("nbr_obj", this.commandeSelectionne.nbr_obj);
            formData2.append("description", this.commandeSelectionne.description);
            formData2.append("articles", this.commandeSelectionne.articles);
            formData2.append("etat", "En Cours");
            formData2.append("positionExp", this.currentLat + "," + this.currentLong);
            formData2.append("positionDest", this.lat + "," + this.lng);
            this.service.creerCommande(formData2);
            var formData3: any = new FormData();
            formData3.append("id", this.commandeSelectionne.id_destinataire)
            formData3.append("Lat", this.lat);
            formData3.append("Long", this.lng);
            this.service.creerPosClient(formData3);
            let formData4: any = new FormData();
            formData4.append("id", this.vehiculeSelectionnee.id);
            formData4.append("charge_restante", this.vehiculeSelectionnee.charge_restante - this.poidsCommande);
            formData4.append("surface_restante", this.vehiculeSelectionnee.surface_restante - this.surfaceCommande);
            this.service.majChargeEtSurface(formData4);
          });
        }, 1000)




      } else { //si c'est une mission deja existante
        var formData: any = new FormData();
        formData.append("id_mission", Number(this.mission[0].id));
        formData.append("reference_commande", this.commandeSelectionne.reference);
        formData.append("expediteur", this.commandeSelectionne.expediteur);
        formData.append("adresse_expediteur", this.commandeSelectionne.adresse_expediteur);
        formData.append("contact_expediteur", this.commandeSelectionne.contact_expediteur);
        formData.append("tel_expediteur", this.commandeSelectionne.telephone_expediteur);
        formData.append("destinataire", this.commandeSelectionne.destinataire);
        formData.append("adresse_destinataire", this.commandeSelectionne.adresse_destinataire);
        formData.append("contact_destinataire", this.commandeSelectionne.contact_destinataire);
        formData.append("tel_destinataire", this.commandeSelectionne.telephone_destinataire);
        formData.append("date_commande", this.commandeSelectionne.date_commande);
        formData.append("type", this.commandeSelectionne.type);
        formData.append("nbr_obj", this.commandeSelectionne.nbr_obj);
        formData.append("description", this.commandeSelectionne.description);
        formData.append("articles", this.commandeSelectionne.articles);
        formData.append("etat", "En Cours");
        formData.append("positionExp", this.currentLat + "," + this.currentLong);
        formData.append("positionDest", this.lat + "," + this.lng);
        this.service.creerCommande(formData);
        var formData3: any = new FormData();
        formData3.append("id", this.commandeSelectionne.id_destinataire)
        formData3.append("Lat", this.lat);
        formData3.append("Long", this.lng);
        this.service.creerPosClient(formData3);
        let formData4: any = new FormData();
        formData4.append("id", this.vehiculeSelectionnee.id);
        formData4.append("charge_restante", this.vehiculeSelectionnee.charge_restante - this.poidsCommande);
        formData4.append("surface_restante", this.vehiculeSelectionnee.surface_restante - this.surfaceCommande);
        this.service.majChargeEtSurface(formData4);

        var origine = '';
        var origine1 = '';
        this.trajet = this.mission[0].trajet.split("/");
        this.trajet.push(this.commandeSelectionne.destinataire + ":" + this.lat + "," + this.lng);
        origine = this.trajet[0].split(":");
        origine = origine[1];
        origine1 = origine;

        for (let i = 1; i < this.trajet.length; i++) {
          this.destinations.push(this.trajet[i]);

        }
        while (this.destinations.length > 0) {
          var des = '';
          var distance = 6371;
          var indice = 0;
          for (let i = 0; i < this.destinations.length; i++) {
            var x = origine1.split(",");
            var lat1 = Number(x[0]);
            var long1 = Number(x[1]);
            var y = this.destinations[i].split(":");
            var y = y[1].split(",");
            var lat2 = Number(y[0]);
            var long2 = Number(y[1]);
            if (this.getDistanceFromLatLonInKm(lat1, long1, lat2, long2) < distance) {
              distance = this.getDistanceFromLatLonInKm(lat1, long1, lat2, long2);
              des = this.destinations[i];
              indice = i;
            }
          }
          this.destinationsOptimise.push(des);
          var z = des.split(":");
          origine1 = z[1];
          this.destinations.splice(indice, 1);

        }
        var debutChemin = this.trajet[0];
        var finChemin = this.destinationsOptimise[this.destinationsOptimise.length - 1];
        var pointStop = '';
        for (let i = 0; i < this.destinationsOptimise.length - 1; i++) {
          pointStop += this.destinationsOptimise[i] + "/";
        }
        pointStop = pointStop.slice(0, -1);
        this.trajet = debutChemin + "/" + pointStop + "/" + finChemin;
        this.destinationsOptimise = [];

        var formData2: any = new FormData();
        formData2.append("id", this.mission[0].id);
        formData2.append("trajet", this.trajet);
        this.service.majTrajet(formData2);

      }
    });
    let formData = new FormData();
    formData.append("id", this.vehiculeSelectionnee.id);
    formData.append("etatVehicule", "Reservée");
    this.service.majEtatVehicule(formData);
    setTimeout(() => { this.dialogRef.close(); }, 800)

    // location.reload();
  }
  chercherMoi() { // avoir la position de début depuis le navigateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentLat = position.coords.latitude;
        this.currentLong = position.coords.longitude;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  positionerMarquer(event: any) { //pour positionner un marqueur sur le map
    if (!this.positionExiste) {
      console.log(event)
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }

  }
  modifierPositionMarquer(event: any) { //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

  }
  getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) { // calculer la distance entre deux points
    var R = 6371; // Rayon de la terre en km
    var dLat = this.deg2rad(lat2 - lat1);
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance en km
    return d;
  }

  deg2rad(deg: any) { //changement du deg vers rad
    return deg * (Math.PI / 180)
  }

}

//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------Detail Component---------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-detail',
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DetailComponent implements OnInit {
  employe: any;
  id: any;
  idMission: any;
  mission: any;
  mis: any;
  nbr_commandes: any;
  poids_global = 0;
  surface_globale = 0;
  displayedColumns: string[] = ['referenceCommande', 'expediteur', 'mapExp', 'destinataire', 'mapDest', 'dateLivraison', 'etat', 'action'];
  dataSource = new MatTableDataSource<tableCommandes>();
  expandedElement: tableCommandes | null;
  date_creation: any;
  constructor(public service: ParcTransportService, public _DomSanitizationService: DomSanitizer, private dialog: MatDialog, private router: Router) {
    this.refresh();
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngOnInit(): void {
  }
  refresh() { // rafraichier la liste des commandes et calcule du poids et surface global
    this.id = localStorage.getItem('idC');
    this.idMission = localStorage.getItem('idM');
    this.service.employe(this.id).subscribe((data) => {
      this.employe = data;
    });
    this.service.mission(this.idMission).subscribe(res => {
      this.mission = res;
      this.date_creation = this.mission.date_creation;

    });
    this.service.filtrerCommande("id_mission", this.idMission).subscribe(res => { //recuperer la commande par l'id du mission
      this.dataSource.data = res as tableCommandes[];
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.mis = res;
      this.nbr_commandes = this.mis.length;
      this.mis.forEach((x: any) => {
      });
      this.mis.forEach((x: any) => {
        let articlesCommande = x.articles.split(",");
        let surfaceCommande = 0;
        let poidsCommande = 0;
        articlesCommande.forEach((element: any) => {
          let article = element.split("/");
          let poidsArticle = article[2].split(":")[1];
          let dimensionsArticle = article[1].split(":")[1].split("x");
          let surfaceArticle = 1;
          dimensionsArticle.forEach((d: any) => {
            surfaceArticle *= Number(d);
          });
          poidsArticle *= article[0].split("x")[0];
          poidsCommande += poidsArticle;
          surfaceArticle *= article[0].split("x")[0];
          surfaceCommande += surfaceArticle;
        });
        this.surface_globale += surfaceCommande;
        this.poids_global += poidsCommande;
      });
    });
  }

  supprimerCommande(id: any) { // supprimer une commande
    this.service.supprimerCommande(id);
    window.setTimeout(() => {
      this.refresh();
    }, 100);

  }
  terminerCommande(id: any) { //marquer une commande comme livrée
    var formData: any = new FormData();
    formData.append("etat", "Done");
    this.service.majEtat(id, formData);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }
  ouvrirMap(id: any, type: any) { // ouvrir le map avec la position du client ou de l'expediteur

    localStorage.setItem('idCom', id);
    localStorage.setItem('type', type)
    const dialogRef = this.dialog.open(MapsComponent, {
      width: '70vw',
      autoFocus: false,
    });
  }

}
export interface tableCommandes {
  id: number;
  idMission: number;
  referenceCommande: number;
  destinataire: string;
  destination: String;
  etat: String;
}

//------------------------------boite dialogue MAPS-------------------------------

@Component({
  selector: 'app-maps',
  templateUrl: './maps.html',
  styleUrls: ['./maps.scss'],
})
export class MapsComponent {
  lat: any;
  long: any
  id: any;
  commande: any;
  type: any;
  expediteur = false;
  destinataire = false;
  trajet = false;

  origin: ILatLng = {
    latitude: 34.74056,
    longitude: 10.76028
  };
  destination: ILatLng = {
    latitude: 34.74056,
    longitude: 10.76028
  };
  displayDirections = false;
  zoom = 15;


  constructor(public service: ParcTransportService) {
    this.id = localStorage.getItem("idCom");
    this.type = localStorage.getItem("type");
    this.service.commande(this.id).subscribe((data) => {
      this.commande = data;
      if (this.type === "expediteur") { //afficher la position de l'expediteur
        var x = this.commande.positionExp.split(",");
        this.lat = Number(x[0]);
        this.long = Number(x[1]);
        this.origin.latitude = Number(x[0]);
        this.origin.longitude = Number(x[1]);
        this.displayDirections = false;
        this.expediteur = true;
      } else if (this.type === "destinataire") { //afficher la position de l'expediteur
        var x = this.commande.positionDest.split(",");
        this.lat = Number(x[0]);
        this.long = Number(x[1]);
        this.destination.latitude = Number(x[0]);
        this.destination.longitude = Number(x[1]);
        this.displayDirections = false;
        this.destinataire = true;

      }
    });
  }


}

//--------------------------------------------------------------------------------------------------------------------
//------------------------------------Boite de dialogue affecter commandes--------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
@Component({
  selector: 'app-affecterCommande',
  templateUrl: './affecterCommande.html',
  styleUrls: ['./affecterCommande.scss'],
})
export class AffecterCommande {
  chauffeurSelectionne: any;
  vehiculeSelectionnee: any;
  commandeSelectionne: any;
  employes: any;
  employe: any;
  chauffeurs: any;
  vehicules: any;
  vehicule: any;
  chauffeurSelect = true;
  vehiculeSelectionne = true;
  bonSelect = true;
  currentLat: any;
  currentLong: any;
  date: Date;
  dateRecherche: any;
  mission: any;
  nvmission: any;
  latMap: any = 34.74056;
  lngMap: any = 10.76028;
  lat: any = 0;
  lng: any = 0;
  zoom: number = 5;
  affectations: any;
  chauffeurDispo: any[];
  positionExiste = false;
  destinations: any = [];
  destinationsOptimise: any = [];
  trajet: any;
  adresse_destinataire = "";
  form: FormGroup;
  positionClient: any = {
    latitude: 34.74056, longitude: 10.76028
  };

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
  commandesSelectionnes: any;

  commandesFiltrees : any;

  constructor(public fb: FormBuilder, public service: ParcTransportService, public datepipe: DatePipe, public dialogRef: MatDialogRef<MissionsComponent>, private dialog: MatDialog) {
    this.service.employes().subscribe((data) => {
      this.employes = data;
      this.chauffeurs = this.employes.filter((x: any) => x.role == "chauffeur");
    });
    this.service.vehicules().subscribe((data) => {
      this.vehicules = data;
    });
    this.service.missions().subscribe((data) => {
      this.affectations = data;
    });
    this.form = this.fb.group({
      refCommande: ['', [Validators.required]],
      vehicule: ['', [Validators.required]],
      chauffeur: ['', [Validators.required]],
      adresse: ['', [Validators.required]]
    });
    this.assignCopy();//when you fetch collection from server.

  }

  ngOnInit(): void {
  }
  compatibiliteVehicule() { //verifier la compatibilité du vehicule avec la commande et sa disponibilité
    let articlesCommande = this.commandeSelectionne.articles.split(","); //recuperer liste des articles par commande
    this.surfaceCommande = 0;
    this.poidsCommande = 0;
    articlesCommande.forEach((element: any) => {
      let article = element.split("/");
      let poidsArticle = article[2].split(":")[1]; //recuperer le poids d'un seul article et le nombre d'articles
      let dimensionsArticle = article[1].split(":")[1].split("x"); //recupérer dimensions d'articles
      let surfaceArticle = 1;
      dimensionsArticle.forEach((d: any) => {
        surfaceArticle *= Number(d); //calcul du surface pris par les articles
      });
      poidsArticle *= article[0].split("x")[0]; //calcul du poids total d'un article
      this.poidsCommande += poidsArticle; //calcul poids total d'une commande
      surfaceArticle *= article[0].split("x")[0];  //calcul du surface total d'un article
      this.surfaceCommande += surfaceArticle; //calcul du surface d'une commande
    });

    this.vehicule = [];
    for (let i = 0; i < this.vehicules.length; i++) {
      if ((this.vehicules[i].etatVehicule === "Disponible" || this.vehicules[i].etatVehicule === "Reservée") && this.vehicules[i].charge_restante > this.poidsCommande && this.vehicules[i].surface_restante > this.surfaceCommande) {
        this.vehicule.push(this.vehicules[i]);
      }
    }
  }
  compatibiliteChauffeur() { // verifie la compatibilite du chauffeur avec le vehicule
    this.chauffeurSelect = false;
    this.chauffeurDispo = [];
    var x = this.vehiculeSelectionnee.categories.split("/");

    x.forEach((value: any) => {
      this.chauffeurs.forEach((chauffeur: any) => {
        if (value == chauffeur.categorie_Permis) {
          this.chauffeurDispo.push(chauffeur);
        }
      });
    });
  }

  selectionnerChauffeur() { // impoter les données du chauffeur selectinnée
    this.service.employe(this.chauffeurSelectionne).subscribe((data) => {
      this.employe = data;
    });
  }
  selectionnerCommande() { // importer les données de la commande sélectionnée et tracer la position du client sur la map si il existe
    this.bonSelect = false;
    this.adresse_destinataire = this.commandeSelectionne.adresse_destinataire;
    this.form.get("adresse").setValue(this.adresse_destinataire);
    this.service.positionClient(this.commandeSelectionne.id_destinataire).subscribe((data: any) => {
      this.positionClient = data;
      if (this.positionClient === null) {
        this.latMap = 34.74056;
        this.lngMap = 10.76028;
        this.zoom = 5;
        this.positionExiste = false;
      } else {
        this.lat = this.positionClient.latitude;
        this.lng = this.positionClient.longitude;
        this.latMap = Number(data.latitude);
        this.lngMap = Number(data.longitude);
        this.zoom = 15;
        this.positionExiste = true;


      }
    });

  }
  ajouterMission() { //  enregistrer mission
    this.chercherMoi();
    this.date = new Date(localStorage.getItem('date'));
    this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
    this.service.filtrerMissions("date_creation", this.dateRecherche, "nom_chauffeur", this.form.get('chauffeur').value, "matricule", this.form.get('vehicule').value, "etat_mission", "").subscribe(res => {
      this.mission = res;

      if (this.mission[0] === undefined) { // tester si c'est une nouvelle mission 
        var formData: any = new FormData();
        formData.append("nom", this.employe.nom);
        formData.append("idE", this.employe.id_Employe);
        formData.append("matricule", this.vehiculeSelectionnee.matricule);
        formData.append("dateLivraison", this.date);
        formData.append("trajet", this.commandeSelectionne.expediteur + ":" + this.currentLat + "," + this.currentLong + "/" + this.commandeSelectionne.destinataire + ":" + this.lat + "," + this.lng)
        formData.append("etatMission", "Accordée");
        this.service.creerMission(formData);

        setTimeout(() => {

          this.service.missions().subscribe(res => {
            this.nvmission = res;
            var formData2: any = new FormData();
            if (this.nvmission[this.nvmission.length - 1] === undefined) {
              formData2.append("id_mission", 1);
            }
            else {
              formData2.append("id_mission", this.nvmission[this.nvmission.length - 1].id);
            }
            formData2.append("reference_commande", this.commandeSelectionne.reference);
            formData2.append("expediteur", this.commandeSelectionne.expediteur);
            formData2.append("adresse_expediteur", this.commandeSelectionne.adresse_expediteur);
            formData2.append("contact_expediteur", this.commandeSelectionne.contact_expediteur);
            formData2.append("tel_expediteur", this.commandeSelectionne.telephone_expediteur);
            formData2.append("destinataire", this.commandeSelectionne.destinataire);
            formData2.append("adresse_destinataire", this.commandeSelectionne.adresse_destinataire);
            formData2.append("contact_destinataire", this.commandeSelectionne.contact_destinataire);
            formData2.append("tel_destinataire", this.commandeSelectionne.telephone_destinataire);
            formData2.append("date_commande", this.commandeSelectionne.date_commande);
            formData2.append("type", this.commandeSelectionne.type);
            formData2.append("nbr_obj", this.commandeSelectionne.nbr_obj);
            formData2.append("description", this.commandeSelectionne.description);
            formData2.append("articles", this.commandeSelectionne.articles);
            formData2.append("etat", "En Cours");
            formData2.append("positionExp", this.currentLat + "," + this.currentLong);
            formData2.append("positionDest", this.lat + "," + this.lng);
            this.service.creerCommande(formData2);
            var formData3: any = new FormData();
            formData3.append("id", this.commandeSelectionne.id_destinataire)
            formData3.append("Lat", this.lat);
            formData3.append("Long", this.lng);
            this.service.creerPosClient(formData3);
            let formData4: any = new FormData();
            formData4.append("id", this.vehiculeSelectionnee.id);
            formData4.append("charge_restante", this.vehiculeSelectionnee.charge_restante - this.poidsCommande);
            formData4.append("surface_restante", this.vehiculeSelectionnee.surface_restante - this.surfaceCommande);
            this.service.majChargeEtSurface(formData4);
          });
        }, 1000)




      } else { //si c'est une mission deja existante
        var formData: any = new FormData();
        formData.append("id_mission", Number(this.mission[0].id));
        formData.append("reference_commande", this.commandeSelectionne.reference);
        formData.append("expediteur", this.commandeSelectionne.expediteur);
        formData.append("adresse_expediteur", this.commandeSelectionne.adresse_expediteur);
        formData.append("contact_expediteur", this.commandeSelectionne.contact_expediteur);
        formData.append("tel_expediteur", this.commandeSelectionne.telephone_expediteur);
        formData.append("destinataire", this.commandeSelectionne.destinataire);
        formData.append("adresse_destinataire", this.commandeSelectionne.adresse_destinataire);
        formData.append("contact_destinataire", this.commandeSelectionne.contact_destinataire);
        formData.append("tel_destinataire", this.commandeSelectionne.telephone_destinataire);
        formData.append("date_commande", this.commandeSelectionne.date_commande);
        formData.append("type", this.commandeSelectionne.type);
        formData.append("nbr_obj", this.commandeSelectionne.nbr_obj);
        formData.append("description", this.commandeSelectionne.description);
        formData.append("articles", this.commandeSelectionne.articles);
        formData.append("etat", "En Cours");
        formData.append("positionExp", this.currentLat + "," + this.currentLong);
        formData.append("positionDest", this.lat + "," + this.lng);
        this.service.creerCommande(formData);
        var formData3: any = new FormData();
        formData3.append("id", this.commandeSelectionne.id_destinataire)
        formData3.append("Lat", this.lat);
        formData3.append("Long", this.lng);
        this.service.creerPosClient(formData3);
        let formData4: any = new FormData();
        formData4.append("id", this.vehiculeSelectionnee.id);
        formData4.append("charge_restante", this.vehiculeSelectionnee.charge_restante - this.poidsCommande);
        formData4.append("surface_restante", this.vehiculeSelectionnee.surface_restante - this.surfaceCommande);
        this.service.majChargeEtSurface(formData4);

        var origine = '';
        var origine1 = '';
        this.trajet = this.mission[0].trajet.split("/");
        this.trajet.push(this.commandeSelectionne.destinataire + ":" + this.lat + "," + this.lng);
        origine = this.trajet[0].split(":");
        origine = origine[1];
        origine1 = origine;

        for (let i = 1; i < this.trajet.length; i++) {
          this.destinations.push(this.trajet[i]);

        }
        while (this.destinations.length > 0) {
          var des = '';
          var distance = 6371;
          var indice = 0;
          for (let i = 0; i < this.destinations.length; i++) {
            var x = origine1.split(",");
            var lat1 = Number(x[0]);
            var long1 = Number(x[1]);
            var y = this.destinations[i].split(":");
            var y = y[1].split(",");
            var lat2 = Number(y[0]);
            var long2 = Number(y[1]);
            if (this.getDistanceFromLatLonInKm(lat1, long1, lat2, long2) < distance) {
              distance = this.getDistanceFromLatLonInKm(lat1, long1, lat2, long2);
              des = this.destinations[i];
              indice = i;
            }
          }
          this.destinationsOptimise.push(des);
          var z = des.split(":");
          origine1 = z[1];
          this.destinations.splice(indice, 1);

        }
        var debutChemin = this.trajet[0];
        var finChemin = this.destinationsOptimise[this.destinationsOptimise.length - 1];
        var pointStop = '';
        for (let i = 0; i < this.destinationsOptimise.length - 1; i++) {
          pointStop += this.destinationsOptimise[i] + "/";
        }
        pointStop = pointStop.slice(0, -1);
        this.trajet = debutChemin + "/" + pointStop + "/" + finChemin;
        this.destinationsOptimise = [];

        var formData2: any = new FormData();
        formData2.append("id", this.mission[0].id);
        formData2.append("trajet", this.trajet);
        this.service.majTrajet(formData2);

      }
    });
    let formData = new FormData();
    formData.append("id", this.vehiculeSelectionnee.id);
    formData.append("etatVehicule", "Reservée");
    this.service.majEtatVehicule(formData);
    setTimeout(() => { this.dialogRef.close(); }, 800)

    // location.reload();
  }
  chercherMoi() { // avoir la position de début depuis le navigateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentLat = position.coords.latitude;
        this.currentLong = position.coords.longitude;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  positionerMarquer(event: any) { //pour positionner un marqueur sur le map
    if (!this.positionExiste) {
      console.log(event)
      this.lat = event.coords.lat;
      this.lng = event.coords.lng;
      this.positionExiste = true;
    }

  }
  modifierPositionMarquer(event: any) { //pour modifier la position du marqueur existant
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

  }
  getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) { // calculer la distance entre deux points
    var R = 6371; // Rayon de la terre en km
    var dLat = this.deg2rad(lat2 - lat1);
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance en km
    return d;
  }

  deg2rad(deg: any) { //changement du deg vers rad
    return deg * (Math.PI / 180)
  }

  ouvrirAjouterMission() { // ouvrir la boite de dialogue d'ajouter mission
    const dialogRef = this.dialog.open(AjouterMissionComponent, {
      width: '450px',
      panelClass: "custom-dialog",
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  assignCopy(){
    this.commandesFiltrees = Object.assign([], this.commandes);
 }
 filtrerCommandes(value: any){
    if(!value){
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

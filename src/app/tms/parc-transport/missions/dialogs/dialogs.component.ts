import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { CommandeService } from 'src/app/colisage/commande/services/commande.service';
import Swal from 'sweetalert2';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';
import { MissionsService } from '../services/missions.service';

// ************************************ Boite dialogue affecter chauffeur ********************************
@Component({
  selector: 'affecter-chauffeur',
  templateUrl: 'affecter-chauffeur.html',
  styleUrls: ['affecter-chauffeur.scss'],
})
export class AffecterChauffeur implements OnInit {
  chauffeursCompatibles: any;
  selectedValue: any;
  chauffeurs: any;
  couplesVehiculeChauffeursPrives: any = [];
  copieVehiculeChauffeurs: any = [];
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<AffecterChauffeur>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceChauffeur: ChauffeurService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this;
    this.creerForm();
    await this.getListeChauffeurs();
    this.verifierCompatibiliteChauffeur();
  }

  creerForm() {
    this.form = this.fb.group({
      chauffeurs: this.fb.array([]), //chauffeurs privés
      chauffeursLoues: this.fb.array([]), //chauffeurs Loués
    });

    this.vehicules.forEach(() => {
      const chauffeur = this.fb.group({ chauffeur: '' });
      this.chauffeursForms.push(chauffeur);
    });

    this.vehiculesLoues.forEach(() => {
      const chauffeurLoue = this.fb.group({ chauffeurLoue: '' });
      this.chauffeursLouesForms.push(chauffeurLoue);
    });
  }

  get chauffeursForms() {
    return this.form.get('chauffeurs') as FormArray;
  }

  get chauffeursLouesForms() {
    return this.form.get('chauffeursLoues') as FormArray;
  }

  get vehicules() {
    console.log(this.data.vehiculesPrives);
    return this.data.vehiculesPrives;
  }

  get vehiculesLoues() {
    return this.data.vehiculesLoues;
  }

  async getListeChauffeurs() {
    this.chauffeurs = await this.serviceChauffeur.getChauffeurs().toPromise();
  }

  verifierCompatibiliteChauffeur() {
    console.log(this.vehicules);
    this.vehicules.forEach((vehicule: any) => {
      let categorie = vehicule.vehicule.categories.split('/');
      let chauffeurs: any = [];
      categorie.forEach((value: any) => {
        this.chauffeurs.forEach((chauffeur: any) => {
          if (value === chauffeur.categorie_Permis) {
            chauffeurs.push(chauffeur);
          }
        });
      });
      this.couplesVehiculeChauffeursPrives.push({
        vehicule: vehicule.vehicule,
        chauffeurs: chauffeurs,
      });
    });
    for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
      this.copieVehiculeChauffeurs.push({
        vehicule: this.couplesVehiculeChauffeursPrives[i].vehicule,
        chauffeurs: [...this.couplesVehiculeChauffeursPrives[i].chauffeurs],
      });
    }
  }

  // si un chauffeur est disponible pour plusieurs vehicules et on selectionne se chauffeur dans un vehicule on l'enleve pour les autres
  rafraichirListeChauffeur() {
    for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
      this.couplesVehiculeChauffeursPrives[i].chauffeurs = [
        ...this.copieVehiculeChauffeurs[i].chauffeurs,
      ];
    }
    for (let i = 0; i < this.chauffeursForms.controls.length; i++) {
      for (let j = 0; j < this.couplesVehiculeChauffeursPrives.length; j++) {
        this.couplesVehiculeChauffeursPrives[j].chauffeurs.forEach(
          (chauffeurLoop: any) => {
            console.log(
              this.chauffeursForms.controls[i].get('chauffeur').value
            );
            if (
              j !== i &&
              this.chauffeursForms.controls[i].get('chauffeur').value
                .id_Employe === chauffeurLoop.id_Employe
            ) {
              let index = this.couplesVehiculeChauffeursPrives[
                j
              ].chauffeurs.findIndex(
                (chauffeur: any) =>
                  this.chauffeursForms.controls[i].get('chauffeur').value
                    .id_Employe === chauffeur.id_Employe
              );
              this.couplesVehiculeChauffeursPrives[j].chauffeurs.splice(
                index,
                1
              );
              console.log(this.couplesVehiculeChauffeursPrives[j].chauffeurs);
            }
          }
        );
      }
    }
  }

  //   bouton ok
  valider() {
    let couplesVehiculeChauffeurPrive = [];
    let couplesVehiculeChauffeurLoue = [];
    for (let i = 0; i < this.couplesVehiculeChauffeursPrives.length; i++) {
      console.log(this.chauffeursForms.controls[i].get('chauffeur').value);
      couplesVehiculeChauffeurPrive.push({
        vehicule: this.couplesVehiculeChauffeursPrives[i].vehicule,
        chauffeur: this.chauffeursForms.controls[i].get('chauffeur').value,
      });
    }
    for (let j = 0; j < this.vehiculesLoues.length; j++) {
      couplesVehiculeChauffeurLoue.push({
        vehicule: this.vehiculesLoues[j],
        chauffeur:
          this.chauffeursLouesForms.controls[j].get('chauffeurLoue').value,
      });
    }
    this.dialogRef.close({
      prive: couplesVehiculeChauffeurPrive,
      loue: couplesVehiculeChauffeurLoue,
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------
//----------------------------------------Detail Component------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-detail-mission',
  templateUrl: './detail-mission.html',
  styleUrls: ['./detail-mission.scss'],
})
export class DetailComponent implements OnInit {
  chauffeurs: any = [];
  matricule: any;
  commandes: any;

  displayedColumns: string[] = [
    'referenceDocument',
    'nomClient',
    'contact',
    'telephone',
    'ville',
    'adresse',
    'trackingNumber',
    'etat',
    'action',
  ];
  dataSource = new MatTableDataSource();
  expandedElement: tableCommandes | null;
  date_creation: any;
  constructor(
    public serviceMission: MissionsService,
    private serviceChauffeur: ChauffeurService,
    public _DomSanitizationService: DomSanitizer,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.refresh();
  }

  async refresh() {
    console.log(this.data.mission);
    // rafraichier la liste des commandes et calcule du poids et surface global
    let idChauffeurs = this.data.mission.idChauffeur.split('/');
    this.matricule = this.data.mission.matricule.split('/');
    for (let i = 0; i < idChauffeurs.length; i++) {
      let chauffeur = await this.serviceChauffeur
        .employe(Number(19))
        .toPromise();
      this.chauffeurs.push(chauffeur);
    }
    await this.getListeCommandes();
  }

  get nbrCommandes() {
    return this.data.mission.idCommandes.split('/').length;
  }

  get poidsMission() {
    return this.data.mission.poids;
  }

  get volumeMission() {
    return this.data.mission.volume;
  }

  async getListeCommandes() {
    this.commandes = await this.serviceMission
      .getCommandesParIdMission(this.data.mission.id)
      .toPromise();
    console.log(this.commandes);
  }

  supprimerCommande(id: any) {
    // supprimer une commande
    this.serviceMission.supprimerCommande(id);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }
  terminerCommande(id: any) {
    //marquer une commande comme livrée
    var formData: any = new FormData();
    formData.append('etat', 'Done');
    this.serviceMission.majEtat(id, formData);
    window.setTimeout(() => {
      this.refresh();
    }, 100);
  }
  ouvrirMap(commande: any) {
    const dialogRef = this.dialog.open(PositionComponent, {
      width: '1000px',
      maxWidth: '95vw',
      height: '50vh',
      autoFocus: false,
      panelClass: 'custom-dialog-position',
      data: { idPosition: commande.idPosition },
    });
  }

  // ouvrir la boite dialogue details commande
  ouvrirDetailCommande(id: any) {
    const dialogRef = this.dialog.open(DetailCommande, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail-commande',
      data: { idCommande: id, mode: 'admin' },
    });
  }
}

// *********************************************interface table commandes***************************************
export interface tableCommandes {
  id: number;
  idMission: number;
  referenceCommande: number;
  destinataire: string;
  destination: String;
  etat: String;
}

// **************************************** boite dialog position *********************************************

@Component({
  selector: 'position',
  templateUrl: './position.html',
  styleUrls: ['./position.scss'],
})
export class PositionComponent implements OnInit {
  lat: any;
  lng: any;
  zoom = 15;
  adresse: string;

  constructor(
    public serviceCommande: CommandeService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  ngOnInit(): void {
    this.getPosition();
  }

  async getPosition() {
    let position = await this.serviceCommande
      .getPositionById(this.data.idPosition)
      .toPromise();
    this.lat = Number(position.latitude);
    this.lng = Number(position.longitude);
    this.adresse = position.adresse;
    console.log(position);
  }
}

// **************************************** dialog detail commande *****************************
@Component({
  selector: 'app-detail-commande',
  templateUrl: 'detail-commande.html',
  styleUrls: ['detail-commande.scss'],
})
export class DetailCommande implements OnInit {
  listeColis: any;
  constructor(
    private dialogRef: MatDialogRef<DetailCommande>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceMission: MissionsService
  ) {}

  ngOnInit() {
    this.getListeColis();
  }

  async getListeColis() {
    this.listeColis = await this.serviceMission
      .getListeColisParIdCommande(this.data.idCommande)
      .toPromise();
    console.log(this.listeColis);
  }
  // retourne le nombre d'emballages total
  get nombrePackTotal() {
    var nombrePack = 0;
    this.listeColis.forEach((colis: any) => {
      nombrePack += colis.nombrePack;
    });
    return nombrePack;
  }

  // retourne le volume total d'une commande
  get volumeTotal() {
    var volumeTotal = 0;
    this.listeColis.forEach((colis: any) => {
      volumeTotal += colis.volume;
    });
    return volumeTotal.toFixed(3);
  }

  // retourne le poids total net d'une commande
  get poidsTotalNet() {
    var poidsTotalNet = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalNet += colis.poidsNet;
    });
    return poidsTotalNet.toFixed(3);
  }

  // retourne le poids total brut d'une commande
  get poidsTotalBrut() {
    var poidsTotalBrut = 0;
    this.listeColis.forEach((colis: any) => {
      poidsTotalBrut += colis.poidsBrut;
    });
    return poidsTotalBrut.toFixed(3);
  }
}

// **************************************** dialog  confirmer livraison *****************************
@Component({
  selector: 'app-confirmer-livraison',
  templateUrl: 'confirmer-livraison.html',
  styleUrls: ['confirmer-livraison.scss'],
})
export class ConfirmerLivraison implements OnInit {
  interval: any; //intervalle entre les keyup ==> on va specifier interval de 20ms pour ne pas autoriser l'ecriture que au scanner du code a barre
  qrCode = '';

  constructor(
    private dialogRef: MatDialogRef<ConfirmerLivraison>,
    private serviceMission: MissionsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  // fonction pour scanner le Qr code de confirmation de livraison avec le scanner
  @HostListener('window:keyup', ['$event'])
  async keyEvent(event: KeyboardEvent) {
    let reponse: any;
    if (this.interval) clearInterval(this.interval);
    if (event.code == 'Enter') {
      if (this.qrCode)
        reponse = await this.serviceMission
          .livrerCommande(this.qrCode, this.data.mission.id)
          .toPromise();
      this.qrCode = '';
      if (reponse[0]) {
        Swal.fire({
          icon: 'success',
          title: 'Commande bien reçue',
          showConfirmButton: false,
          timer: 1500,
        });
        this.dialogRef.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Qr code invalide',
          text: "Ce Qr code n'appartiens à aucune commande pour cette mission!",
        });
      }
      return;
    }
    if (event.key != 'Shift') this.qrCode += event.key;
    this.interval = setInterval(() => (this.qrCode = ''), 20);
  }
}

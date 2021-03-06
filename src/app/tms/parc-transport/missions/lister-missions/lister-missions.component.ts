/**
 * Constructeur: get droit d'accées depuis sessionStorage
 Liste des méthodes:
 * testerEtatCommandes: tester si toute les commandes sont livrées.
 * viderNom: pour vider le champs de filtrage par chauffeur.
 * viderMatricule: pour vider le champs de filtrage par matricule.
 * filtrerMission: pour faire le filtrage des missions.
 * disableEnableDate: pour activer et desactiver le filtrage par date.
 * datePrecedente: diminuer la date dans le date picker par un jour.
 * dateSuivante: augmenter le date dans le date picker par un jour.
 * detailDialog: ouvrir la boite de dialogue de détail d'une mission.
 * ouvrirDialogModifierMission: ouvrir la boite de dialogue modifier mission.
 * annulerMission: ouvrir boite dialogue de confirmation annulation mission.
 * ouvrirBoiteDialogTrajet: ouvrir boite dialogue qui permet d'afficher le trajet.
 * ouvrirBoiteDialogCloturerMission: ouvrir boite de dialogue cloturer mission.
 */
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { StompService } from 'src/app/services/stomp.service';
import {
  CloturerMission,
  ConfirmationAnnulationMission,
  DetailComponent,
  ModifierMission,
  Trajet,
} from '../dialogs/dialogs.component';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-lister-missions',
  templateUrl: './lister-missions.component.html',
  styleUrls: ['./lister-missions.component.scss'],
})
export class ListerMissionsComponent implements OnInit, AfterViewInit {
  // date d'aujourdhui
  today = new Date();
  // date initialisée a 00:00 pour eviter le decalage dans le back
  date = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate(),
    0,
    0,
    0
  );
  form = new FormGroup({
    dateL: new FormControl(this.date),
    nom: new FormControl(''),
    matricule: new FormControl(''),
  });
  filtreEtatMission = ''; //utilisée dans le filtrage par etat mission
  nomFiltre = false; //utilisée pour l'activation ou désactivation du filtrage par nom
  matriculeFiltre = false; //utilisée pour l'activation ou désactivation du filtrage par matricule
  dateFiltre = false; //utilisée pour l'activation ou désactivation du filtrage par date
  etatMissionFiltre = false; //utilisée pour l'activation ou désactivation du filtrage par etatMission
  displayedColumns: string[] = [
    'id',
    'nom',
    'matricule',
    'dateLivraison',
    'etatMission',
    'actions',
  ]; //les colonne du tableau mission
  dataSource = new MatTableDataSource<tableMissions>();
  dateRecherche: any;
  check = true;
  mission: any;
  trajet: any;
  destinations: any = [];
  destinationsOptimise: any = [];
  commande: any;

  // variable utiliser pour activer et desactiver le bouton stop
  boutonStopEstActive: boolean;
  chargementEnCours = true;

  nom: any;
  acces: any;
  tms: any;
  constructor(
    public serviceMission: MissionsService,
    public datepipe: DatePipe,
    private dialog: MatDialog, 
    private stompService: StompService
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);

    this.filtrerMission();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.stompService.subscribe('/topic/mission', (): void => {
      this.filtrerMission();

    });
  }

  ngOnDestroy(): void {
    // unsubscribe du service stomp
    this.stompService.unsubscribe();
  }

  // tester si toute les commandes sont livrées
  testerEtatCommandes(commandes: any) {
    let toutesCommandesLivrees = true;
    commandes.forEach((commande: any) => {
      commande.etat !== 'Livrée' ? (toutesCommandesLivrees = false) : '';
    });
    return toutesCommandesLivrees;
  }

  //pour vider le champs de filtrage par chauffeur
  viderNom() {
    this.nomFiltre = false;
    this.form.controls['nom'].setValue('');
    this.filtrerMission();
  }
  //pour vider le champs de filtrage par matricule
  viderMatricule() {
    this.matriculeFiltre = false;
    this.form.controls['matricule'].setValue('');
    this.filtrerMission();
  }
  //pour faire le filtrage des missions
  async filtrerMission() {
    if (this.filtreEtatMission === undefined) this.filtreEtatMission = '';
    this.chargementEnCours = true;
    this.dataSource.data = await this.serviceMission
      .filtrerMissions(
        this.form.get('nom').value,
        this.form.get('matricule').value,
        this.filtreEtatMission
      )
      .toPromise();
    // si on active le filtrage par date
    if (this.check) {
      this.date = new Date(this.form.get('dateL').value);
      this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
      this.dataSource.data = this.dataSource.data.filter(
        (mission) => mission.date === this.dateRecherche
      );
    }
    // trie et mise a jour du paginator
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.data.forEach((mission) => {
      this.serviceMission
        .getCommandesParIdMission(mission.id)
        .subscribe((commandes) => {
          mission.boutonStop = this.testerEtatCommandes(commandes);
        });
    });
    this.chargementEnCours = false;
  }
  //pour activer et desactiver le filtrage par date
  disableEnableDate() {
    if (this.check) {
      this.form.controls['dateL'].enable();
    } else {
      this.form.controls['dateL'].disable();
    }
  }

  // diminuer la date dans le date picker par un jour
  datePrecedente() {
    let dateChoisi = this.form.get('dateL').value;
    dateChoisi.setDate(dateChoisi.getDate() - 1);
    this.form.get('dateL').setValue(dateChoisi);
    this.filtrerMission();
  }

  // augmenter le date dans le date picker par un jour
  dateSuivante() {
    let dateChoisi = this.form.get('dateL').value;
    dateChoisi.setDate(dateChoisi.getDate() + 1);
    this.form.get('dateL').setValue(dateChoisi);
    this.filtrerMission();
  }

  // ouvrir la boite de dialogue de détail d'une mission
  detailDialog(mission: any): void {
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail-mission',
      autoFocus: false,
      data: { mission: mission },
    });
  }

  // ouvrir la boite de dialogue modifier mission
  ouvrirDialogModifierMission(mission: any) {
    const dialogRef = this.dialog.open(ModifierMission, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-modifier-mission',
      autoFocus: false,
      data: { mission: mission },
    });
  }

  // ouvrir boite dialogue de confirmation annulation mission
  annulerMission(mission: any) {
    let missionsPasAnnule: any = [];
    let missions = this.dataSource.data.filter(
      (mis) => mis.idMissionsLiees === mission.idMissionsLiees
    );
    let idMissionsLiees = mission.idMissionsLiees.split('/');
    let index = idMissionsLiees.indexOf(mission.id);
    idMissionsLiees.splice(index, 1);
    missions.forEach((mis) => {
      mis.etat !== 'En attente' ? missionsPasAnnule.push(mis) : '';
    });
    const dialogRef = this.dialog.open(ConfirmationAnnulationMission, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { missions: missions, missionsPasAnnule: missionsPasAnnule },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.filtrerMission();
    });
  }

  // ouvrir boite dialogue qui permet d'afficher le trajet
  ouvrirBoiteDialogTrajet(mission: any) {
    const dialogRef = this.dialog.open(Trajet, {
      width: '1000px',
      height: '554px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { mission: mission },
    });
  }

  // ouvrir boite de dialogue cloturer mission
  ouvrirBoiteDialogCloturerMission(mission: any) {
    const dialogRef = this.dialog.open(CloturerMission, {
      width: '1000px',
      data: { mission: mission }
    })
  }
}

export interface tableMissions {
  //inteface pour charger le table mission
  id: number;
  idChauffeur: String;
  nomChauffeur: string;
  matricule: String;
  idCommandes: String;
  volume: number;
  poids: number;
  score: number;
  region: String;
  etat: String;
  date: Date;
  idMissionsLiees: String;
  boutonStop: boolean;
}

import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DetailComponent } from '../dialogs/dialogs.component';
import { MissionsService } from '../services/missions.service';

@Component({
  selector: 'app-lister-missions',
  templateUrl: './lister-missions.component.html',
  styleUrls: ['./lister-missions.component.scss'],
})
export class ListerMissionsComponent implements OnInit, AfterViewInit {
  today = new Date();
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

  constructor(
    public serviceMission: MissionsService,
    public datepipe: DatePipe,
    private router: Router,
    private dialog: MatDialog
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    await this.filtrerMission();
  }

  viderNom() {
    //pour vider le champs de filtrage par chauffeur
    this.nomFiltre = false;
    this.form.controls['nom'].setValue('');
    this.filtrerMission();
  }
  viderMatricule() {
    //pour vider le champs de filtrage par matricule
    this.matriculeFiltre = false;
    this.form.controls['matricule'].setValue('');
    this.filtrerMission();
  }
  async filtrerMission() {
    //pour faire le filtrage des missions
    if (this.filtreEtatMission === undefined) this.filtreEtatMission = '';
    this.dataSource.data = await this.serviceMission
      .filtrerMissions(
        this.form.get('nom').value,
        this.form.get('matricule').value,
        this.filtreEtatMission
      )
      .toPromise();
    if (this.check) {
      this.date = new Date(this.form.get('dateL').value);
      this.dateRecherche = this.datepipe.transform(this.date, 'yyyy-MM-dd');
      this.dataSource.data = this.dataSource.data.filter(
        (mission) => mission.date === this.dateRecherche
      );
    }
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource.data);
  }
  disableEnableDate() {
    //pour activer et desactiver le filtrage par date
    if (this.check) {
      this.form.controls['dateL'].enable();
    } else {
      this.form.controls['dateL'].disable();
    }
  }

  getNomChauffeur(chauffeurs: string) {
    let listeChauffeurs = chauffeurs.split('/');
    return listeChauffeurs;
  }

  getMatricule(matricules: string) {
    let listeMatricule = matricules.split('/');
    return listeMatricule;
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

  supprimmerMission(id: any) {}

  ouvrirAffecterCommande() {
    // ouvrir la boite de dialogue d'affectation des commandes
    // localStorage.setItem('date', this.form.get('dateL').value);
    // const dialogRef = this.dialog.open(AffecterCommande, {
    //   width: '450px',
    //   panelClass: 'custom-dialog',
    //   autoFocus: false,
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   this.filtrerMission();
    // });
  }

  detailDialog(mission: any): void {
    // ouvrir la boite de dialogue de détail d'une mission
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '70vw',
      panelClass: 'custom-dialog-detail',
      autoFocus: false,
      data: { mission: mission },
    });
  }
  ouvrirMap(id: any, type: any) {
    // ouvrir google map avec le trajet
    this.serviceMission.mission(id).subscribe((res) => {
      this.mission = res;
      this.trajet = this.mission.trajet.split('/'); //recuperation du trajet
      var origine = this.trajet[0].split(':');
      origine = origine[1]; //definitionde l'origine
      var finChemin = this.trajet[this.trajet.length - 1].split(':');
      finChemin = finChemin[1]; //definition du fin de chemin
      var pointStop = '';
      for (let i = 1; i < this.trajet.length - 1; i++) {
        var x = this.trajet[i].split(':');
        pointStop += x[1] + '%7C';
      }
      pointStop = pointStop.slice(0, -3); //definition des points de stop
      window.open(
        'https://www.google.com/maps/dir/?api=1&origin=' +
          origine +
          '&destination=' +
          finChemin +
          '&travelmode=driving&waypoints=' +
          pointStop
      ); //affichage du map avec le trajet
    });
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
}

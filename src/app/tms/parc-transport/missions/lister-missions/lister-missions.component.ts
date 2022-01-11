import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DetailComponent, ModifierMission } from '../dialogs/dialogs.component';
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
  }
  disableEnableDate() {
    //pour activer et desactiver le filtrage par date
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

  detailDialog(mission: any): void {
    // ouvrir la boite de dialogue de détail d'une mission
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-detail-mission',
      autoFocus: false,
      data: { mission: mission },
    });
  }
  
  ouvrirDialogModifierMission(mission: any) {
    // ouvrir la boite de dialogue modifier mission
    const dialogRef = this.dialog.open(ModifierMission, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-modifier-mission',
      autoFocus: false,
      data: { mission: mission },
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

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { Router } from '@angular/router';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';
import { tableCommandes, MapsComponent } from '../missions.component';
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
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class DetailComponent implements OnInit {
  chauffeurs: any = [];
  matricule: any;


  mission: any;
  mis: any;
  nbr_commandes: any;
  poids_global = 0;
  surface_globale = 0;
  displayedColumns: string[] = [
    'referenceCommande',
    'expediteur',
    'mapExp',
    'destinataire',
    'mapDest',
    'dateLivraison',
    'etat',
    'action',
  ];
  dataSource = new MatTableDataSource<tableCommandes>();
  expandedElement: tableCommandes | null;
  date_creation: any;
  constructor(
    public serviceMission: MissionsService,
    private serviceChauffeur: ChauffeurService,
    public _DomSanitizationService: DomSanitizer,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.refresh();
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {}

  
  async refresh() {
    // rafraichier la liste des commandes et calcule du poids et surface global
    let idChauffeurs = this.data.mission.idChauffeur.split("/");
    this.matricule = this.data.mission.matricule.split("/");
    for (let i = 0; i < idChauffeurs.length; i++) {
      let chauffeur = await this.serviceChauffeur.employe(Number(19)).toPromise();
      this.chauffeurs.push(chauffeur)
    }
    console.log(this.mission)
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
  ouvrirMap(id: any, type: any) {
    // ouvrir le map avec la position du client ou de l'expediteur

    localStorage.setItem('idCom', id);
    localStorage.setItem('type', type);
    const dialogRef = this.dialog.open(MapsComponent, {
      width: '70vw',
      autoFocus: false,
    });
  }
}

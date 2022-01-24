import { Component, OnInit, ViewChild } from '@angular/core';
import { MissionsService } from '../parc-transport/missions/services/missions.service';
import { VehiculeService } from '../parc-transport/vehicule/services/vehicule.service';
import { fabric } from 'fabric';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PlanChargementService } from './services/plan-chargement.service';

@Component({
  selector: 'app-plan-chargement',
  templateUrl: './plan-chargement.component.html',
  styleUrls: ['./plan-chargement.component.scss'],
})
export class PlanChargementComponent implements OnInit {
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
  ]; //les colonne du tableau mission
  dataSource = new MatTableDataSource<tableMissions>();
  dateRecherche: any;
  check = true;
  mission: any;
  trajet: any;
  destinations: any = [];
  destinationsOptimise: any = [];
  commande: any;

  longueur_restant: any;
  largeur_restant: any;
  // commande: any;
  top: any = 0;
  left: any = 0;
  longueur_commande_max: any = 0;
  numCouleur = 0;
  vehicule: any;
  // mission: any;
  canvas: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private servicePlanChargement: PlanChargementService,
    public datepipe: DatePipe
  ) {}

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
    this.dataSource.data = await this.servicePlanChargement
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

  selectionnerMission(mission: any) {
    this.mission = mission;
    this.selectionPlanChargement();
  }

  getRandomColor() {
    //pour les couleurs des articles de chaque client
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
  }

  async selectionPlanChargement() {
    //realiser et dessiner le plan de chargement
    let container = document.getElementById('container'); //définition du conteneur du canvas
    this.servicePlanChargement
      .vehicule(this.mission.matricule)
      .subscribe((res: any) => {
        this.vehicule = res;
        let h: Number = this.vehicule.longueur * 2.7 + 270; //conversion du longueur du véhicule vers pixel avec mise en echelle
        container.style.height = h + 'px'; //definission du hauteur du contenaire

        let canva: any = document.getElementById('canva');
        while (canva.firstChild) {
          //reinitialiser le canva avant de dessiner
          canva.removeChild(canva.firstChild);
        }
        let legend = document.getElementById('legend');
        while (legend.firstChild) {
          //reinitialiser le legend avant de dessiner
          legend.removeChild(legend.firstChild);
        }
        let idCommandes = this.mission.idCommandes;
        idCommandes = idCommandes.split('/');
        idCommandes = idCommandes.reverse();
        this.top = 0;
        this.left = 0;
        this.longueur_commande_max = 0;
        this.longueur_restant = this.vehicule.longueur * 2.7; //reinitialisation du longueur et largeur restants
        this.largeur_restant = this.vehicule.largeur * 2.7;
        let div = document.getElementById('canva');
        canva = document.createElement('canvas'); //creation du canva
        canva.id = 'canvas';
        canva.style.zIndex = 8;
        canva.style.border = '4px solid';
        div.appendChild(canva);
        this.canvas = new fabric.StaticCanvas('canvas', {
          //definition du hauteur et largeur du canva
          width: this.vehicule.largeur * 2.7,
          height: this.vehicule.longueur * 2.7,
        });
        this.servicePlanChargement
          .listeColisParMission(this.mission.id)
          .subscribe(async (listeColis) => {
            for (let i = 0; i < idCommandes.length; i++) {
              this.commande = await this.servicePlanChargement.commande(idCommandes[i]).toPromise()
              let articles = listeColis.filter((colis: any) => colis.idCommande == idCommandes[i]);
              let couleur = this.getRandomColor();
              let legend = document.getElementById('legend'); //creation du legend
              let titre = document.createElement('div');
              titre.style.position = 'relative';
              let carreau: any = document.createElement('div');
              carreau.style.height = '14px';
              carreau.style.width = '14px';
              carreau.style.background = couleur;
              carreau.style.margin = '5px 5px';
              let text = document.createElement('div');
              text.style.width = '100px';
              text.style.position = 'absolute';
              text.style.top = '-3px';
              text.style.left = '26px';
              text.style.fontSize = 'medium';
              text.innerHTML = this.commande.nomClient;
              titre.appendChild(carreau);
              titre.appendChild(text);
              legend.appendChild(titre);
              articles.forEach((article: any) => {
                //placement des articles dans le canva
                let dimensions = article.dimensions.split('x');
                let nbrArticles = article.nombrePack;
                for (let j = 0; j < nbrArticles; j++) {
                  this.largeur_restant -= Number(dimensions[1]) * 2.7;
                  if (this.largeur_restant < 0) {
                    this.largeur_restant =
                      this.vehicule.largeur * 2.7 -
                      Number(dimensions[1]) * 2.7;
                    this.left = 0;
                    this.top += this.longueur_commande_max;
                    this.longueur_restant -= this.longueur_commande_max;
                    this.longueur_commande_max = 0;
                  }
                  const rect = new fabric.Rect({
                    top: this.top,
                    left: this.left,
                    width: Number(dimensions[1]) * 2.7,
                    height: Number(dimensions[0]) * 2.7,
                    fill: couleur,
                    stroke: 'black',
                    strokeWidth: 1,
                  });
                  this.canvas.add(rect);
                  this.left += Number(dimensions[1]) * 2.7;
                  if (Number(dimensions[0]) * 2.7 > this.longueur_commande_max)
                    this.longueur_commande_max = Number(dimensions[0]) * 2.7;
                }
              });
            }
          });
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
  idMissionsLiees: String;
}

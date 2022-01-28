import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fabric } from 'fabric';
import { PlanChargementService } from './services/plan-chargement.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-plan-chargement',
  templateUrl: './plan-chargement.component.html',
  styleUrls: ['./plan-chargement.component.scss'],
  animations: [
    trigger('statusVehicule', [
      state(
        'show',
        style({
          height: 'auto',
          minHeight: '900px',
          opacity: 1,
          overflow: 'auto',
        })
      ),
      state(
        'hide',
        style({
          overflow: 'hidden',
          opacity: 0,
          height: '0',
          minHeight: '0',
        })
      ),
      transition('show <=> hide', animate('500ms')),
    ]),
  ],
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

  listeCommandes: any = [];

  // utilisée pour afficher le div vehicule
  vehiculeEstAffiche = false;

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
    var randomColor = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, '0');
    return '#' + randomColor;
  }

  async selectionPlanChargement() {
    this.listeCommandes = [];
    //realiser et dessiner le plan de chargement
    let container = document.getElementById('container'); //définition du conteneur du canvas
    if (this.mission.idChauffeur !== 'null') {
      this.servicePlanChargement
        .vehicule(this.mission.matricule)
        .subscribe((res: any) => {
          this.vehicule = res;
          let h: Number =
            this.vehicule.longueur * 2.7 + this.vehicule.hauteur * 2.7 + 50; //conversion du longueur du véhicule vers pixel avec mise en echelle
          container.style.height = h + 'px'; //definission du hauteur du contenaire

          let canva: any = document.getElementById('canva');
          while (canva.firstChild) {
            //reinitialiser le canva avant de dessiner
            canva.removeChild(canva.firstChild);
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
          canva.style.transform =
            'translate(0, + ' + this.vehicule.longueur * 2.7 + ')'; // reset where 0,0 is located
          canva.style.transform = 'scale(1, -1)'; // invert
          div.appendChild(canva);

          let row = document.createElement('canvas'); //creation du canva
          row.id = 'row';
          row.style.zIndex = '8';
          row.style.border = '4px solid';

          div.appendChild(row);
          this.canvas = new fabric.StaticCanvas('canvas', {
            //definition du hauteur et largeur du canva
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.longueur * 2.7,
          });
          let rows = new fabric.StaticCanvas('row', {
            //definition du hauteur et largeur du canva
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.hauteur * 2.7,
          });
          this.servicePlanChargement
            .listeColisParMission(this.mission.id)
            .subscribe(async (listeColis) => {
              for (let i = 0; i < idCommandes.length; i++) {
                this.commande = await this.servicePlanChargement
                  .commande(idCommandes[i])
                  .toPromise();
                let articles = listeColis.filter(
                  (colis: any) => colis.idCommande == idCommandes[i]
                );
                articles = articles.sort((a: any, b: any) =>
                  Number(a.dimensions.split('x')[0]) *
                    Number(a.dimensions.split('x')[1]) *
                    Number(a.dimensions.split('x')[2]) >
                  Number(b.dimensions.split('x')[0]) *
                    Number(b.dimensions.split('x')[1]) *
                    Number(b.dimensions.split('x')[2])
                    ? 1
                    : -1
                );
                let couleur = this.getRandomColor();
                this.commande.couleur = couleur;
                this.listeCommandes.push(this.commande);
                let legend = document.getElementById('legend'); //creation du legend
                legend.style.padding = '20px';
                legend.style.border = '4px solid';
                // let titre = document.createElement('div');
                // titre.style.position = 'relative';
                // titre.style.display = 'flex';
                // let carreau: any = document.createElement('div');
                // carreau.style.height = '14px';
                // carreau.style.width = '14px';
                // carreau.style.background = couleur;
                // carreau.style.margin = '5px 5px';
                // let text = document.createElement('div');
                // text.style.width = '100px';
                // text.style.position = 'relative';
                // text.style.top = '-3px';
                // text.style.left = '26px';
                // text.style.fontSize = 'medium';
                // text.innerHTML = this.commande.nomClient;
                // titre.appendChild(carreau);
                // titre.appendChild(text);
                // legend.appendChild(titre);
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
                    if (
                      Number(dimensions[0]) * 2.7 >
                      this.longueur_commande_max
                    )
                      this.longueur_commande_max = Number(dimensions[0]) * 2.7;
                  }
                });
              }
            });
        });
    } else {
      this.servicePlanChargement
        .vehiculeLoue(this.mission.matricule)
        .subscribe((res: any) => {
          this.vehicule = res;
          let h: Number =
            this.vehicule.longueur * 2.7 + this.vehicule.hauteur * 2.7 + 50; //conversion du longueur du véhicule vers pixel avec mise en echelle
          container.style.height = h + 'px'; //definission du hauteur du contenaire

          let canva: any = document.getElementById('canva');
          while (canva.firstChild) {
            //reinitialiser le canva avant de dessiner
            canva.removeChild(canva.firstChild);
          }
          let legend = document.getElementById('legend');
          // while (legend.firstChild) {
          //   //reinitialiser le legend avant de dessiner
          //   legend.removeChild(legend.firstChild);
          // }
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

          let row = document.createElement('canvas'); //creation du canva
          row.id = 'row';
          row.style.zIndex = '8';
          row.style.border = '4px solid';
          row.style.transform =
            'translate(0, + ' + this.vehicule.longueur * 2.7 + ')'; // reset where 0,0 is located
          row.style.transform = 'scale(1, -1)'; // invert
          div.appendChild(row);
          let rows = new fabric.StaticCanvas('row', {
            //definition du hauteur et largeur du canva
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.hauteur * 2.7,
          });
          let lignes: any = [
            {
              longueur: 0,
              largeur: this.vehicule.largeur * 2.7,
              hauteur: this.vehicule.hauteur * 2.7,
              articles: [],
            },
          ];
          this.servicePlanChargement
            .listeColisParMission(this.mission.id)
            .subscribe(async (listeColis) => {
              let colis: any = [];
              for (let i = 0; i < idCommandes.length; i++) {
                this.commande = await this.servicePlanChargement
                  .commande(idCommandes[i])
                  .toPromise();

                let articles = listeColis.filter(
                  (colis: any) => colis.idCommande == idCommandes[i]
                );
                articles = articles.sort((a: any, b: any) =>
                  Number(a.dimensions.split('x')[0]) *
                    Number(a.dimensions.split('x')[1]) *
                    Number(a.dimensions.split('x')[2]) <
                  Number(b.dimensions.split('x')[0]) *
                    Number(b.dimensions.split('x')[1]) *
                    Number(b.dimensions.split('x')[2])
                    ? 1
                    : -1
                );
                let couleur = this.getRandomColor();
                this.commande.couleur = couleur;
                this.listeCommandes.push(this.commande);
                let legend = document.getElementById('legend'); //creation du legend
                legend.style.padding = '20px';
                legend.style.border = '4px solid';
                // let carreau = document.getElementById(this.commande.id);
                // carreau.style.height = '14px';
                // carreau.style.width = '14px';
                // carreau.style.background = couleur;
                // carreau.style.margin = '5px 5px';
                console.log(this.listeCommandes);
                // let text = document.createElement('div');
                // text.style.width = '100px';
                // text.style.position = 'relative';
                // text.style.top = '-3px';
                // text.style.left = '26px';
                // text.style.fontSize = 'medium';
                // text.innerHTML = this.commande.nomClient;
                articles.forEach((article: any) => {
                  //placement des articles dans le canva
                  let dimensions = article.dimensions.split('x');
                  let longueur = Number(dimensions[0]) * 2.7;
                  let largeur = Number(dimensions[1]) * 2.7;
                  let hauteur = Number(dimensions[2]) * 2.7;
                  article.longueur = longueur;
                  article.largeur = largeur;
                  article.hauteur = hauteur;
                  article.couleur = couleur;
                  let nbrArticles = article.nombrePack;
                  for (let j = 0; j < nbrArticles; j++) {
                    colis.push(Object.assign({}, article));
                  }
                });
                console.log(colis);
              }
              let i = 0;
              while (colis.length > 0) {
                if (!lignes[i]) {
                  lignes.push({
                    longueur: 0,
                    largeur: this.vehicule.largeur * 2.7,
                    hauteur: this.vehicule.hauteur * 2.7,
                    articles: [],
                  });
                }
                var packer = new (charger as any)(
                  lignes[i].largeur,
                  lignes[i].hauteur
                );
                packer.fit(colis, lignes[i]);
                lignes[i].articles.forEach((article: any) => {
                  let index = colis.findIndex(
                    (coli: any) => coli.id === article.id
                  );
                  colis.splice(index, 1);
                });
                i++;
              }
              console.log(lignes);
              lignes[1].articles.forEach((article: any) => {
                const rect = new fabric.Rect({
                  top: article.fit.y,
                  left: article.fit.x,
                  width: article.largeur,
                  height: article.hauteur,
                  fill: article.couleur,
                  stroke: 'black',
                  strokeWidth: 1,
                });
                rows.add(rect);
              });
              let top = 0
              lignes.forEach((ligne: any) => {
                let longueur = 0;
                ligne.articles.forEach((article: any) => {
                  if (longueur < article.longueur) {
                    longueur = article.longueur;
                  }
                  const rect = new fabric.Rect({
                    top: top,
                    left: article.fit.x,
                    width: article.largeur,
                    height: article.longueur,
                    fill: article.couleur,
                    stroke: 'black',
                    strokeWidth: 1,
                  });
                  this.canvas.add(rect);
                });
                ligne.longueur = longueur;
                top += longueur;
              });
            });
        });
    }
    let premierChargement;
    this.vehiculeEstAffiche
      ? (premierChargement = false)
      : (premierChargement = true);
    this.vehiculeEstAffiche = true;
    let vehicule = document.getElementById('vehicule');
    premierChargement
      ? setTimeout(() => {
          this.scroll(vehicule);
        }, 500)
      : this.scroll(vehicule);
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  // etat du div qui contient liste des colis dans voiture "show" pour afficher, "hide" pour cacher
  get statusVehicule() {
    return this.vehiculeEstAffiche ? 'show' : 'hide';
  }

  async drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.listeCommandes,
      event.previousIndex,
      event.currentIndex
    );
    let idCommandes = '';
    for (let i = 0; i < this.listeCommandes.length; i++) {
      const commande = this.listeCommandes[i];
      idCommandes = commande.id + '/' + idCommandes;
    }
    idCommandes = idCommandes.slice(0, -1);
    this.mission.idCommandes = idCommandes;
    console.log(idCommandes);
    await this.servicePlanChargement
      .modifierIdCommandesDansMission(this.mission.id, idCommandes)
      .toPromise();
  }
}

function charger(this: any, largeur: number, hauteur: number) {
  this.init(largeur, hauteur);
}

charger.prototype = {
  init: function (largeur: number, hauteur: number) {
    this.root = { x: 0, y: 0, largeur: largeur, hauteur: hauteur };
  },

  fit: function (blocks: any, ligne: any) {
    var n, node, block;
    for (n = 0; n < blocks.length; n++) {
      block = blocks[n];
      if (
        (node = this.chercherNoeud(this.root, block.largeur, block.hauteur))
      ) {
        block.fit = this.diviserNoeud(node, block.largeur, block.hauteur);
        ligne.articles.push(block);
      }
    }
  },

  chercherNoeud: function (root: any, largeur: number, hauteur: number) {
    if (root.used)
      return (
        this.chercherNoeud(root.right, largeur, hauteur) ||
        this.chercherNoeud(root.down, largeur, hauteur)
      );
    else if (largeur <= root.largeur && hauteur <= root.hauteur) return root;
    else return null;
  },

  diviserNoeud: function (node: any, largeur: number, hauteur: number) {
    node.used = true;
    node.down = {
      x: node.x,
      y: node.y + hauteur,
      largeur: node.largeur,
      hauteur: node.hauteur - hauteur,
    };
    node.right = {
      x: node.x + largeur,
      y: node.y,
      largeur: node.largeur - largeur,
      hauteur: hauteur,
    };
    return node;
  },
};

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

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
import { loadavg } from 'os';
import Swal from 'sweetalert2';

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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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
  dateRecherche: any; //date utilisé dans le filtrage par date
  check = true; //valeur du checkbox d'activation/desactivation filtrage par date
  mission: any; //variable qi contient la mission selectionnée
  vehicule: any; //vehicule selectionnée

  listeCommandes: any = []; //liste des commandes qui contient l'info de chaque commande dans une mission
  commande: any;
  canvasTopEnregistre: any;

  lignes: any; //liste des lignes dans le vehicule (une ligne c'est l'ensemble des articles de guache vers la droite qu'on oeur les voir depuis la vue top)
  listeCanvasLignesEnregistrees: string[] = [];
  listeCanvasLignesEnregistreesStr: string;

  indexLigne = 0; //index d'une ligne dans la liste des lignes
  indexLignePrecedent = 0;

  // utilisée pour afficher le div vehicule
  vehiculeEstAffiche = false;
  root: { x: number; y: number; largeur: number; hauteur: number }; //le root represente le rectangle que
  canvas: fabric.Canvas;
  rows: fabric.Canvas;

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

  // fonction qui permet de selectionner une mission qh'on va afficher son plan de chargement
  selectionnerMission(mission: any) {
    this.mission = mission;
    this.initialiserCanva();
  }

  getRandomColor() {
    //pour les couleurs des articles de chaque client
    var randomColor = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, '0');
    return '#' + randomColor;
  }

  // créer canva vide
  initialiserCanva() {
    this.listeCommandes = []; //reinitialiser la liste des commandes
    this.lignes = [];
    let idCommandes = this.mission.idCommandes;
    idCommandes = idCommandes.split('/'); //liste des id de commandes dans une mission
    idCommandes = idCommandes.reverse(); //on inverse la liste car la derniére commande a livrer va etre la premiére a charger

    // recupérer la liste des colis dans une mission
    this.servicePlanChargement
      .listeColisParMission(this.mission.id)
      .subscribe(async (listeColis) => {
        for (let i = 0; i < idCommandes.length; i++) {
          // pour chaque commande on récupére ses informations
          this.commande = await this.servicePlanChargement
            .commande(idCommandes[i])
            .toPromise();
          //recupérer la liste des article pour chaque commande
          this.commande.articles = listeColis.filter(
            (colis: any) => colis.idCommande == idCommandes[i]
          );
          // donner un couleur pour chaque commande
          //le couleur va être utiliser pour identifier les articles de chaque commande
          let couleur = this.getRandomColor();
          this.commande.couleur = couleur;
          this.listeCommandes.push(this.commande);
        }
      });
    let container = document.getElementById('container'); //recuperer le div container qui va contenir notre canva
    // on teste si c'est une mission avec vehicule privé
    if (this.mission.idChauffeur !== 'null') {
      // recupérer les données de notre vehicule privée par son matricule
      this.servicePlanChargement
        .vehicule(this.mission.matricule)
        .subscribe((res: any) => {
          this.vehicule = res;
          let h: Number =
            this.vehicule.longueur * 2.7 + this.vehicule.hauteur * 2.7 + 80; //hauteur du container
          //(le container va avoir deux canvas un pour la vue du top du camion et l'autre pour la vue de l'arriere).
          // le hauteur du container c'est la longueur du camion => longueur vue top +
          // hauteur du camion => longueur du vue arriée + 50 px pour mettre un peut d'espace pour que le canva soit claire
          // on multiplie les dimensions du vehicule par 2.7 pour convertir du cm ver pixels
          container.style.height = h + 'px'; //definission du hauteur du contenaire

          let divTop: any = document.getElementById('vueTop'); //recuperer le div 'vueTop'
          while (divTop.firstChild) {
            //supprimer le contenu du div top pour l'initialiser
            divTop.removeChild(divTop.firstChild);
          }
          let divLigne: any = document.getElementById('vueLigne'); //recuperer le div 'vueTop' ('vueLigne' est la vue de l'arriére)
          while (divLigne.firstChild) {
            //supprimer le contenu du div vueLigne pour l'initialiser
            divLigne.removeChild(divLigne.firstChild);
          }
          let canvaTop = document.createElement('canvas'); //creation du canva du vue top
          canvaTop.id = 'canvas';
          canvaTop.style.zIndex = '8';
          canvaTop.style.border = '4px solid';
          divTop.appendChild(canvaTop); //on ajoute le canva créé dans le divTop
          this.canvas = new fabric.Canvas('canvas', {
            //creation de l'objet canva du vueTop a l'aide du biblio fabric js
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.longueur * 2.7,
            selection: false,
          });

          let row = document.createElement('canvas'); //creation du canva vue ligne
          row.id = 'row';
          row.style.zIndex = '8';
          row.style.border = '4px solid';
          divLigne.appendChild(row);
          this.rows = new fabric.Canvas('row', {
            //creation de l'objet canva du vueLigne a l'aide du biblio fabric js
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.hauteur * 2.7,
            selection: false,
          });
          let snap = 2; //Pixels to snap
          let canvasWidth = this.vehicule.largeur * 2.7;
          let canvasHeight = this.vehicule.hauteur * 2.7;
          let rows = this.rows;
          let canvas = this.canvas;
          this.rows.on('object:moving', function (options: any) {
            // Sets corner position coordinates based on current angle, width and height
            options.target.setCoords();

            // Don't allow objects off the canvas
            if (options.target.left < snap) {
              options.target.left = 0;
            }

            if (options.target.top < snap) {
              options.target.top = 0;
            }

            if (
              options.target.getScaledWidth() + options.target.left >
              canvasWidth - snap
            ) {
              options.target.left =
                canvasWidth - options.target.getScaledWidth();
            }

            if (
              options.target.getScaledHeight() + options.target.top >
              canvasHeight - snap
            ) {
              options.target.top =
                canvasHeight - options.target.getScaledHeight();
            }

            // Loop through objects
            rows.forEachObject(function (obj) {
              if (obj === options.target) return;

              // If objects intersect
              if (
                options.target.isContainedWithinObject(obj) ||
                options.target.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(options.target)
              ) {
                var distX =
                  (obj.left + obj.getScaledWidth()) / 2 -
                  (options.target.left + options.target.getScaledWidth()) / 2;
                var distY =
                  (obj.top + obj.getScaledHeight()) / 2 -
                  (options.target.top + options.target.getScaledHeight()) / 2;

                // Set new position
                findNewPos(distX, distY, options.target, obj);
              }

              // Snap objects to each other horizontally

              // If bottom points are on same Y axis
              if (
                Math.abs(
                  options.target.top +
                    options.target.getScaledHeight() -
                    (obj.top + obj.getScaledHeight())
                ) < snap
              ) {
                // Snap target BL to object BR
                if (
                  Math.abs(
                    options.target.left - (obj.left + obj.getScaledWidth())
                  ) < snap
                ) {
                  options.target.left = obj.left + obj.getScaledWidth();
                  options.target.top =
                    obj.top +
                    obj.getScaledHeight() -
                    options.target.getScaledHeight();
                }

                // Snap target BR to object BL
                if (
                  Math.abs(
                    options.target.left +
                      options.target.getScaledWidth() -
                      obj.left
                  ) < snap
                ) {
                  options.target.left =
                    obj.left - options.target.getScaledWidth();
                  options.target.top =
                    obj.top +
                    obj.getScaledHeight() -
                    options.target.getScaledHeight();
                }
              }

              // If top points are on same Y axis
              if (Math.abs(options.target.top - obj.top) < snap) {
                // Snap target TL to object TR
                if (
                  Math.abs(
                    options.target.left - (obj.left + obj.getScaledWidth())
                  ) < snap
                ) {
                  options.target.left = obj.left + obj.getScaledWidth();
                  options.target.top = obj.top;
                }

                // Snap target TR to object TL
                if (
                  Math.abs(
                    options.target.left +
                      options.target.getScaledWidth() -
                      obj.left
                  ) < snap
                ) {
                  options.target.left =
                    obj.left - options.target.getScaledWidth();
                  options.target.top = obj.top;
                }
              }

              // Snap objects to each other vertically

              // If right points are on same X axis
              if (
                Math.abs(
                  options.target.left +
                    options.target.getScaledWidth() -
                    (obj.left + obj.getScaledWidth())
                ) < snap
              ) {
                // Snap target TR to object BR
                if (
                  Math.abs(
                    options.target.top - (obj.top + obj.getScaledHeight())
                  ) < snap
                ) {
                  options.target.left =
                    obj.left +
                    obj.getScaledWidth() -
                    options.target.getScaledWidth();
                  options.target.top = obj.top + obj.getScaledHeight();
                }

                // Snap target BR to object TR
                if (
                  Math.abs(
                    options.target.top +
                      options.target.getScaledHeight() -
                      obj.top
                  ) < snap
                ) {
                  options.target.left =
                    obj.left +
                    obj.getScaledWidth() -
                    options.target.getScaledWidth();
                  options.target.top =
                    obj.top - options.target.getScaledHeight();
                }
              }

              // If left points are on same X axis
              if (Math.abs(options.target.left - obj.left) < snap) {
                // Snap target TL to object BL
                if (
                  Math.abs(
                    options.target.top - (obj.top + obj.getScaledHeight())
                  ) < snap
                ) {
                  options.target.left = obj.left;
                  options.target.top = obj.top + obj.getScaledHeight();
                }

                // Snap target BL to object TL
                if (
                  Math.abs(
                    options.target.top +
                      options.target.getScaledHeight() -
                      obj.top
                  ) < snap
                ) {
                  options.target.left = obj.left;
                  options.target.top =
                    obj.top - options.target.getScaledHeight();
                }
              }
            });

            options.target.setCoords();

            // If objects still overlap

            var outerAreaLeft: any = null,
              outerAreaTop: any = null,
              outerAreaRight: any = null,
              outerAreaBottom: any = null;

            rows.forEachObject(function (obj) {
              if (obj === options.target) return;

              if (
                options.target.isContainedWithinObject(obj) ||
                options.target.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(options.target)
              ) {
                var intersectLeft = null,
                  intersectTop = null,
                  intersectWidth = null,
                  intersectHeight = null,
                  intersectSize = null,
                  targetLeft = options.target.left,
                  targetRight = targetLeft + options.target.getScaledWidth(),
                  targetTop = options.target.top,
                  targetBottom = targetTop + options.target.getScaledHeight(),
                  objectLeft = obj.left,
                  objectRight = objectLeft + obj.getScaledWidth(),
                  objectTop = obj.top,
                  objectBottom = objectTop + obj.getScaledHeight();

                // Find intersect information for X axis
                if (targetLeft >= objectLeft && targetLeft <= objectRight) {
                  intersectLeft = targetLeft;
                  intersectWidth =
                    obj.getScaledWidth() - (intersectLeft - objectLeft);
                } else if (
                  objectLeft >= targetLeft &&
                  objectLeft <= targetRight
                ) {
                  intersectLeft = objectLeft;
                  intersectWidth =
                    options.target.getScaledWidth() -
                    (intersectLeft - targetLeft);
                }

                // Find intersect information for Y axis
                if (targetTop >= objectTop && targetTop <= objectBottom) {
                  intersectTop = targetTop;
                  intersectHeight =
                    obj.getScaledHeight() - (intersectTop - objectTop);
                } else if (
                  objectTop >= targetTop &&
                  objectTop <= targetBottom
                ) {
                  intersectTop = objectTop;
                  intersectHeight =
                    options.target.getScaledHeight() -
                    (intersectTop - targetTop);
                }

                // Find intersect size (this will be 0 if objects are touching but not overlapping)
                if (intersectWidth > 0 && intersectHeight > 0) {
                  intersectSize = intersectWidth * intersectHeight;
                }

                // Set outer snapping area
                if (obj.left < outerAreaLeft || outerAreaLeft == null) {
                  outerAreaLeft = obj.left;
                }

                if (obj.top < outerAreaTop || outerAreaTop == null) {
                  outerAreaTop = obj.top;
                }

                if (
                  obj.left + obj.getScaledWidth() > outerAreaRight ||
                  outerAreaRight == null
                ) {
                  outerAreaRight = obj.left + obj.getScaledWidth();
                }

                if (
                  obj.top + obj.getScaledHeight() > outerAreaBottom ||
                  outerAreaBottom == null
                ) {
                  outerAreaBottom = obj.top + obj.getScaledHeight();
                }

                // If objects are intersecting, reposition outside all shapes which touch
                if (intersectSize) {
                  var distX =
                    outerAreaRight / 2 -
                    (options.target.left + options.target.getScaledWidth()) / 2;
                  var distY =
                    outerAreaBottom / 2 -
                    (options.target.top + options.target.getScaledHeight()) / 2;

                  // Set new position
                  findNewPos(distX, distY, options.target, obj);
                }
              }
            });
            for (let i = 0; i < canvas.getObjects().length; i++) {
              const obj: any = canvas.getObjects()[i];
              if (
                obj.id ===
                (rows.getActiveObject() as unknown as IObjectWithId).id
              ) {
                canvas.setActiveObject(obj);
              }
            }
            let canvasObject = canvas.getActiveObject();
            canvasObject.left = options.target.left;

            let listeObjTrie = rows
              .getObjects()
              .sort((a: any, b: any) => (a.top > b.top ? -1 : 1));
            let objCanvas = canvas.getObjects();
            for (let j = 0; j < listeObjTrie.length; j++) {
              const objFiltre: any = listeObjTrie[j];
              for (let i = 0; i < objCanvas.length; i++) {
                const obj: any = objCanvas[i];
                if (obj.id === objFiltre.id) {
                  canvas.setActiveObject(obj);
                }
              }
              let canvasObject = canvas.getActiveObject();
              canvas.bringToFront(canvasObject);
            }

            canvasObject.setCoords();
            canvas.discardActiveObject().renderAll();
          });
        });
    } else {
      this.servicePlanChargement
        .vehiculeLoue(this.mission.matricule)
        .subscribe((res: any) => {
          this.vehicule = res;
          let h: Number =
            this.vehicule.longueur * 2.7 + this.vehicule.hauteur * 2.7 + 80; //conversion du longueur du véhicule vers pixel avec mise en echelle
          container.style.height = h + 'px'; //definission du hauteur du contenaire

          let divTop: any = document.getElementById('vueTop');
          while (divTop.firstChild) {
            //reinitialiser le canva avant de dessiner
            divTop.removeChild(divTop.firstChild);
          }
          let divLigne: any = document.getElementById('vueLigne');
          while (divLigne.firstChild) {
            //reinitialiser le canva avant de dessiner
            divLigne.removeChild(divLigne.firstChild);
          }
          let canva = document.createElement('canvas'); //creation du canva
          canva.id = 'canvas';
          canva.style.zIndex = '8';
          canva.style.border = '4px solid';
          divTop.appendChild(canva);
          this.canvas = new fabric.Canvas('canvas', {
            //definition du hauteur et largeur du canva
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.longueur * 2.7,
            selection: false,
          });

          let row = document.createElement('canvas'); //creation du canva
          row.id = 'row';
          row.style.zIndex = '8';
          row.style.border = '4px solid';
          divLigne.appendChild(row);
          this.rows = new fabric.Canvas('row', {
            //definition du hauteur et largeur du canva
            width: this.vehicule.largeur * 2.7,
            height: this.vehicule.hauteur * 2.7,
            selection: false,
          });
          let snap = 2; //Pixels to snap
          let canvasWidth = this.vehicule.largeur * 2.7;
          let canvasHeight = this.vehicule.hauteur * 2.7;
          let rows = this.rows;
          let canvas = this.canvas;
          let canvasEnregistree;
          this.rows.on('object:moving', function (options) {
            // Sets corner position coordinates based on current angle, width and height
            options.target.setCoords();

            // Don't allow objects off the canvas
            if (options.target.left < snap) {
              options.target.left = 0;
            }

            if (options.target.top < snap) {
              options.target.top = 0;
            }

            if (
              options.target.getScaledWidth() + options.target.left >
              canvasWidth - snap
            ) {
              options.target.left =
                canvasWidth - options.target.getScaledWidth();
            }

            if (
              options.target.getScaledHeight() + options.target.top >
              canvasHeight - snap
            ) {
              options.target.top =
                canvasHeight - options.target.getScaledHeight();
            }

            // Loop through objects
            rows.forEachObject(function (obj) {
              if (obj === options.target) return;

              // If objects intersect
              if (
                options.target.isContainedWithinObject(obj) ||
                options.target.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(options.target)
              ) {
                var distX =
                  (obj.left + obj.getScaledWidth()) / 2 -
                  (options.target.left + options.target.getScaledWidth()) / 2;
                var distY =
                  (obj.top + obj.getScaledHeight()) / 2 -
                  (options.target.top + options.target.getScaledHeight()) / 2;

                // Set new position
                findNewPos(distX, distY, options.target, obj);
              }

              // Snap objects to each other horizontally

              // If bottom points are on same Y axis
              if (
                Math.abs(
                  options.target.top +
                    options.target.getScaledHeight() -
                    (obj.top + obj.getScaledHeight())
                ) < snap
              ) {
                // Snap target BL to object BR
                if (
                  Math.abs(
                    options.target.left - (obj.left + obj.getScaledWidth())
                  ) < snap
                ) {
                  options.target.left = obj.left + obj.getScaledWidth();
                  options.target.top =
                    obj.top +
                    obj.getScaledHeight() -
                    options.target.getScaledHeight();
                }

                // Snap target BR to object BL
                if (
                  Math.abs(
                    options.target.left +
                      options.target.getScaledWidth() -
                      obj.left
                  ) < snap
                ) {
                  options.target.left =
                    obj.left - options.target.getScaledWidth();
                  options.target.top =
                    obj.top +
                    obj.getScaledHeight() -
                    options.target.getScaledHeight();
                }
              }

              // If top points are on same Y axis
              if (Math.abs(options.target.top - obj.top) < snap) {
                // Snap target TL to object TR
                if (
                  Math.abs(
                    options.target.left - (obj.left + obj.getScaledWidth())
                  ) < snap
                ) {
                  options.target.left = obj.left + obj.getScaledWidth();
                  options.target.top = obj.top;
                }

                // Snap target TR to object TL
                if (
                  Math.abs(
                    options.target.left +
                      options.target.getScaledWidth() -
                      obj.left
                  ) < snap
                ) {
                  options.target.left =
                    obj.left - options.target.getScaledWidth();
                  options.target.top = obj.top;
                }
              }

              // Snap objects to each other vertically

              // If right points are on same X axis
              if (
                Math.abs(
                  options.target.left +
                    options.target.getScaledWidth() -
                    (obj.left + obj.getScaledWidth())
                ) < snap
              ) {
                // Snap target TR to object BR
                if (
                  Math.abs(
                    options.target.top - (obj.top + obj.getScaledHeight())
                  ) < snap
                ) {
                  options.target.left =
                    obj.left +
                    obj.getScaledWidth() -
                    options.target.getScaledWidth();
                  options.target.top = obj.top + obj.getScaledHeight();
                }

                // Snap target BR to object TR
                if (
                  Math.abs(
                    options.target.top +
                      options.target.getScaledHeight() -
                      obj.top
                  ) < snap
                ) {
                  options.target.left =
                    obj.left +
                    obj.getScaledWidth() -
                    options.target.getScaledWidth();
                  options.target.top =
                    obj.top - options.target.getScaledHeight();
                }
              }

              // If left points are on same X axis
              if (Math.abs(options.target.left - obj.left) < snap) {
                // Snap target TL to object BL
                if (
                  Math.abs(
                    options.target.top - (obj.top + obj.getScaledHeight())
                  ) < snap
                ) {
                  options.target.left = obj.left;
                  options.target.top = obj.top + obj.getScaledHeight();
                }

                // Snap target BL to object TL
                if (
                  Math.abs(
                    options.target.top +
                      options.target.getScaledHeight() -
                      obj.top
                  ) < snap
                ) {
                  options.target.left = obj.left;
                  options.target.top =
                    obj.top - options.target.getScaledHeight();
                }
              }
            });

            options.target.setCoords();

            // If objects still overlap

            var outerAreaLeft: any = null,
              outerAreaTop: any = null,
              outerAreaRight: any = null,
              outerAreaBottom: any = null;

            rows.forEachObject(function (obj) {
              if (obj === options.target) return;

              if (
                options.target.isContainedWithinObject(obj) ||
                options.target.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(options.target)
              ) {
                var intersectLeft = null,
                  intersectTop = null,
                  intersectWidth = null,
                  intersectHeight = null,
                  intersectSize = null,
                  targetLeft = options.target.left,
                  targetRight = targetLeft + options.target.getScaledWidth(),
                  targetTop = options.target.top,
                  targetBottom = targetTop + options.target.getScaledHeight(),
                  objectLeft = obj.left,
                  objectRight = objectLeft + obj.getScaledWidth(),
                  objectTop = obj.top,
                  objectBottom = objectTop + obj.getScaledHeight();

                // Find intersect information for X axis
                if (targetLeft >= objectLeft && targetLeft <= objectRight) {
                  intersectLeft = targetLeft;
                  intersectWidth =
                    obj.getScaledWidth() - (intersectLeft - objectLeft);
                } else if (
                  objectLeft >= targetLeft &&
                  objectLeft <= targetRight
                ) {
                  intersectLeft = objectLeft;
                  intersectWidth =
                    options.target.getScaledWidth() -
                    (intersectLeft - targetLeft);
                }

                // Find intersect information for Y axis
                if (targetTop >= objectTop && targetTop <= objectBottom) {
                  intersectTop = targetTop;
                  intersectHeight =
                    obj.getScaledHeight() - (intersectTop - objectTop);
                } else if (
                  objectTop >= targetTop &&
                  objectTop <= targetBottom
                ) {
                  intersectTop = objectTop;
                  intersectHeight =
                    options.target.getScaledHeight() -
                    (intersectTop - targetTop);
                }

                // Find intersect size (this will be 0 if objects are touching but not overlapping)
                if (intersectWidth > 0 && intersectHeight > 0) {
                  intersectSize = intersectWidth * intersectHeight;
                }

                // Set outer snapping area
                if (obj.left < outerAreaLeft || outerAreaLeft == null) {
                  outerAreaLeft = obj.left;
                }

                if (obj.top < outerAreaTop || outerAreaTop == null) {
                  outerAreaTop = obj.top;
                }

                if (
                  obj.left + obj.getScaledWidth() > outerAreaRight ||
                  outerAreaRight == null
                ) {
                  outerAreaRight = obj.left + obj.getScaledWidth();
                }

                if (
                  obj.top + obj.getScaledHeight() > outerAreaBottom ||
                  outerAreaBottom == null
                ) {
                  outerAreaBottom = obj.top + obj.getScaledHeight();
                }

                // If objects are intersecting, reposition outside all shapes which touch
                if (intersectSize) {
                  var distX =
                    outerAreaRight / 2 -
                    (options.target.left + options.target.getScaledWidth()) / 2;
                  var distY =
                    outerAreaBottom / 2 -
                    (options.target.top + options.target.getScaledHeight()) / 2;

                  // Set new position
                  findNewPos(distX, distY, options.target, obj);
                }
              }
            });
            for (let i = 0; i < canvas.getObjects().length; i++) {
              const obj: any = canvas.getObjects()[i];
              if (
                obj.id ===
                (rows.getActiveObject() as unknown as IObjectWithId).id
              ) {
                canvas.setActiveObject(obj);
              }
            }
            let canvasObject = canvas.getActiveObject();
            canvasObject.left = options.target.left;

            let listeObjTrie = rows
              .getObjects()
              .sort((a: any, b: any) => (a.top > b.top ? -1 : 1));
            let objCanvas = canvas.getObjects();
            for (let j = 0; j < listeObjTrie.length; j++) {
              const objFiltre: any = listeObjTrie[j];
              for (let i = 0; i < objCanvas.length; i++) {
                const obj: any = objCanvas[i];
                if (obj.id === objFiltre.id) {
                  canvas.setActiveObject(obj);
                }
              }
              let canvasObject = canvas.getActiveObject();
              canvas.bringToFront(canvasObject);
            }
            canvasObject.setCoords();
            canvas.discardActiveObject().renderAll();
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

  // créer plan chargement mode automatique
  createPlanChargementAuto() {
    this.lignes = [];
    // liste des ligne qui contient chaque ligne comme objet
    // la liste est initialisé avec une seule ligne qui a longueur de 0 et comme largeur le largeur du vehicule converti en pixels et comme longueur la longuer du vehicule en pixels
    let lignes: any = [
      {
        longueur: 0,
        largeur: this.vehicule.largeur * 2.7,
        hauteur: this.vehicule.hauteur * 2.7,
        articles: [],
      },
    ];
    let colis: any = [];
    this.listeCommandes.forEach((commande: any) => {
      // on trie les articles d'une commande par leur volume descendant
      let articles = commande.articles.sort((a: any, b: any) =>
        Number(a.dimensions.split('x')[0]) *
          Number(a.dimensions.split('x')[1]) *
          Number(a.dimensions.split('x')[2]) >
        Number(b.dimensions.split('x')[0]) *
          Number(b.dimensions.split('x')[1]) *
          Number(b.dimensions.split('x')[2])
          ? -1
          : 1
      );
      articles.forEach((article: any) => {
        //pour chaque article on identifie ses dimensions
        let dimensions = article.dimensions.split('x');
        let longueur = Number(dimensions[0]) * 2.7;
        let largeur = Number(dimensions[1]) * 2.7;
        let hauteur = Number(dimensions[2]) * 2.7;
        // on enregistre ces dimensions dans l'objet article
        article.longueur = longueur;
        article.largeur = largeur;
        article.hauteur = hauteur;
        article.couleur = commande.couleur;
        let nbrArticles = article.nombrePack; //quantité d'un article dans une commande
        for (let j = 0; j < nbrArticles; j++) {
          //pour chaque colis on ajoute ces informations d'article
          colis.push(Object.assign({}, article)); //on push une copie de l'article car si on push l'objet article, une simple modification dans ce dernier affecte toute la liste
        }
      });
    });
    // indice du ligne
    let i = 0;
    // ce bloc permet de place chaque colis dans la bonne position dans une ligne
    // tant que la liste des colis n'est pas vide cette boucle s'execute
    while (colis.length > 0) {
      // si la ligne avec cet indice n'existe pas on ajoute une nouvelle ligne
      if (!lignes[i]) {
        lignes.push({
          longueur: 0,
          largeur: this.vehicule.largeur * 2.7,
          hauteur: this.vehicule.hauteur * 2.7,
          articles: [],
        });
      }
      // on initialise le root
      this.initialiserRoot(lignes[i].largeur, lignes[i].hauteur);
      // on place les colis dans leurs places
      this.fit(colis, lignes[i]);
      // pour chaque colis affectée dans une ligne en supprime se colis de la liste des colis non affectées
      lignes[i].articles.forEach((article: any) => {
        let index = colis.findIndex((coli: any) => coli.id === article.id);
        colis.splice(index, 1);
      });
      i++;
    }
    this.lignes = lignes;
    // index ligne a afficher
    this.indexLigne = 0;

    // -----------------------------------------------
    this.listeCanvasLignesEnregistrees = [];
    for (let j = 0; j < this.lignes.length; j++) {
      let nombreArticleDansLignesPrecedentes = 0;
      let rowAEnregistrer = new fabric.Canvas('', {
        //creation de l'objet canva du vueLigne a l'aide du biblio fabric js
        width: this.vehicule.largeur * 2.7,
        height: this.vehicule.hauteur * 2.7,
        selection: false,
      });
      for (let i = 0; i < j; i++) {
        nombreArticleDansLignesPrecedentes += this.lignes[i].articles.length;
      }
      let idArticle = nombreArticleDansLignesPrecedentes;
      this.lignes[j].articles.forEach((article: any) => {
        const rect = new fabric.Rect({
          originX: 'center',
          originY: 'center',
          width: article.largeur - 1,
          height: article.hauteur - 1,
          fill: article.couleur,
          stroke: 'black',
          strokeWidth: 1,
          lockUniScaling: true,
        });
        var text = new fabric.Text(article.emballage, {
          fontSize: 10,
          originX: 'center',
          originY: 'center',
        });

        var group = new fabric.Group([rect, text], {
          top: this.vehicule.hauteur * 2.7 - article.hauteur - article.fit.y,
          left: article.fit.x,
          id: idArticle,
          centeredRotation: true,
        } as IGroupWithId);
        group.setControlsVisibility({
          tl: false, //top-left
          mt: false, // middle-top
          tr: false, //top-right
          ml: false, //middle-left
          mr: false, //middle-right
          bl: false, // bottom-left
          mb: false, //middle-bottom
          br: false, //bottom-right
          mtr: false,
        });

        rowAEnregistrer.add(group);
        idArticle++;
      });

      this.listeCanvasLignesEnregistrees.push(
        rowAEnregistrer.toJSON(['id', '_controlsVisibility'])
      );
    }

    let topAEnregistrer = new fabric.Canvas('', {
      //creation de l'objet canva du vueLigne a l'aide du biblio fabric js
      width: this.vehicule.largeur * 2.7,
      height: this.vehicule.hauteur * 2.7,
      selection: false,
    });
    let top = 0;
    let idArticleCanva = 0;
    this.lignes.forEach((ligne: any) => {
      let longueur = 0;
      ligne.articles.forEach((article: any) => {
        if (longueur < article.longueur) {
          longueur = article.longueur;
        }
        const rect = new fabric.Rect({
          originX: 'center',
          originY: 'center',
          width: article.largeur,
          height: article.longueur,
          fill: article.couleur,
          stroke: 'black',
          strokeWidth: 1,
        });
        var text = new fabric.Text(article.emballage, {
          fontSize: 10,
          originX: 'center',
          originY: 'center',
        });

        var group = new fabric.Group([rect, text], {
          top: top,
          left: article.fit.x,
          id: idArticleCanva,
        } as IGroupWithId);
        group.setControlsVisibility({
          tl: false, //top-left
          mt: false, // middle-top
          tr: false, //top-right
          ml: false, //middle-left
          mr: false, //middle-right
          bl: false, // bottom-left
          mb: false, //middle-bottom
          br: false, //bottom-right
          mtr: false,
        });
        topAEnregistrer.add(group);
        idArticleCanva++;
      });
      ligne.longueur = longueur;
      ligne.top = top;
      top += longueur;
      ligne.largeur = this.vehicule.largeur * 2.7;
    });
    this.canvasTopEnregistre = JSON.stringify(
      topAEnregistrer.toJSON(['id', '_controlsVisibility'])
    );

    this.afficherPlanChargement();
  }

  // afficher le plan de chargement specifique a une mission
  afficherPlanChargement() {
    this.canvas.loadFromJSON(this.canvasTopEnregistre, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();
    });
    this.rows.loadFromJSON(this.listeCanvasLignesEnregistrees[0], () => {
      // making sure to render canvas at the end
      this.rows.renderAll();
    });

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

  changerLigne() {
    this.listeCanvasLignesEnregistrees[this.indexLignePrecedent] =
      this.rows.toJSON(['id', '_controlsVisibility']);

    let divLigne: any = document.getElementById('vueLigne');
    this.rows.clear();
    this.rows.loadFromJSON(
      this.listeCanvasLignesEnregistrees[this.indexLigne],
      () => {
        // making sure to render canvas at the end
        this.rows.renderAll();
      }
    );
    this.scroll(divLigne);
    this.indexLignePrecedent = this.indexLigne;
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
    this.createPlanChargementAuto();
  }

  initialiserRoot(largeur: number, hauteur: number) {
    this.root = { x: 0, y: 0, largeur: largeur, hauteur: hauteur };
  }

  fit(blocks: any, ligne: any) {
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
  }

  chercherNoeud(root: any, largeur: number, hauteur: number): any {
    if (root.used)
      return (
        this.chercherNoeud(root.right, largeur, hauteur) ||
        this.chercherNoeud(root.down, largeur, hauteur)
      );
    else if (largeur <= root.largeur && hauteur <= root.hauteur) return root;
    else return null;
  }

  diviserNoeud(node: any, largeur: number, hauteur: number) {
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
  }

  rotation(angle: number) {
    let objet: any = this.rows.getActiveObject();
    const width = objet._objects[0].width;
    const height = objet._objects[0].height;
    objet._objects[0].width = height;
    objet._objects[0].height = width;
    objet._objects[1].angle += angle;
    objet.addWithUpdate();
    this.rows.renderAll();

    for (let i = 0; i < this.canvas.getObjects().length; i++) {
      const obj: any = this.canvas.getObjects()[i];
      if (
        obj.id === (this.rows.getActiveObject() as unknown as IObjectWithId).id
      ) {
        this.canvas.setActiveObject(obj);
      }
    }
    let objetTop: any = this.canvas.getActiveObject();
    objetTop._objects[0].width = height;
    objetTop._objects[1].angle += 90;
    objetTop.addWithUpdate();
    this.canvas.renderAll();
  }

  supprimerObjet() {
    for (let i = 0; i < this.canvas.getObjects().length; i++) {
      const obj: any = this.canvas.getObjects()[i];
      if (
        obj.id === (this.rows.getActiveObject() as unknown as IObjectWithId).id
      ) {
        this.canvas.setActiveObject(obj);
      }
    }
    this.canvas.remove(this.canvas.getActiveObject());
    this.rows.remove(this.rows.getActiveObject());
  }

  bringForward() {
    for (let i = 0; i < this.canvas.getObjects().length; i++) {
      const obj: any = this.canvas.getObjects()[i];
      if (
        obj.id === (this.rows.getActiveObject() as unknown as IObjectWithId).id
      ) {
        this.canvas.setActiveObject(obj);
      }
    }
    let objetTop = this.canvas.getActiveObject();
    this.canvas.bringToFront(objetTop);
    this.canvas.renderAll();
  }
  ajouterRect() {
    const rect1 = new fabric.Rect({
      width: 40,
      height: 40,
      fill: this.getRandomColor(),
      stroke: 'black',
      strokeWidth: 1,
      lockUniScaling: true,
      top: 0,
      left: 0,
      id: this.rows.getObjects().length,
    } as IRectWithId);
    const rect2 = new fabric.Rect({
      width: 40,
      height: 40,
      fill: this.getRandomColor(),
      stroke: 'black',
      strokeWidth: 1,
      lockUniScaling: true,
      top: 0,
      left: 0,
      id: this.rows.getObjects().length,
    } as IRectWithId);

    this.rows.add(rect1);
    this.canvas.add(rect2);
  }

  enregistrer() {
    let listeCanvasLignesEnregistreesStr = '';
    this.listeCanvasLignesEnregistrees.forEach((ligne) => {
      listeCanvasLignesEnregistreesStr += JSON.stringify(ligne) + "|"
    })
    listeCanvasLignesEnregistreesStr = listeCanvasLignesEnregistreesStr.slice(0, -1)
    this.servicePlanChargement
      .enregistrerPlanChargement(
        this.mission.id,
        this.canvasTopEnregistre,
        listeCanvasLignesEnregistreesStr
      )
      .subscribe((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Plan chargement enregistré',
          showConfirmButton: false,
          timer: 1500,
        });
      });
  }

  charger() {
    this.canvas.loadFromJSON(this.mission.canvasTop, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();
    });
    this.listeCanvasLignesEnregistrees = this.mission.canvasFace.split('|');
    this.rows.loadFromJSON(this.listeCanvasLignesEnregistrees[0], () => {
      // making sure to render canvas at the end
      this.rows.renderAll();
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

function findNewPos(distX: any, distY: any, target: any, obj: any) {
  // See whether to focus on X or Y axis
  if (Math.abs(distX) > Math.abs(distY)) {
    if (distX > 0) {
      target.left = obj.left - target.getScaledWidth();
    } else {
      target.left = obj.left + obj.getScaledWidth();
    }
  } else {
    if (distY > 0) {
      target.top = obj.top - target.getScaledHeight();
    } else {
      target.top = obj.top + obj.getScaledHeight();
    }
  }
}

interface IGroupWithId extends fabric.IGroupOptions {
  id: number;
}
interface IObjectWithId extends fabric.IObjectOptions {
  id: number;
}
interface IRectWithId extends fabric.IRectOptions {
  id: number;
}

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fabric } from 'fabric';
import Swal from 'sweetalert2';
import { PlanChargementService } from './services/plan-chargement.service';

@Component({
  selector: 'app-plan-chargement',
  templateUrl: './plan-chargement.component.html',
  styleUrls: ['./plan-chargement.component.scss'],
  // animation d'affichage du plan chargement
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
    trigger('statusNote', [
      state(
        'show',
        style({
          width: '300px',
          position: 'absolute',
          bottom: '85px',
          right: '100px',
          padding: '20px',
          zIndex: '999',
          opacity: '1',
        })
      ),
      state(
        'hide',
        style({
          width: '300px',
          position: 'absolute',
          bottom: '65px',
          right: '100px',
          padding: '20px',
          zIndex: '999',
          opacity: '0',
        })
      ),
      transition('show <=> hide', animate('200ms')),
    ]),
  ],
})
export class PlanChargementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('box') public box: ElementRef;
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
  }); //formGroup des filtres
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
  listeCommandesModeManuel: any = []; //liste des commandes qui contient l'info de chaque commande dans une mission (utilisé dans le mode manuel)
  commande: any;
  canvasTopEnregistre: any;
  commandeModeManuelSelectionne: any;

  lignes: any; //liste des lignes dans le vehicule (une ligne c'est l'ensemble des articles de guache vers la droite qu'on oeur les voir depuis la vue top)
  listeCanvasLignesEnregistrees: string[] = [];
  listeCanvasLignesEnregistreesStr: string;

  indexLigne = 0; //index d'une ligne dans la liste des lignes
  indexLignePrecedent = 0;

  // utilisée pour afficher le div vehicule
  vehiculeEstAffiche = false;
  root: { x: number; y: number; largeur: number; hauteur: number }; //le root represente le rectangle que
  canvas: fabric.Canvas;
  rows: any;

  mouse: any; //variable contient coordonnée du curseur
  width = 250; //width du panneau ajout manuel
  height: any; //width du panneau ajout manuel
  status: any; //status de l'evenement de changement taille panneau ajout des colis manuellement (RESIZETOP, RESIZERIGHT)
  planChargementChange = false; //tester si le plan de chargement est modifié depuis le dernier enregistrement

  missionEstEnAttente = false; //tester si l'etat de la mission selectionnée est "En attente"

  note: string;
  noteEstAffiche = false;

  enregistrementEnCours = false;

  //pour les droits d'accées
  nom: string;
  acces: string;
  tms: Number;
  // listener sur la position du souris
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = {
      x: event.clientX,
      y: event.clientY,
    };

    if (this.status === 'RESIZETOP' || this.status === 'RESIZERIGHT')
      this.resizePanneauAjoutManuel(this.status);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private servicePlanChargement: PlanChargementService,
    public datepipe: DatePipe
  ) {
    sessionStorage.setItem('Utilisateur', '' + "tms2");
    sessionStorage.setItem('Acces', "1004000");

    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.tms = Number( arrayOfDigits[3])
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
    this.planChargementChange = false
    this.mission = mission;
    this.mission.etat === 'En attente'
      ? (this.missionEstEnAttente = true)
      : (this.missionEstEnAttente = false);
    this.initialiserCanva();
  }

  getRandomColor() {
    //pour les couleurs des articles de chaque client
    var randomColor = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, '0');
    return '#' + randomColor;
  }

  // créer canva vide si il n'ya aucun plan chargement enregistrée sinon on charge le plan enregistrée
  initialiserCanva() {
    this.listeCommandes = []; //reinitialiser la liste des commandes
    this.listeCommandesModeManuel = []; //reinitialiser la liste des commandes
    this.lignes = []; //reinitialiser la liste des lignes
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
          // commandeManuel est une copie du commande pour qu'on peut modifier le nombre des articles restant dans la commandeManuel sans le modifier dans l'objet original commande
          const commandeManuel = Object.assign({}, this.commande);
          let listeColisManuel: any = [];
          listeColis.forEach((colis: any) => {
            listeColisManuel.push(Object.assign({}, colis));
          });
          //recupérer la liste des article pour chaque commande
          this.commande.articles = listeColis.filter(
            (colis: any) => colis.idCommande == idCommandes[i]
          );
          commandeManuel.articles = listeColisManuel.filter(
            (colis: any) => colis.idCommande == idCommandes[i]
          );
          // donner un couleur pour chaque commande
          //le couleur va être utiliser pour identifier les articles de chaque commande
          let couleur = this.getRandomColor();
          this.commande.couleur = couleur;
          commandeManuel.couleur = couleur;
          this.listeCommandes.push(this.commande);
          this.listeCommandesModeManuel.push(commandeManuel);
        }
        this.listeCommandesModeManuel.forEach((cmd: any) => {
          cmd.articles.forEach((article: any) => {
            //pour chaque article on identifie ses dimensions
            let dimensions = article.dimensions.split('x');
            let longueur = Number(dimensions[0]) * 2.7;
            let largeur = Number(dimensions[1]) * 2.7;
            let hauteur = Number(dimensions[2]) * 2.7;
            // on enregistre ces dimensions dans l'objet article
            article.longueur = longueur;
            article.largeur = largeur;
            article.hauteur = hauteur;
          });
        });

        let container = document.getElementById('container'); //recuperer le div container qui va contenir notre canva
        // on teste si c'est une mission avec vehicule privé
        console.log(this.mission.typeVehicule);
        if (this.mission.typeVehicule === 'prive') {
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
              // si etat mission = "En attente" on crée un canvas dynamique si non on crée un canvas statique
              if (this.missionEstEnAttente && this.tms >= 2) {
                this.rows = new fabric.Canvas('row', {
                  //creation de l'objet canva dynamique du vueLigne a l'aide du biblio fabric js
                  width: this.vehicule.largeur * 2.7,
                  height: this.vehicule.hauteur * 2.7,
                  selection: false,
                });
              } else {
                this.rows = new fabric.StaticCanvas('row', {
                  //creation de l'objet canva statique du vueLigne a l'aide du biblio fabric js
                  width: this.vehicule.largeur * 2.7,
                  height: this.vehicule.hauteur * 2.7,
                  selection: false,
                });
              }
              this.height = this.vehicule.hauteur * 2.7; //initialiser le height du panneau d'ajout colis manuellement
              //on affecte les variable globals dans des variables local pour qu'on peut les utiliser dans le listener du fabric
              let snap = 2; //Pixels a accrocher
              let canvasWidth = this.vehicule.largeur * 2.7;
              let canvasHeight = this.vehicule.hauteur * 2.7;
              let rows = this.rows;
              let canvas = this.canvas;
              this.rows.on('object:moving', function (options: any) {
                // Définir les coordonnées de la position du coin en fonction de l'angle, de la largeur et de la hauteur actuels
                options.target.setCoords();

                // Ne laissez pas les objets hors du canvas
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

                // Boucle à travers les objets
                rows.forEachObject(function (obj: any) {
                  if (obj === options.target) return;

                  // Si des objets se croisent
                  if (
                    options.target.isContainedWithinObject(obj) ||
                    options.target.intersectsWithObject(obj) ||
                    obj.isContainedWithinObject(options.target)
                  ) {
                    var distX =
                      (obj.left + obj.getScaledWidth()) / 2 -
                      (options.target.left + options.target.getScaledWidth()) /
                        2;
                    var distY =
                      (obj.top + obj.getScaledHeight()) / 2 -
                      (options.target.top + options.target.getScaledHeight()) /
                        2;

                    // Définir une nouvelle position
                    findNewPos(distX, distY, options.target, obj);
                  }

                  // Accrocher les objets les uns aux autres horizontalement

                  // Si les points inférieurs sont sur le même axe Y
                  if (
                    Math.abs(
                      options.target.top +
                        options.target.getScaledHeight() -
                        (obj.top + obj.getScaledHeight())
                    ) < snap
                  ) {
                    // Aligner la cible BL sur l'objet BR
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

                    // Aligner la cible BR sur l'objet BL
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

                  // Si les points supérieurs sont sur le même axe Y
                  if (Math.abs(options.target.top - obj.top) < snap) {
                    // Accrocher la cible TL à l'objet TR
                    if (
                      Math.abs(
                        options.target.left - (obj.left + obj.getScaledWidth())
                      ) < snap
                    ) {
                      options.target.left = obj.left + obj.getScaledWidth();
                      options.target.top = obj.top;
                    }

                    // Accrocher la cible TR à l'objet TL
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

                  // Accrochez les objets les uns aux autres verticalement

                  // Si les points droits sont sur le même axe X
                  if (
                    Math.abs(
                      options.target.left +
                        options.target.getScaledWidth() -
                        (obj.left + obj.getScaledWidth())
                    ) < snap
                  ) {
                    // Aligner la cible TR sur l'objet BR
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

                    // Aligner la cible BR sur l'objet TR
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

                  // Si les points de gauche sont sur le même axe X
                  if (Math.abs(options.target.left - obj.left) < snap) {
                    // Accrocher la cible TL sur l'objet BL
                    if (
                      Math.abs(
                        options.target.top - (obj.top + obj.getScaledHeight())
                      ) < snap
                    ) {
                      options.target.left = obj.left;
                      options.target.top = obj.top + obj.getScaledHeight();
                    }

                    // Accrocher la cible BL à l'objet TL
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

                // Si les objets se chevauchent encore

                var outerAreaLeft: any = null,
                  outerAreaTop: any = null,
                  outerAreaRight: any = null,
                  outerAreaBottom: any = null;

                rows.forEachObject(function (obj: any) {
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
                      targetRight =
                        targetLeft + options.target.getScaledWidth(),
                      targetTop = options.target.top,
                      targetBottom =
                        targetTop + options.target.getScaledHeight(),
                      objectLeft = obj.left,
                      objectRight = objectLeft + obj.getScaledWidth(),
                      objectTop = obj.top,
                      objectBottom = objectTop + obj.getScaledHeight();

                    // Rechercher des informations d'intersection pour l'axe X
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

                    // Rechercher des informations d'intersection pour l'axe Y
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

                    // Trouver la taille d'intersection (ce sera 0 si les objets se touchent mais ne se chevauchent pas)
                    if (intersectWidth > 0 && intersectHeight > 0) {
                      intersectSize = intersectWidth * intersectHeight;
                    }

                    // Définir la zone de capture externe
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

                    // Si des objets se croisent, repositionnez en dehors de toutes les formes qui se touchent
                    if (intersectSize) {
                      var distX =
                        outerAreaRight / 2 -
                        (options.target.left +
                          options.target.getScaledWidth()) /
                          2;
                      var distY =
                        outerAreaBottom / 2 -
                        (options.target.top +
                          options.target.getScaledHeight()) /
                          2;

                      // Définir une nouvelle position
                      findNewPos(distX, distY, options.target, obj);
                    }
                  }
                });
                // selectionner l'objet du canvas top a l'aide de son id
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
                // changer la valeur du left de l'objet en canvas top pour correspondre a la nouvelle valeur du left dans canvas face quand on deplace l'objet
                canvasObject.left = options.target.left;

                // quand on change la position d'un objet vers le top on l'avance dans le canvas top
                let listeObjTrie = rows
                  .getObjects()
                  .sort((a: any, b: any) => (a.top > b.top ? -1 : 1));
                let objCanvas = canvas.getObjects();
                for (let j = 0; j < listeObjTrie.length; j++) {
                  const objTrie: any = listeObjTrie[j];
                  for (let i = 0; i < objCanvas.length; i++) {
                    const obj: any = objCanvas[i];
                    if (obj.id === objTrie.id) {
                      canvas.setActiveObject(obj);
                    }
                  }
                  let canvasObject = canvas.getActiveObject();
                  canvas.bringToFront(canvasObject);
                }

                // on refraiche le canvas pour afficher les modifications
                canvasObject.setCoords();
                canvas.discardActiveObject().renderAll();
              });
              if (this.mission.canvasTop && this.mission.canvasFace)
                this.charger();
            });
        } else {
          // recupérer les données de notre vehicule privée par son matricule
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
              if (this.missionEstEnAttente && this.tms >= 2) {
                this.rows = new fabric.Canvas('row', {
                  //creation de l'objet canva dynamique du vueLigne a l'aide du biblio fabric js
                  width: this.vehicule.largeur * 2.7,
                  height: this.vehicule.hauteur * 2.7,
                  selection: false,
                });
              } else {
                this.rows = new fabric.StaticCanvas('row', {
                  //creation de l'objet canva statique du vueLigne a l'aide du biblio fabric js
                  width: this.vehicule.largeur * 2.7,
                  height: this.vehicule.hauteur * 2.7,
                  selection: false,
                });
              }
              this.height = this.vehicule.hauteur * 2.7;
              let snap = 2; //Pixels a accrocher
              let canvasWidth = this.vehicule.largeur * 2.7;
              let canvasHeight = this.vehicule.hauteur * 2.7;
              let rows = this.rows;
              let canvas = this.canvas;
              this.rows.on('object:moving', function (options: any) {
                // Définir les coordonnées de la position du coin en fonction de l'angle, de la largeur et de la hauteur actuels
                options.target.setCoords();

                // Ne laissez pas les objets hors du canvas
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

                // Boucle à travers les objets
                rows.forEachObject(function (obj: any) {
                  if (obj === options.target) return;

                  // Si des objets se croisent
                  if (
                    options.target.isContainedWithinObject(obj) ||
                    options.target.intersectsWithObject(obj) ||
                    obj.isContainedWithinObject(options.target)
                  ) {
                    var distX =
                      (obj.left + obj.getScaledWidth()) / 2 -
                      (options.target.left + options.target.getScaledWidth()) /
                        2;
                    var distY =
                      (obj.top + obj.getScaledHeight()) / 2 -
                      (options.target.top + options.target.getScaledHeight()) /
                        2;

                    // Définir une nouvelle position
                    findNewPos(distX, distY, options.target, obj);
                  }

                  // Accrocher les objets les uns aux autres horizontalement

                  // Si les points inférieurs sont sur le même axe Y
                  if (
                    Math.abs(
                      options.target.top +
                        options.target.getScaledHeight() -
                        (obj.top + obj.getScaledHeight())
                    ) < snap
                  ) {
                    // Aligner la cible BL sur l'objet BR
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

                    // Aligner la cible BR sur l'objet BL
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

                  // Si les points supérieurs sont sur le même axe Y
                  if (Math.abs(options.target.top - obj.top) < snap) {
                    // Accrocher la cible TL à l'objet TR
                    if (
                      Math.abs(
                        options.target.left - (obj.left + obj.getScaledWidth())
                      ) < snap
                    ) {
                      options.target.left = obj.left + obj.getScaledWidth();
                      options.target.top = obj.top;
                    }

                    // Accrocher la cible TR à l'objet TL
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

                  // Accrochez les objets les uns aux autres verticalement

                  // Si les points droits sont sur le même axe X
                  if (
                    Math.abs(
                      options.target.left +
                        options.target.getScaledWidth() -
                        (obj.left + obj.getScaledWidth())
                    ) < snap
                  ) {
                    // Aligner la cible TR sur l'objet BR
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

                    // Aligner la cible BR sur l'objet TR
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

                  // Si les points de gauche sont sur le même axe X
                  if (Math.abs(options.target.left - obj.left) < snap) {
                    // Accrocher la cible TL sur l'objet BL
                    if (
                      Math.abs(
                        options.target.top - (obj.top + obj.getScaledHeight())
                      ) < snap
                    ) {
                      options.target.left = obj.left;
                      options.target.top = obj.top + obj.getScaledHeight();
                    }

                    // Accrocher la cible BL à l'objet TL
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

                // Si les objets se chevauchent encore

                var outerAreaLeft: any = null,
                  outerAreaTop: any = null,
                  outerAreaRight: any = null,
                  outerAreaBottom: any = null;

                rows.forEachObject(function (obj: any) {
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
                      targetRight =
                        targetLeft + options.target.getScaledWidth(),
                      targetTop = options.target.top,
                      targetBottom =
                        targetTop + options.target.getScaledHeight(),
                      objectLeft = obj.left,
                      objectRight = objectLeft + obj.getScaledWidth(),
                      objectTop = obj.top,
                      objectBottom = objectTop + obj.getScaledHeight();

                    // Rechercher des informations d'intersection pour l'axe X
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

                    // Rechercher des informations d'intersection pour l'axe Y
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

                    // Trouver la taille d'intersection (ce sera 0 si les objets se touchent mais ne se chevauchent pas)
                    if (intersectWidth > 0 && intersectHeight > 0) {
                      intersectSize = intersectWidth * intersectHeight;
                    }

                    // Définir la zone de capture externe
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

                    // Si des objets se croisent, repositionnez en dehors de toutes les formes qui se touchent
                    if (intersectSize) {
                      var distX =
                        outerAreaRight / 2 -
                        (options.target.left +
                          options.target.getScaledWidth()) /
                          2;
                      var distY =
                        outerAreaBottom / 2 -
                        (options.target.top +
                          options.target.getScaledHeight()) /
                          2;

                      // Définir une nouvelle position
                      findNewPos(distX, distY, options.target, obj);
                    }
                  }
                });
                // selectionner l'objet du canvas top a l'aide de son id
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
                // changer la valeur du left de l'objet en canvas top pour correspondre a la nouvelle valeur du left dans canvas face quand on deplace l'objet
                canvasObject.left = options.target.left;

                // quand on change la position d'un objet vers le top on l'avance dans le canvas top
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

                // on refraiche le canvas pour afficher les modifications
                canvasObject.setCoords();
                canvas.discardActiveObject().renderAll();
              });
              if (this.mission.canvasTop && this.mission.canvasFace)
                this.charger();
            });
        }

        // affichage du plan chargement
        // si c'est la premiere fois qu'on affiche le plan chargement on met un délai pour eviter le probleme que le plan chargement s'affiche avant l'initialisation du canvas
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
      });
  }

  // créer plan chargement mode automatique
  createPlanChargementAuto() {
    this.planChargementChange = true;
    this.lignes = [];
    this.indexLigne = 0;
    this.indexLignePrecedent = 0;
    this.note = "";
    // liste des ligne qui contient chaque ligne comme objet
    // la liste est initialisé avec une seule ligne qui a longueur de 0 et comme largeur le largeur du vehicule converti en pixels et comme longueur la longuer du vehicule en pixels
    let lignes: any = [
      {
        longueur: 0,
        largeur: this.vehicule.largeur * 2.7,
        hauteur: this.vehicule.hauteur * 2.7,
        objects: [],
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
    let longueurCharge = 0;
    // ce bloc permet de place chaque colis dans la bonne position dans une ligne
    // tant que la liste des colis n'est pas vide cette boucle s'execute
    let colisLength = 0;
    while (colis.length !== colisLength) {
      colisLength = colis.length;
      // si la ligne avec cet indice n'existe pas on ajoute une nouvelle ligne
      if (!lignes[i]) {
        lignes.push({
          longueur: 0,
          largeur: this.vehicule.largeur * 2.7,
          hauteur: this.vehicule.hauteur * 2.7,
          objects: [],
        });
      }
      // on initialise le root
      this.initialiserRoot(lignes[i].largeur, lignes[i].hauteur);
      // on place les colis dans leurs places
      this.fit(colis, lignes[i], longueurCharge);
      let longueurLigne = 0;
      // pour chaque colis affectée dans une ligne en supprime se colis de la liste des colis non affectées
      lignes[i].objects.forEach((article: any) => {
        let commandeManuel = this.listeCommandesModeManuel.filter((cmd: any) => cmd.id == article.idCommande)[0]
        let articleManuel = commandeManuel.articles.filter((art: any) => art.id === article.id)[0];
        articleManuel.nombrePack -=1;
        let index = colis.findIndex((coli: any) => coli.id === article.id);
        colis.splice(index, 1);
        if (article.longueur > longueurLigne ) {
          longueurLigne = article.longueur;
        }
      });
      longueurCharge += longueurLigne;
      i++;
    }
    this.lignes = lignes;
    // index ligne a afficher
    this.indexLigne = 0;

    // création des canvas a afficher
    this.listeCanvasLignesEnregistrees = [];
    for (let j = 0; j < this.lignes.length; j++) {
      let nombreArticleDansLignesPrecedentes = 0;
      let rowAEnregistrer = new fabric.Canvas('', {
        //creation de canva du vueLigne a l'aide du biblio fabric js
        width: this.vehicule.largeur * 2.7,
        height: this.vehicule.hauteur * 2.7,
        selection: false,
      });
      for (let i = 0; i < j; i++) {
        nombreArticleDansLignesPrecedentes += this.lignes[i].objects.length;
      }
      let idArticle = nombreArticleDansLignesPrecedentes;
      this.lignes[j].objects.forEach((article: any) => {
        // creation des rectangles qui represente des articles
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
        // nom de l'article
        var text = new fabric.Text(article.emballage, {
          fontSize: 10,
          originX: 'center',
          originY: 'center',
        });
        // on groupe les rectangles et les noms
        var group = new fabric.Group([rect, text], {
          top: this.vehicule.hauteur * 2.7 - article.hauteur - article.fit.y,
          left: article.fit.x,
          id: idArticle,
          idCommande: article.idCommande,
          centeredRotation: true,
          idArticle: article.id,
          borderColor: 'red',
        } as IGroupWithId);
        // on elimine les controlles qui permet le redimentionnement et la rotation des objet
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

      // pour chaque ligne on enregistre son canvas
      this.listeCanvasLignesEnregistrees.push(
        rowAEnregistrer.toJSON([
          'id',
          '_controlsVisibility',
          'idCommande',
          'idArticle',
          'borderColor',
        ])
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
      ligne.objects.forEach((article: any) => {
        if (longueur < article.longueur) {
          longueur = article.longueur;
        }
        const rect = new fabric.Rect({
          originX: 'center',
          originY: 'center',
          width: article.largeur - 1,
          height: article.longueur - 1,
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
          idCommande: article.idCommande,
          idArticle: article.id,
          borderColor: 'red',
        } as IGroupWithId);
        // on elimine les controlles qui permet le redimentionnement et la rotation des objet
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

    // on enregistre le canvas top réalisée automatiquement pour  l'afficher
    this.canvasTopEnregistre = JSON.stringify(
      topAEnregistrer.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ])
    );

    this.afficherPlanChargement();
    // console.log(this.listeCommandesModeManuel);
    // this.listeCommandesModeManuel.forEach((cmd: any) => {
    //   // pour chaque article dans liste commande manuel on met le nombre pack a 0
    //   cmd.articles.forEach((article: any) => {
    //     article.nombrePack = 0;
    //   });
    // });
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

    // afficher le div qui contient les canvas
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

  // fonction pour afficher la ligne selectionnée
  changerLigne() {
    // enregistrer la ligne avant de passer a la ligne suivante
    this.listeCanvasLignesEnregistrees[this.indexLignePrecedent] =
      this.rows.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ]);

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

  // fonction pour faire le scroll vers le bas
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
  // etat du div qui contient liste des colis dans voiture "show" pour afficher, "hide" pour cacher
  get statusNote() {
    return this.noteEstAffiche ? 'show' : 'hide';
  }

  // changer ordre liste commande lors du drag and drop du legend
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
    await this.servicePlanChargement
      .modifierIdCommandesDansMission(this.mission.id, idCommandes)
      .toPromise();
    this.createPlanChargementAuto();
  }

  // initialiser les racines de l'algorithme qui va placer les articles automatiquement
  initialiserRoot(largeur: number, hauteur: number) {
    this.root = { x: 0, y: 0, largeur: largeur, hauteur: hauteur };
  }

  // fonction qui met les articles dans leurs positions
  fit(blocks: any, ligne: any, longueurCharge: number) {
    var n, node, block;
    for (n = 0; n < blocks.length; n++) {
      block = blocks[n];
      let nouveauLongueurCharge = block.longueur + longueurCharge;
      if (nouveauLongueurCharge < (this.vehicule.longueur * 2.7)) {
        if (
          ((node = this.chercherNoeud(this.root, block.largeur, block.hauteur)))
        ) {
          block.fit = this.diviserNoeud(node, block.largeur, block.hauteur);
          ligne.objects.push(block);
        }
        
      }
    }
  }

  // chercher les noeuds vides
  chercherNoeud(root: any, largeur: number, hauteur: number): any {
    if (root.used)
      return (
        this.chercherNoeud(root.right, largeur, hauteur) ||
        this.chercherNoeud(root.down, largeur, hauteur)
      );
    else if (largeur <= root.largeur && hauteur <= root.hauteur) return root;
    else return null;
  }

  // diviser le noeuds aprés le placement de l'article
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

  // rotation selon l'angle donnée
  rotation(angle: number) {
    this.planChargementChange = true;
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
    objetTop._objects[1].angle += angle;
    objetTop.addWithUpdate();
    this.canvas.renderAll();
  }

  // enregistrer les canvas dans la base des données
  async enregistrer() {
    if (this.enregistrementEnCours) return;
    this.enregistrementEnCours = true;
    let toutesLesArticlesSontAffectees = true;
    this.listeCommandesModeManuel.forEach((commande: any) => {
      commande.articles.forEach((article: any) => {
        if (article.nombrePack !== 0) toutesLesArticlesSontAffectees = false;
      });
    });
    if (!toutesLesArticlesSontAffectees) {
      // Swal.fire({
      //   icon: 'error',
      //   title: "Il y'a des colis non affecter",
      //   text: "S'il vous plait verifier que tout les colis sont placés dans le vehicule!",
      // });
      Swal.fire({
        icon: 'error',
        title: "Il y'a des colis non affecter",
        text: "S'il vous plait verifier que tout les colis sont placés dans le vehicule ou bien laisser une note!",
        input: 'text',
        inputAttributes: {
          autocapitalize: 'on',
        },
        showCancelButton: true,
        confirmButtonText: 'Enregistrer',
        showLoaderOnConfirm: true,
        preConfirm: (note) => {
          if (note === '') {
            Swal.showValidationMessage(`Le champ du note est vide!`);
          }
          return;
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.lignes[this.lignes.length - 1].objects.length === 0) {
            this.supprimerLigne();
          }
          this.canvasTopEnregistre = JSON.stringify(
            this.canvas.toJSON([
              'id',
              '_controlsVisibility',
              'idCommande',
              'idArticle',
              'borderColor',
            ])
          );
          this.listeCanvasLignesEnregistrees[this.indexLigne] =
            this.rows.toJSON([
              'id',
              '_controlsVisibility',
              'idCommande',
              'idArticle',
              'borderColor',
            ]);
          let listeCanvasLignesEnregistreesStr = '';
          this.listeCanvasLignesEnregistrees.forEach((ligne) => {
            listeCanvasLignesEnregistreesStr += JSON.stringify(ligne) + '|';
          });
          listeCanvasLignesEnregistreesStr =
            listeCanvasLignesEnregistreesStr.slice(0, -1);
          this.mission.canvasTop = this.canvasTopEnregistre;
          this.mission.canvasFace = listeCanvasLignesEnregistreesStr;
          let note: any = result.value;
          this.servicePlanChargement
            .enregistrerPlanChargement(
              this.mission.id,
              this.canvasTopEnregistre,
              listeCanvasLignesEnregistreesStr,
              note
            )
            .subscribe((res) => {
              Swal.fire({
                icon: 'success',
                title: 'Plan chargement enregistré',
                showConfirmButton: false,
                timer: 1500,
              });
            });
          this.planChargementChange = false;
        }
      });
      return;
    }

    if (this.lignes[this.lignes.length - 1].objects.length === 0) {
      this.supprimerLigne();
    }
    this.canvasTopEnregistre = JSON.stringify(
      this.canvas.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ])
    );
    this.listeCanvasLignesEnregistrees[this.indexLigne] = this.rows.toJSON([
      'id',
      '_controlsVisibility',
      'idCommande',
      'idArticle',
      'borderColor',
    ]);
    let listeCanvasLignesEnregistreesStr = '';
    this.listeCanvasLignesEnregistrees.forEach((ligne) => {
      listeCanvasLignesEnregistreesStr += JSON.stringify(ligne) + '|';
    });
    listeCanvasLignesEnregistreesStr = listeCanvasLignesEnregistreesStr.slice(
      0,
      -1
    );
    this.mission.canvasTop = this.canvasTopEnregistre;
    this.mission.canvasFace = listeCanvasLignesEnregistreesStr;
    await this.servicePlanChargement
      .enregistrerPlanChargement(
        this.mission.id,
        this.canvasTopEnregistre,
        listeCanvasLignesEnregistreesStr,
        ''
      )
      .toPromise();

    Swal.fire({
      icon: 'success',
      title: 'Plan chargement enregistré',
      showConfirmButton: false,
      timer: 1500,
    });

    this.planChargementChange = false;
    this.enregistrementEnCours = false;
  }

  // récupérer les canvas depuis la base des données et les afficher
  charger() {
    // se le plan chargement est modifié depuis le dernier enregistrement
    if (this.planChargementChange) {
      Swal.fire({
        title: 'Êtes vous sûr?',
        text: 'Vos modification ne sont pas enregistrées!\n tous vos modifications seront annulées',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          this.lignes = [];
          this.indexLigne = 0;
          this.indexLignePrecedent = 0;
          this.canvas.loadFromJSON(this.mission.canvasTop, () => {
            this.canvas.getObjects().forEach((obj: any) => {
              let couleur = this.listeCommandes.filter(
                (cmd: any) => cmd.id === Number(obj.idCommande)
              )[0].couleur;
              obj.item(0).set('fill', couleur);
            });
            // making sure to render canvas at the end
            this.canvas.renderAll();
          });
          this.listeCanvasLignesEnregistrees =
            this.mission.canvasFace.split('|');
          // chargement des canvas faces
          for (let i = 0; i < this.listeCanvasLignesEnregistrees.length; i++) {
            let row = new fabric.Canvas('', {
              //creation de l'objet canva du vueLigne a l'aide du biblio fabric js
              width: this.vehicule.largeur * 2.7,
              height: this.vehicule.hauteur * 2.7,
              selection: false,
            });
            row.loadFromJSON(this.listeCanvasLignesEnregistrees[i], () => {
              // making sure to render canvas at the end
              row.getObjects().forEach((obj: any) => {
                let couleur = this.listeCommandes.filter(
                  (cmd: any) => cmd.id === Number(obj.idCommande)
                )[0].couleur;
                obj.item(0).set('fill', couleur);
              });
              this.lignes.push({
                objects: row.getObjects(),
                longueur: 0,
                top: 4,
                largeur: 0,
              });
            });
            this.listeCanvasLignesEnregistrees[i] = row.toJSON([
              'id',
              '_controlsVisibility',
              'idCommande',
              'idArticle',
              'borderColor',
            ]);
            let canvasTopOjects = this.canvas.getObjects();
            for (let i = 0; i < this.lignes.length; i++) {
              this.lignes[i].objects.forEach((obj: any) => {
                let objet = canvasTopOjects.filter(
                  (ob: any) => ob.id === obj.id
                )[0];
                if (objet.height > this.lignes[i].longueur) {
                  this.lignes[i].longueur = objet.height-1;
                }
                if (i > 0) {
                  this.lignes[i].top =
                    this.lignes[i - 1].longueur + this.lignes[i - 1].top;
                }
                this.lignes[i].largeur = this.canvas.width;
              });
            }
          }
          //afficher la premiére ligne dans la vue face
          this.rows.loadFromJSON(this.listeCanvasLignesEnregistrees[0], () => {
            // making sure to render canvas at the end
            this.rows.renderAll();
          });
          this.listeCommandesModeManuel.forEach((cmd: any) => {
            // pour chaque article dans liste commande manuel on met le nombre pack a 0
            cmd.articles.forEach((article: any) => {
              article.nombrePack = 0;
            });
          });
          this.planChargementChange = false;
        }
      });
      return;
    }
    this.lignes = [];
    this.indexLigne = 0;
    this.indexLignePrecedent = 0;
    this.note = this.mission.note;
    // affichage du canvas top
    this.canvas.loadFromJSON(this.mission.canvasTop, () => {
      this.canvas.getObjects().forEach((obj: any) => {
        let couleur = this.listeCommandes.filter(
          (cmd: any) => cmd.id === Number(obj.idCommande)
        )[0].couleur;
        obj.item(0).set('fill', couleur);
      });
      // making sure to render canvas at the end
      this.canvas.renderAll();
    });
    this.listeCanvasLignesEnregistrees = this.mission.canvasFace.split('|');
    // charger les lignes du canvas faces enregistrées
    for (let i = 0; i < this.listeCanvasLignesEnregistrees.length; i++) {
      let row = new fabric.Canvas('', {
        //creation de l'objet canva du vueLigne a l'aide du biblio fabric js
        width: this.vehicule.largeur * 2.7,
        height: this.vehicule.hauteur * 2.7,
        selection: false,
      });
      row.loadFromJSON(this.listeCanvasLignesEnregistrees[i], () => {
        // making sure to render canvas at the end
        row.getObjects().forEach((obj: any) => {
          let couleur = this.listeCommandes.filter(
            (cmd: any) => cmd.id === Number(obj.idCommande)
          )[0].couleur;
          obj.item(0).set('fill', couleur);
        });
        this.lignes.push({
          objects: row.getObjects(),
          longueur: 0,
          top: 4,
          largeur: 0,
        });
      });
      this.listeCanvasLignesEnregistrees[i] = row.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ]);
      let canvasTopOjects = this.canvas.getObjects();
      for (let i = 0; i < this.lignes.length; i++) {
        this.lignes[i].objects.forEach((obj: any) => {
          let objet = canvasTopOjects.filter((ob: any) => ob.id === obj.id)[0];
          if (objet.height > this.lignes[i].longueur) {
            this.lignes[i].longueur = objet.height - 1;
          }
          if (i > 0) {
            this.lignes[i].top =
              this.lignes[i - 1].longueur + this.lignes[i - 1].top;
          }
          this.lignes[i].largeur = this.canvas.width;
        });
      }
    }
    //affichage premier ligne canvas face
    this.rows.loadFromJSON(this.listeCanvasLignesEnregistrees[0], () => {
      // making sure to render canvas at the end
      this.rows.renderAll();
    });
    this.listeCommandesModeManuel.forEach((cmd: any) => {
      // pour chaque article dans liste commande manuel on met le nombre pack a 0
      cmd.articles.forEach((article: any) => {
        article.nombrePack = 0;
      });
    });
    this.planChargementChange = false;

    // afficher le div qui contient le canvas si il n'est pas deja affiché et puis scroll vers le bas
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

  //supprimer les canvas et reinitialiser les des listes necessaires et reinitialiser le nombre des pack dans la liste des commandes manuel
  viderCanvas() {
    this.canvas.clear();
    this.rows.clear();
    this.indexLigne = 0;
    this.indexLignePrecedent = 0;
    this.lignes = [];
    this.note = ""
    this.lignes.push({
      objects: [],
      longueur: 0,
      top: 4,
      largeur: 0,
    });
    this.listeCanvasLignesEnregistrees = [];
    this.listeCanvasLignesEnregistrees.push(
      this.rows.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ])
    );
    this.listeCommandesModeManuel.forEach((cmd: any) => {
      // pour chaque article dans liste commande manuel on met le nombre pack a 0
      cmd.articles.forEach((article: any) => {
        article.nombrePack = 0;
      });
    });
    for (let i = 0; i < this.listeCommandesModeManuel.length; i++) {
      for (
        let j = 0;
        j < this.listeCommandesModeManuel[i].articles.length;
        j++
      ) {
        this.listeCommandesModeManuel[i].articles[j].nombrePack =
          this.listeCommandes[i].articles.filter((art: any) => art.id === this.listeCommandesModeManuel[i].articles[j].id)[0].nombrePack;
      }
    }
  }

  // ajouter un colis d'une maniére manuelle
  ajouterColisManuellement(colis: any) {
    // si nombre pack du colis <= 0 on n'execute pas cette fonction
    if (colis.nombrePack <= 0) return;
    colis.nombrePack -= 1;
    let id = this.canvas.getObjects().length;
    const rectFace = new fabric.Rect({
      originX: 'center',
      originY: 'center',
      width: colis.largeur - 1,
      height: colis.hauteur - 1,
      fill: this.commandeModeManuelSelectionne.couleur,
      stroke: 'black',
      strokeWidth: 1,
      lockUniScaling: true,
    });
    var text = new fabric.Text(colis.emballage, {
      fontSize: 10,
      originX: 'center',
      originY: 'center',
    });

    var groupFace = new fabric.Group([rectFace, text], {
      top: 0,
      left: 0,
      id: id,
      idCommande: colis.idCommande,
      centeredRotation: true,
      idArticle: colis.id,
      borderColor: 'red',
    } as IGroupWithId);
    groupFace.setControlsVisibility({
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

    // ajout du colis dans vue top
    const rectTop = new fabric.Rect({
      originX: 'center',
      originY: 'center',
      width: colis.largeur - 1,
      height: colis.longueur - 1,
      fill: this.commandeModeManuelSelectionne.couleur,
      stroke: 'black',
      strokeWidth: 1,
    });
    var text = new fabric.Text(colis.emballage, {
      fontSize: 10,
      originX: 'center',
      originY: 'center',
    });

    var groupTop = new fabric.Group([rectTop, text], {
      top: this.lignes[this.indexLigne].top,
      left: 0,
      id: id,
      idCommande: colis.idCommande,
      idArticle: colis.id,
      borderColor: 'red',
    } as IGroupWithId);
    groupTop.setControlsVisibility({
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

    this.rows.add(groupFace);
    this.canvas.add(groupTop);
    this.rows.setActiveObject(
      this.rows.getObjects()[this.rows.getObjects().length - 1]
    );

    this.lignes[this.indexLigne].objects = this.rows.getObjects();

    // changer langueuer du ligne selon le colis le plus long
    let canvasTopOjects = this.canvas.getObjects();
    this.lignes[this.indexLigne].objects.forEach((obj: any) => {
      let objet = canvasTopOjects.filter((ob: any) => ob.id === obj.id)[0];
      if (objet.height > this.lignes[this.indexLigne].longueur) {
        this.lignes[this.indexLigne].longueur = objet.height;
      }
      if (this.indexLigne > 0) {
        this.lignes[this.indexLigne].top =
          this.lignes[this.indexLigne - 1].longueur +
          this.lignes[this.indexLigne - 1].top;
      }
      this.lignes[this.indexLigne].largeur = this.canvas.width;
    });
  }

  // ajout d'une nouvelle ligne
  ajouterNouvelleLigne() {
    //si la gne precedante ne contient aucun objet on n'execute pas cette fonction
    if (this.lignes[this.lignes.length - 1].objects.length === 0) return;
    let top =
      this.lignes[this.lignes.length - 1].top +
      this.lignes[this.lignes.length - 1].longueur;
    this.lignes.push({
      objects: [],
      longueur: 100,
      top: top,
      largeur: this.canvas.width,
    });
    this.listeCanvasLignesEnregistrees[this.indexLignePrecedent] =
      this.rows.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ]);
    this.rows.clear();
    this.listeCanvasLignesEnregistrees.push(
      this.rows.toJSON([
        'id',
        '_controlsVisibility',
        'idCommande',
        'idArticle',
        'borderColor',
      ])
    );
    this.indexLigne = this.lignes.length - 1;
    let divLigne: any = document.getElementById('vueLigne');
    //afficher la nouvelle ligne (vide)
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

  //supprimer l'objet selectionné
  supprimerObjet() {
    for (let i = 0; i < this.canvas.getObjects().length; i++) {
      const obj: any = this.canvas.getObjects()[i];
      if (
        obj.id === (this.rows.getActiveObject() as unknown as IObjectWithId).id
      ) {
        this.canvas.setActiveObject(obj);
      }
    }
    let commande = this.listeCommandesModeManuel.filter(
      (cmd: any) =>
        cmd.id ===
        Number(
          (this.rows.getActiveObject() as unknown as IObjectWithId).idCommande
        )
    )[0];
    let article = commande.articles.filter(
      (article: any) =>
        article.id ===
        (this.rows.getActiveObject() as unknown as IObjectWithId).idArticle
    )[0];
    article.nombrePack++;
    this.canvas.remove(this.canvas.getActiveObject());
    this.rows.remove(this.rows.getActiveObject());
  }

  // supprimer le dernier ligne
  supprimerLigne() {
    this.indexLigne = this.lignes.length - 1;
    this.changerLigne();
    if (this.lignes[this.indexLigne].objects.length !== 0) {
      this.rows.getObjects().forEach((obj: any) => {
        this.rows.setActiveObject(obj);
        this.supprimerObjet();
      });
    }
    this.lignes.splice(this.indexLigne, 1);
    this.listeCanvasLignesEnregistrees.splice(this.indexLigne, 1);
    this.rows.clear();
    this.indexLigne = this.lignes.length - 1;
    this.rows.clear();
    this.rows.loadFromJSON(
      this.listeCanvasLignesEnregistrees[this.indexLigne],
      () => {
        // making sure to render canvas at the end
        this.rows.renderAll();
      }
    );
    this.indexLignePrecedent = this.indexLigne;
    if (this.lignes.length === 0) {
      this.lignes.push({
        objects: [],
        longueur: 0,
        top: 4,
        largeur: this.canvas.width,
      });
      this.indexLigne = 0;
      this.indexLignePrecedent = 0;
    }
  }

  //permet la modification du taille du panneau ajout manuel
  resizePanneauAjoutManuel(status: string) {
    const { left, bottom } = this.box.nativeElement.getBoundingClientRect();
    let boxPosition = { left, bottom };
    if (status === 'RESIZERIGHT') {
      this.width = Number(this.mouse.x > boxPosition.left)
        ? this.mouse.x - boxPosition.left
        : 0;
      if (this.width < 250) this.width = 250;
    } else if (status === 'RESIZETOP') {
      this.height = Number(this.mouse.y < boxPosition.bottom)
        ? boxPosition.bottom - this.mouse.y
        : 0;
      if (this.height < this.vehicule.hauteur * 2.7)
        this.height = this.vehicule.hauteur * 2.7;
    }
  }

  // set le type de modification taille panneau ajout manuel
  setStatus(event: MouseEvent, status: string) {
    if (status === 'RESIZETOP' || status === 'RESIZERIGHT')
      event.stopPropagation();
    this.status = status;
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

// fonction pour chercher nouvelle position de l'objet dans le canvas
// cette fonction est déclarée a l'exterieur du component pour qu'on peut l'appelée dans la fonction listener sur le deplacement de l'objet dans le canvas
function findNewPos(distX: any, distY: any, target: any, obj: any) {
  // Voir s'il faut se concentrer sur l'axe X ou Y
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

//redefinition des interfaces qui se trouvent dans fabric pour ajouter des nouveaux attributs
interface IGroupWithId extends fabric.IGroupOptions {
  id: number;
  idCommande: number;
  idArticle: number;
}
interface IObjectWithId extends fabric.IObjectOptions {
  id: number;
  idCommande: number;
  idArticle: number;
}
interface IRectWithId extends fabric.IRectOptions {
  id: number;
}

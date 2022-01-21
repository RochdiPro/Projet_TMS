import { Component, OnInit } from '@angular/core';
import { MissionsService } from '../parc-transport/missions/services/missions.service';
import { VehiculeService } from '../parc-transport/vehicule/services/vehicule.service';
import { fabric } from "fabric";

@Component({
  selector: 'app-plan-chargement',
  templateUrl: './plan-chargement.component.html',
  styleUrls: ['./plan-chargement.component.scss']
})
export class PlanChargementComponent implements OnInit {

  longueur_restant: any;
  largeur_restant: any;
  commande: any;
  top: any = 0;
  left: any = 0;
  longueur_commande_max: any = 0;
  numCouleur = 0;
  vehicule: any;
  mission: any;
  canvas: any;

  constructor(
    private serviceVehicule: VehiculeService,
    private serviceMission: MissionsService
  ) { }

  ngOnInit(): void {
  }

  getRandomColor() { //pour les couleurs des articles de chaque client
    var color: any = {
      1: "#e53935",
      2: "#3949AB",
      3: "#00897B",
      4: "#FDD835",
      5: "#546E7A",
      6: "#C2185B",
      7: "#1976D2",
      8: "#388E3C",
      9: "#FFA000",
      10: "#616161"
    };
    this.numCouleur++;
    if (this.numCouleur > 10) { this.numCouleur = 1; }
    return color[this.numCouleur];
  }

  selectionPlanChargement() { //realiser et dessiner le plan de chargement
    let container = document.getElementById("container"); //définition du conteneur du canvas
    this.serviceVehicule.vehicules().subscribe((res: any) => {
      this.vehicule = res.filter((x: any) => x.matricule == this.mission.matricule);
      let h: Number = this.vehicule[0].longueur * 2.7 + 270; //conversion du longueur du véhicule vers pixel avec mise en echelle
      container.style.height = h + "px"; //definission du hauteur du contenaire
      this.serviceMission.mission(this.mission.id).subscribe((res: any) => {
        let affectation = res;

        let canva: any = document.getElementById("canva");
        while (canva.firstChild) { //reinitialiser le canva avant de dessiner
          canva.removeChild(canva.firstChild);
        }
        let legend = document.getElementById("legend");
        while (legend.firstChild) { //reinitialiser le legend avant de dessiner
          legend.removeChild(legend.firstChild);
        }
        this.numCouleur = 0; //reinitialisation du numero de couleur
        var pos: any = [];
        var dest: any = [];
        var trajet = affectation.trajet;
        trajet = trajet.split("/");
        trajet = trajet.reverse();
        this.top = 0;
        this.left = 0;
        this.longueur_commande_max = 0;
        this.longueur_restant = this.vehicule[0].longueur * 2.7; //reinitialisation du longueur et largeur restants
        this.largeur_restant = this.vehicule[0].largeur * 2.7;
        let div = document.getElementById("canva");
        canva = document.createElement('canvas'); //creation du canva
        canva.id = "canvas";
        canva.style.zIndex = 8;
        canva.style.border = "4px solid";
        div.appendChild(canva);
        this.canvas = new fabric.StaticCanvas('canvas', { //definition du hauteur et largeur du canva
          width: this.vehicule[0].largeur * 2.7,
          height: this.vehicule[0].longueur * 2.7
        });
        this.serviceMission.commandes().subscribe((res: any) => {
          for (let i = 0; i < trajet.length-1; i++) {
            pos.push(trajet[i].split(":")[1]);
            dest.push(trajet[i].split(":")[0]);

            this.commande = res.filter((x: any) => x.idMission === affectation.id);
            this.commande = this.commande.filter((x: any) => x.positionDest === trajet[i].split(":")[1]);
            let articles = this.commande[0].articles.split(",");
            let couleur = this.getRandomColor();
            let legend = document.getElementById("legend"); //creation du legend
            let titre = document.createElement("div");
            titre.style.position = "relative";
            let carreau: any = document.createElement('div');
            carreau.style.height = "14px";
            carreau.style.width = "14px";
            carreau.style.background = couleur;
            carreau.style.margin = "5px 5px";
            let text = document.createElement("div");
            text.style.width = "100px"
            text.style.position = "absolute";
            text.style.top = "-3px";
            text.style.left = "26px";
            text.style.fontSize = "medium";
            text.innerHTML = trajet[i].split(":")[0];
            titre.appendChild(carreau);
            titre.appendChild(text);
            legend.appendChild(titre);
            articles.forEach((element: any) => { //placement des articles dans le canva
              let article = element.split("/")
              let dimensions = article[1].split(":")[1].split("x");
              let nbrArticles = article[0].split("x")[0];
              for (let j = 0; j < nbrArticles; j++) {
                this.largeur_restant -= Number(dimensions[1]) * 2.7;
                if (this.largeur_restant < 0) {
                  this.largeur_restant = (this.vehicule[0].largeur * 2.7 - Number(dimensions[1]) * 2.7);
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
                  strokeWidth: 1
                });
                this.canvas.add(rect);
                this.left += Number(dimensions[1]) * 2.7;
                if (Number(dimensions[0]) * 2.7 > this.longueur_commande_max) this.longueur_commande_max = Number(dimensions[0]) * 2.7;
              }

            });




          }
        });
      });
    });


  }
}

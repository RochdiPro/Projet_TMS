import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ColisageService } from 'src/app/colisage.service';
import { ParcTransportService } from 'src/app/parc-transport.service';

@Component({
  selector: 'app-ajout-mission',
  templateUrl: './ajout-mission.component.html',
  styleUrls: ['./ajout-mission.component.scss']
})
export class AjoutMissionComponent implements OnInit {

  regions: any = [
    { nom: "Nord-Est", ville: ["Bizerte", "Tunis", "Ariana", "Manouba", "Ben_Arous", "Zaghouan", "Nabeul"] },
    { nom: "Nord-Ouest", ville: ["Jendouba", "Beja", "Kef", "Siliana"] },
    { nom: "Centre-Est", ville: ["Sousse", "Monastir", "Mahdia"] },
    { nom: "Centre-Ouest", ville: ["Kairouan", "Kasserine", "Sidi_Bouzid"] },
    { nom: "Sud-Est", ville: ["Sfax", "Gabes", "Mednine", "Tataouine"] },
    { nom: "Sud-Ouest", ville: ["Gafsa", "Tozeur", "Kebili"] },
  ]
  commandesNonAffecteSelectionne: String[];
  listeFactures: any;
  listeBLs: any;
  client: any;
  listeCommandes: Object[] = [];
  listeClients: any = [];
  commandesNordEst: any;
  commandesNordOuest: any;
  commandesCentreEst: any;
  commandesCentreOuest: any;
  commandesSudEst: any;
  commandesSudOuest: any;
  facture: any;
  BL: any;
  xmldata: any;
  new_obj: any;
  articles: any = [];
  articlesBl: any = [];
  form = new FormGroup({ nombreVoyages: new FormControl(1), multiVehicule: new FormControl(false) });
  listeVehicules: any;
  listeVehiculesLoues: any;
  listeColisage: any;

  constructor(public fb: FormBuilder, public serviceColisage: ColisageService, public serviceTransport: ParcTransportService, public datepipe: DatePipe) { }

  async ngOnInit() {
    await this.getListeFactures();
    await this.getListeBLs();
    await this.getListeColisage();
    await this.preparerListeCommande();
    this.getCommandesNordEst();
    this.getCommandesNordOuest();
    this.getCommandesCentreEst();
    this.getCommandesCentreOuest();
    this.getCommandesSudEst();
    this.getCommandesSudOuest();
    this.getVehiculeDisponibles();
    this.getVehiculeLoueDisponibles();
  }

  async getListeFactures() {
    this.listeFactures = await this.serviceColisage.filtreFacture("etat", "Validée").toPromise();
  }

  async getListeBLs() {
    this.listeBLs = await this.serviceColisage.filtreBonLivraison("etat", "Validée").toPromise();
  }

  async getClient() {
    for (let i = 0; i < this.listeFactures.length; i++) {
      this.client = await this.serviceColisage.client(this.listeFactures[i].id_Clt).toPromise();
      this.listeClients.push(this.client);
    }
    for (let j = 0; j < this.listeBLs.length; j++) {
      this.client = await this.serviceColisage.client(this.listeBLs[j].id_Clt).toPromise();
      this.listeClients.push(this.client);
    }
  }

  async getVehiculeDisponibles() {
    this.listeVehicules = await this.serviceTransport.filtrerVehicule("etat_vehicule", "Disponible").toPromise();
  }

  async getVehiculeLoueDisponibles() {
    this.listeVehiculesLoues = await this.serviceTransport.filtrerVehiculeLoues("etat_vehicule", "Disponible").toPromise();
  }

  async preparerListeCommande() {
    await this.getClient();
    let i = 0;
    var region: String;
    for (let j = 0; j < this.listeFactures.length; j++) {
      var packsArray = [];
      var poidsCommande = 0;
      await this.getDetailFacture(this.listeFactures[j].id_Facture);
      for (const reg of this.regions) {
        if (reg.ville.includes(this.listeClients[i].ville)) {
          region = reg.nom;
        }
      }
      //stopped here ---------------------------------------
      for (let k = 0; k < this.articles.length; k++) {
        var qteArticleRestante = this.articles[k].qte[0];
        var differenceQte = 0;
        var packConvenable: any;
        var listePacks = await this.listeColisage.filter((pack: any) => pack.idProduit === this.articles[k].id[0]);
        if (listePacks.length > 0) {
          differenceQte = qteArticleRestante - listePacks[0].qte;
          do {
            packConvenable = listePacks[0];
            for (const pack of listePacks) {
              if ((qteArticleRestante - pack.qte) < differenceQte) {
                differenceQte = qteArticleRestante - pack.qte;
                packConvenable = pack;
              }
            }
            qteArticleRestante = qteArticleRestante - packConvenable.qte
            packsArray.push(packConvenable);
          } while (qteArticleRestante > 0);
          for (let index = 0; index < packsArray.length; index++) {
            poidsCommande += packsArray[index].poids_emballage_total;
          }
        }
      }
      var commande = {
        id: i,
        id_Facture: this.listeFactures[j].id_Facture,
        id_Clt: this.listeClients[i].id_Clt,
        nom_Clt: this.listeClients[i].nom_Client,
        region: region,
        ville: this.listeClients[i].ville,
        date_Creation: this.listeFactures[j].date_Creation,
        type: "Facture",
        poids: poidsCommande
      };
      this.listeCommandes.push(commande);
      i++;
    }
    for (let j = 0; j < this.listeBLs.length; j++) {
      var packsArray = [];
      var poidsCommande = 0;
      await this.getDetailBL(this.listeBLs[j].id_Bl)
      for (const reg of this.regions) {
        if (reg.ville.includes(this.listeClients[i].ville)) {
          region = reg.nom;
        }
      }
      //stopped here ---------------------------------------
      for (let k = 0; k < this.articlesBl.length; k++) {
        var qteArticleRestante = this.articlesBl[k].qte[0];
        var differenceQte = 0;
        var packConvenable: any;
        var listePacks = await this.listeColisage.filter((pack: any) => pack.idProduit === this.articlesBl[k].id[0]);
        listePacks = await listePacks.filter((pack: any) => this.articlesBl[k].qte[0] >= Number(pack.qte));
        console.log(listePacks)
        if (listePacks.length > 0) {
          differenceQte = qteArticleRestante - listePacks[0].qte;
          do {
            packConvenable = listePacks[0];
            for (const pack of listePacks) {
              if ((qteArticleRestante - pack.qte) < differenceQte) {
                differenceQte = qteArticleRestante - pack.qte;
                packConvenable = pack;
              }
            }

            console.log(this.listeBLs[j].id_Bl)
            console.log(qteArticleRestante)
            console.log(packConvenable)
            qteArticleRestante = qteArticleRestante - packConvenable.qte
            packsArray.push(packConvenable);
          } while (qteArticleRestante > 0);
          for (let index = 0; index < packsArray.length; index++) {
            poidsCommande += packsArray[index].poids_emballage_total;
          }
          poidsCommande = Number(poidsCommande.toFixed(3))
        }

      }
      var commandebl = {
        id: i,
        id_BL: this.listeBLs[j].id_Bl,
        id_Clt: this.listeClients[i].id_Clt,
        nom_Clt: this.listeClients[i].nom_Client,
        region: region,
        ville: this.listeClients[i].ville,
        date_Creation: this.listeBLs[j].date_Creation,
        type: "BL",
        poids: poidsCommande
      };
      this.listeCommandes.push(commandebl);
      i++;

    }
    this.listeCommandes = this.listeCommandes.filter((commande: any) => commande.poids > 0)
  }

  getCommandesNordEst() {
    this.commandesNordEst = this.listeCommandes.filter((commande: any) => commande.region === "Nord-Est");
  }
  getCommandesNordOuest() {
    this.commandesNordOuest = this.listeCommandes.filter((commande: any) => commande.region === "Nord-Ouest");
  }
  getCommandesCentreEst() {
    this.commandesCentreEst = this.listeCommandes.filter((commande: any) => commande.region === "Centre-Est");
  }
  getCommandesCentreOuest() {
    this.commandesCentreOuest = this.listeCommandes.filter((commande: any) => commande.region === "Centre-Ouest");
  }
  getCommandesSudEst() {
    this.commandesSudEst = this.listeCommandes.filter((commande: any) => commande.region === "Sud-Est");
  }
  getCommandesSudOuest() {
    this.commandesSudOuest = this.listeCommandes.filter((commande: any) => commande.region === "Sud-Ouest");
  }
  async getListeColisage() {
    this.listeColisage = await this.serviceColisage.listeColisage().toPromise();
  }
  async getDetailFacture(id: any) { //pour avoir les ids et les qtes des produits dans une facture
    var detail = await this.serviceColisage.Detail_Facture(id).toPromise();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {

          this.articles = [];
          this.facture = reader.result;
          var parseString = require('xml2js').parseString;
          let data1;
          parseString(atob(this.facture.substr(28)), function (err: any, result: any) {
            data1 = result.Facture;

          })
          this.xmldata = data1
          if (this.xmldata.Produits[0].Produits_Simples[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_Simples[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_Simples[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte;

              this.articles.push(this.new_obj)
            }
          }
          if (this.xmldata.Produits[0].Produits_Series[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_Series[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_Series[0].Produit[i].Qte;

              this.articles.push(this.new_obj)
            }
          }
          if (this.xmldata.Produits[0].Produits_4Gs[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte;

              this.articles.push(this.new_obj)
            }
          }
          resolve(this.articles)
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(detail);
    });
  }
  async getDetailBL(id: any) {  //pour avoir les ids et les qtes des produits dans un bon livraison
    var detail = await this.serviceColisage.Detail_BL(id).toPromise();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          this.articlesBl = [];
          this.BL = reader.result;
          var parseString = require('xml2js').parseString;
          let data1;
          parseString(atob(this.BL.substr(28)), function (err: any, result: any) {
            data1 = result.Bon_Livraison;

          })
          this.xmldata = data1
          if (this.xmldata.Produits[0].Produits_Simples[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_Simples[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_Simples[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_Simples[0].Produit[i].Qte;

              this.articlesBl.push(this.new_obj)
            }
          }
          if (this.xmldata.Produits[0].Produits_Series[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_Series[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_Series[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_Series[0].Produit[i].Qte;

              this.articlesBl.push(this.new_obj)
            }
          }
          if (this.xmldata.Produits[0].Produits_4Gs[0].Produit) {
            for (let i = 0; i < this.xmldata.Produits[0].Produits_4Gs[0].Produit.length; i++) {

              this.new_obj = {}
              this.new_obj.id = this.xmldata.Produits[0].Produits_4Gs[0].Produit[i].Id;
              this.new_obj.qte = this.xmldata.Produits[0].Produits_4Gs[0].Produit[i].Qte;

              this.articlesBl.push(this.new_obj)
            }
          }
          resolve(this.articlesBl)
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(detail);
    }
    )
  }


}

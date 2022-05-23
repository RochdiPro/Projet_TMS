import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  kmactuelConsommationValidator,
  kmactuelValidator,
} from '../kmactuel.validator';
import { VehiculeService } from '../services/vehicule.service';

//********************************************boite de dialogue detail vehicule **************************************
/**
 * Boite dialogue permet d'afficher les informations d'un vehicule
 * Liste des fonctions:
    - chargerVehicule: get vehicule par id.
    - chargerCarburant: get carburant par nom.
    - chargerEntretiensDuVehicule: get liste d'entretiens d'un vehicule et placer les données dans des objets
    - testerTypeMatricule: tester les type de matricule.
    - fermerDetailVehicule: fermer la boite de dialogue detail vehicule.
    - creerRapport: créer le pdf qui contient les détails d'un vehicule.
    - printPage: afficher le fichier pdf.
    - buildTableBody: création du tableau historique des entretiens du vehicule.
    - table: insérer le tableau  historique des entretiens dans le fichier pdf.
    - ouvrirHistoriqueConsommation: ouvrir boite de dialogue historique consommation.
    - getInfosGenerals: get les informations generals de la societé.
 */
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs; //pour pouvoir créer un fichier PDF pour le rapport des vehicules
@Component({
  selector: 'app-detail-vehicule',
  templateUrl: './detail-vehicule.html',
  styleUrls: ['./detail-vehicule.scss'],
})
export class DetailVehiculeComponent implements OnInit {
  //declaration des variables
  vehicule: any;
  idVehicule: any;
  carburants: any;
  date = new Date();
  entretiens: any;
  carburant: any;
  tun = false;
  rs = false;
  serie: String;
  numCar: String;
  matRS: String;
  matricule: String;
  infosGenerals: any;

  //types de carosserie des véhicules et leur catégories de permis accordées
  carosserie = [
    { name: 'DEUX ROUES', value: 'A/A1/B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'VOITURES PARTICULIÈRES', value: 'B/B+E/C/C+E/D/D1/D+E/H' },
    { name: 'POIDS LOURDS', value: 'C/C+E' },
    { name: 'POIDS LOURDS ARTICULÉS', value: 'C+E' },
  ];
  listeEntretiensAfficher: any[];

  //constructeur
  constructor(
    public dialogRef: MatDialogRef<DetailVehiculeComponent>,
    public service: VehiculeService,
    public datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.idVehicule = this.data.id; // ID du vehicule selectionné
    await this.chargerVehicule(this.idVehicule);
    this.testerTypeMatricule();
    this.chargerCarburant();
    this.chargerEntretiensDuVehicule();
    this.getInfosGenerals();
  }

  // get vehicule par id
  async chargerVehicule(id: any) {
    this.vehicule = await this.service.vehicule(id).toPromise();
  }

  // get carburant par nom
  async chargerCarburant() {
    this.carburants = await this.service.carburants().toPromise();
    this.carburant = this.carburants.filter(
      (x: any) => (x.nom = this.vehicule.carburant)
    )[0];
  }

  // get liste d'entretiens d'un vehicule et placer les données dans des objets
  async chargerEntretiensDuVehicule() {
    this.listeEntretiensAfficher = [];
    let description = '';
    this.entretiens = await this.service
      .getEntretiensVehicule(this.vehicule.id)
      .toPromise();
    this.entretiens = this.entretiens.sort((e1: any, e2: any) =>
      e1.id > e2.id ? -1 : 1
    );
    this.entretiens.forEach((entretien: any) => {
      description = '';
      if (entretien.huileMoteur) description += 'Vidange huile moteur\n';
      if (entretien.liquideRefroidissement)
        description += 'Vidange liquide de refroidissement\n';
      if (entretien.huileBoiteVitesse)
        description += 'Vidange huile boite de vitesse\n';
      if (entretien.huileBoiteVitesse)
        description += 'Vidange huile boite de vitesse\n';
      if (entretien.filtreHuile) description += 'Changement filtre à huile\n';
      if (entretien.filtreAir) description += 'Changement filtre à air\n';
      if (entretien.filtreClimatiseur)
        description += 'Changement filtre de climatiseur\n';
      if (entretien.filtreCarburant)
        description += 'Changement filtre de carburant\n';
      if (entretien.bougies) description += 'Changement des bougies\n';
      if (entretien.courroies) description += 'Changement des courroies\n';
      if (entretien.pneus) description += 'Changement des pneus\n';
      if (entretien.reparation) {
        description += 'Reparation: ';
        description += entretien.noteReparation + '\n';
      }
      description = description.slice(0, -1);

      this.listeEntretiensAfficher.push({
        date: this.datepipe.transform(entretien.date, 'dd/MM/y'),
        kilometrage: entretien.kilometrage,
        lieuIntervention: entretien.lieuIntervention,
        description: description,
      });
    });
  }

  // get les informations generals de la societé
  getInfosGenerals() {
    this.service.getInfoGeneralesDeLaSociete().subscribe((res) => {
      this.infosGenerals = res;
    });
  }

  // tester les type de matricule
  testerTypeMatricule() {
    this.matricule = this.vehicule.matricule;
    if (this.vehicule.matricule.includes('TUN')) {
      this.tun = true;
      this.rs = false;
      this.serie = this.matricule.split('TUN')[0];
      this.numCar = this.matricule.split('TUN')[1];
    }
    if (this.vehicule.matricule.includes('RS')) {
      this.tun = false;
      this.rs = true;
      this.matRS = this.matricule.replace('RS', '');
    }
  }

  //fermer la boite de dialogue detail vehicule
  fermerDetailVehicule(): void {
    this.dialogRef.close();
  }

  // créer le pdf qui contient les détails d'un vehicule
  creerRapport() {
    var carosserie = this.carosserie.filter(
      (element) => element.value === this.vehicule.categories
    );
    var nomCarosserie = carosserie[0].name.split(' ');
    return {
      pageSize: 'A4',
      pageMargins: [40, 95, 40, 60],
      info: {
        title: 'rapport vehicule ' + this.vehicule.matricule,
      },
      footer: function (currentPage: any, pageCount: any) {
        return {
          table: {
            body: [
              [
                {
                  text: 'Page' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right',
                  style: 'normalText',
                  margin: [490, 35, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },
      header: [
        {
          columns: [
            // matricule fiscale
            {
              text: this.infosGenerals.matriculeFiscale,
              bold: true,
              fontSize: 10,
              margin: [183, 9, 0, 0],
              width: 'auto',
            },
            // adresse
            {
              text: this.infosGenerals.adresse + ',' + this.infosGenerals.ville,
              bold: true,
              fontSize: 10,
              margin: [88.5, 9, 0, 0],
            },
          ],
        },
        {
          columns: [
            //telephone
            {
              text: this.infosGenerals.telephone,
              bold: true,
              fontSize: 10,
              margin: [175, 7.5, 0, 0],
              width: 'auto',
            },
            // fax
            {
              text: this.infosGenerals.fax,
              bold: true,
              fontSize: 10,
              margin: [108, 7.5, 0, 0],
            },
          ],
        },
        {
          columns: [
            //website
            {
              text: this.infosGenerals.siteWeb,
              bold: true,
              fontSize: 10,
              margin: [170, 10.5, 0, 0],
              width: 'auto',
            },
            //email
            {
              text: this.infosGenerals.email,
              bold: true,
              fontSize: 10,
              margin: [104, 10.5, 0, 0],
            },
          ],
        },
      ],
      background: {
        //definition du fond arriére
        image:
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAbaBNgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK85/av/aW8L/sefs7eL/iV4w1Kx0vQPCOnSXs0t3P5KTOOIoAwVjvlkKRqFVmLOoCsSAQD0aivy7/AGSP+DhDVP2oPjt+y/4Bk8B6LoPiD4w3HiXT/G+lTXtx/aHgu80uFp4YfLkjRszReVJ864Cy4BJUmv1EoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAprnauadTZf9WaAGee3tR57e1MorSxjzMf57e1Hnt7UyiiwczH+cfauW+Knj668F+HpLqyjt5Jo5I1bzlYoAzAY4Iy3frwBz1GegvrsWVszk4b7q8Zyx6f59K8k+NPiRdR0uKxhkbZJdIWLfefHc+/A/l24cYolyk3b0Ot8GfEXVPEiL5v2GMlcnbC3X/vv2rqoJr2eMHz7fP/XA+v8Av15j4U13T/BXh+bVNWvbXTdOtY981zcyrFFECcAsxwBywHPrXafDn4neHfiZaXE3h3XNK1yOzYRzvY3KzrExyQG2k4yDWEsVRjUVFyXO9Urq9vTc7HhansnVjF8q662+83l+2Af663/78n/4qjN7/wA/Fv8A9+D/APF1m6X8QtC1zxVqGh2esabc6zpIU3ljHcI1xahgCpdAdy5BHUdxWwTgVVOtTqJyg00tNO63OedOpB8s01/WhD/pp/5eLf8A78H/AOLprSXitt+0W/Qn/UHt/wADqn4Q8a6R4/8AD8eq6JqVlq2mzFljubWZZYnKkqwDLkcEEH6Vxcn7XXwvMn/I++FeAR/yEovb/arlrZng6UYzq1IpS2baV/TudFLAYqpJxhCTcd7J6evY7me+vopivnWvH/TBv/i6j/tW+/562v8A34P/AMXXHaR+0d4B8Ya7DY6X4z8NX19eNsgt4dQjeWVsdFUHJPFdYTgV0YXFYfERc6M1JLqmmVWwtSjaNWLi/O6JP7Vvv+etr/34P/xdL/at9/z1tf8Avwf/AIuuA8a/tN/D/wCHepvY6x4s0a1vY22SW4nEs0R9HRMlfxArY+H/AMXfDHxVtZpvDmu6brC25AmFtOGeHOcbl+8ucHGQOlc9PNsuqVvq8K0HP+VSV/uNpZZioUvbSpSUO9nb79jpv7Vvv+etr/34P/xdJB46tY9ct9Kupo4N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v+xp8L9O8EaxcQ+C9Hjnt7GaWNwjZVljYg9fUV49/wAE6f2cPA/xW/ZstdW8ReG9O1bUn1C5iNxOpLlVYYHXtX1t4x02bV/B+rWduoe4urKaGNcgbmZGAGTx1NeUfsDfBvxB8Cf2erfQfE1pFZapHfXE7RRzpMAjkFTuUkc4r0qOY1fqc1Ko+bmjbV3tZ3/Q+axXCmDefYacMLH2Xsp83uLl5rwtfS197fMyf2HvDdj4O8UfF7S9Nt47PT7Dxa8NvAg+WJBCmAK9q8d/8iPrX/Xhcf8Aotq82/Zi8G6r4W8efFm41LT7qyh1bxVJdWTyptW6iMSAOnquQea9J8d/8iPrX/XhP/6LauLG1OfE817/AA/kj6Lh3DujkzpcvLZ1LK1rLmlb5W2M39lT/k2jwD/2L1h/6Tx139cB+yp/ybR4B/7F6w/9J467+vOxH8WXqz2Mr/3Ol/hX5BT4Pv8A4Uynwff/AArCWx6EdyWiiioNgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACmy/6s06my/6s0AQ0UUVoc4VHaf6o/wC+3/oRqSobZ1WEliF+dup/2jQLqTUU3z1Y8Hd9Bmh3bHQL6lu1BfKz42/4OD9avPDv/BG/46Xun3l1YXkGk2pintpWiljP2+1B2spBGQSOD0Jr89YPBH7Lt7/wW0uP2Nl+APjaNo2mjHjAfGzxI3KaE2rZ+w+Z32+Vjz/9rn7lfrb/AMFAf2QLX9vX9jrxz8I7rXbjwzB43tIrR9VjtRcyWgS4imBERZA2TGFxuHXNfP8AP/wT5/asW/N037c+sNdHrN/wprwx5mdu373l5zt4+lBcT8vv2d/2jvCfh3SP2OrC8/Z1j+Onxq1L4Pazf6V4h1X4lXWhLa6elx4gN3btCYZYZHFvHdOsrfOGdQu0ojD1D9kczftgeFPhjc+Fvj9N4R8B/FG31o6X8MIvgtYa9qVhYaPDbyaloyeIZHW/uJkhuEhjvjieV23rhwK/Qn9mn/gjZ4G+DH7N9r8LvF2oXnxI8Lw+HNA0GWC5gk0zz5NI1jU9Xt7ktBNvB8/UVHlhtuLYbi4dlHjv7eX/AAbZfDX9rP8AaL0f4seA/EWofBrx9b65c+JNa1WxsZdabXdReaCaGdorm58mEwyRSNtjQK5mO4YUCiz3K2PGP2gPih8evD/7KOr/AAr8M/ss/ETUrPQPG9jbWIg0p5JvHfgBvtRgspb1rVptPvbfSn0/TzcmSS+jkjeTzBMrmvge0/a18M/8Ewv+ClPi4XXgXUtab4jeCbnwH4k+G+seOb2xj+Gxv7m0l+zDX5hNLcqIoVleVUh8o3TLkGIk/uf+zP8AsE/GH9njwGNFuf2mPEHiPd49TxjdzSeB9Ls1urae/ub/AFbTSsedqX9xdyu0ykNDhRGAo21U0n/gmf4s+JvxZs9V+O3xq1b45+C/Desp4n8L+Fb3wxa6HF4c1mGbdZXyXVi6TTGCJ7iERTFo5BPuZSyLg5WJH5LfsaftMah8VP2i/ENx42v9e8Jt+0t4uu/iJofwMbwBFqn/AAn9ncrFNYv/AMJMES5trV7yxUNsi8sCwZ2QiRlP7/8AwmuNSvvhX4Zm1rw5Z+D9Yl0m1e/0C0ukurfQ5zEvmWkc0aqkiRNmMOqqrBQQACBXyR4o/wCCIHgSb9rb4dfFLwnrd74Nb4QeA7HwR4M0qG2kvl0AWuoyXP2wTTTlpma1uLq02ThwBOZcl0XH07+0f8Cm/aD+HreHf7Wv/D5a5juhc2qbpBsz8vUcHPXPatsPGPOozdl33/A5cdVq0sPOeHhzzS0jdK77XeiO5ozXyS3/AASkdBlvib4sUevk/wD2yk/4dSPt3f8ACzvFWMZ/1P8A9sr2fqeA/wCgn/yRnw74j4lt/wAiv/ytD/I9V/Zc8V6n4k8ffFuHUNRvb6HTfFb21mk8zSLaxCJCI4wThVyScDivTfHf/Ij61/14T/8Aotq8G/4J6eCv+FbP8TtA+2z6l/Y/iY2v2qb/AFk+2BBuPXk17z47/wCRH1r/AK8J/wD0W1YZhCMMU4w2938lqelwxWrVsj9pXVpPnur3s+aWl+ttjN/ZU/5No8A/9i9Yf+k8dd/XAfsqf8m0eAf+xesP/SeOu/rzcR/Fl6s9zK/9zpf4V+QU+D7/AOFMp8H3/wAKwlsehHcloooqDYKKKKACiiigAooooAKKM4rzjxd+2L8I/h/8SofBmvfFT4caJ4wuGRItCv8AxLZW2pSM+NgW3eQSEtkYAXnI9aAPR6KAciigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiijdQAUUbqKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKbL/qzTqbL/qzQDIaKKK0OcKhtl+QttXO9+f+BGpq4vx98QLL4ceKNMj1Zo7PTdflNtFfyuFhgu8Dy4HJ+75qhtjHC702E7pI1NQg5Oy3M6laFL36jsu/qdc9wo/5aIB7DJqI3iKMhWZuxbtVTPvQWX6/jQos7v3aW54X/wAFNvB2rfFv9i3xd4R0P4jab8K9c8XSWGjafr1/fNYw+bPfW6fY/NQiRGu1L2oaPLg3OVDEAH5r+CXwB8H/ALDX7cHwVtLX4I6f8AZfE327wvHqfgXWoNY8O+MpTp81ymm6k80VveeYn2U3ENw9vvMluyFwsrhvtX9oP4A+D/2qPg1r3w++IGh23iPwh4mgW31HT5neMTKrrIjK6Mro6SIjq6MGVkVgQQDXkf7Pn/BNbw/8C/i9pfjTVPiV8avitqvhtJx4ci8f+KzrVv4badGimmtl8tGMzwu8RlmaWQRu6hgHbJ7ORnOpBvRnwL/wTo/4J1/Dv4+/s6al4q1z9lT4f/E3U9S8aeKVl8Q6n4jWzur0R65exqrRlCV2KojHPIQHvXpPxp/ZP8I/Er/god8bobj9lrw/8frXwj4a8J2umW9xqdjYyaPEtpeBLeAXTqG8xY1GNwH7tcnuPdND/wCCLHhPwXFe23hj43ftQ+D9JvNQu9SXStB+JE+n6fazXVxJ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8fap8Gre6tvBXiHRpbpNatrO4srizbSbxpoQt1Yoly8kG5hLbumxGMTmNf1PoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApCmVxS0A5oAZ5A96PIHvT6Kd2LlQwQqfWsjxz4B0f4k+E77Q9csodS0vUYjDcW8wysin9QQcEEcggEYIBraHSinGUou6epFSjCpFwmk09Gn1PnqX/gnzaRN5dj8TvjBplnGAsNrb+J5PKgUcBV3KSFA4AJPFMH/AAT9/wCqufGn/wAKhv8A4ivogHNFdn9pYj+b8jwv9Vcs/wCff4v/ADPnj/h35/1Vz40/+FQ3/wARR/w78/6q58af/Cob/wCIr6Hoo/tHEfzfgg/1Vyz/AJ9/jL/M+eP+Hfn/AFVz40/+FQ3/AMRR/wAO/P8Aqrnxp/8ACob/AOIr6Hoo/tHEfzfgg/1Vyz/n3+Mv8z54/wCHfn/VXPjT/wCFQ3/xFH/Dvz/qrnxp/wDCob/4ivoeij+0cR/N+CD/AFVyz/n3+Mv8z54/4d+f9Vc+NP8A4VDf/EUf8O/P+qufGn/wqG/+Ir6Hoo/tHEfzfgg/1Vyz/n3+Mv8AM+eP+Hfn/VXPjT/4VDf/ABFH/Dvz/qrnxp/8Khv/AIivoeij+0cR/N+CD/VXLP8An3+Mv8z53P8AwT8V1/5K58aef+pob/4it74E/sGeA/gL4r/4SCyh1LWPEWHA1PVLr7ROhkzvYcBQ7ZILhdxBIzhmB9qFFEsyxLi4c7s9+lx0+FcqhVjX9inKLum9bPur3sxnkL70eQPen0VxXZ73KhnkD3pUj2GnUUrj5UFFFFAwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACi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j/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGj/iKN/YT/wCi5f8AlmeIP/kGgD7/AKK+AP8AiKN/YT/6Ll/5ZniD/wCQaP8AiKN/YT/6Ll/5ZniD/wCQaAPv+ivgD/iKN/YT/wCi5f8AlmeIP/kGvv8AoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6j/iFx/YT/AOiG/wDl5+IP/k6gD7/or4A/4hcf2E/+iG/+Xn4g/wDk6j/iFx/YT/6Ib/5efiD/AOTqAPv+ivgD/iFx/YT/AOiG/wDl5+IP/k6vf/2GP+CXHwJ/4Jr/APCUf8KU8C/8IX/wmn2T+2f+J1qGpfbPsvn+R/x9zy7Nv2ib7m3O/nOFwAfQFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Z',
        width: 595.28,
        height: 841.89,
      },
      content: [
        //contenue du fichier PDF
        {
          image:
            'data:image/png;base64,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RERERESGE6BKgdjO//7f/3v0X//1XzKAHHvssaMTTzxxdMYZZ4wuuOCC0aWXXjrasWPH6Prrrx/dcssto7/+9a+jBx98cFxUvvTSS6NDhw6NPv300+InBQCgHQVir3ITCCIiIiIiMpwAVQrEdhSIUidROm7btm109dVXj/7yl7+MV52+8MIL41WO3377bfHTBAAwmQKxV7kJBBERERERGU6AKgViOwpE6SJnnnnmaPv27aM777xzfInVt99+u/gJAwD4BwVir3ITCCIiIiIiMpwAVQrEdhSI0le2bNkyXrX45z//eXzvxsOHDxc/dQDAECkQe5WbQBARERERkeEEqFIgtqNAlEXm3HPPHReKsUrxk08+KX4KAYAhUCD2KjeBICIiIiIiwwlQpUBsR4Eoy8zll18+2rNnj9WJADAACsRe5SYQRERERERkOAGqFIjtKBBls+TSSy8dPfbYY6Nvvvmm+OkEANaJArFXuQkEEREREREZToAqBWI7CkTZbDnppJNGt9122+jtt98ufkoBgHWgQOxVbgJBRERERESGE6BKgdiOAlE2c3bu3Dl68803i59WAGCVKRB7lZtAEBERERGR4QSoUiC2o0CUVcgNN9wwOnToUPFTCwCsIgVir3ITCCIiIiIiMpwAVQrEdhSIskq56aabRp999lnx0wsArBIFYq9yEwgiIiIiIjKcAFUKxHYUiLJqOfnkk0ePPfZY8RMMAKwKBWKvchMIIiIiIiIynABVCsR2FIiyqtm+ffvob3/7W/GTDABsdgrEXuUmEEREREREZDgBqhSI7SgQZdWzb9++4qcZANjMFIi9yk0giIiIiIjIcAJUKRDbUSDKOuTWW28tfqIBgM1Kgdir3ASCiIiIiIgMJ0CVArEdBaKsSy699NLRBx98UPxkAwCbjQKxV7kJBBERERERGU6AKgViOwpEWaeceeaZozfffLP46QYANhMFYq9yEwgiIiIiIjKcAFUKxHYUiLJuOeGEE0YvvfRS8RMOAGwWCsRe5SYQRERERERkOAGqFIjtKBBlXbN///7ipxwA2AwUiL3KTSCIiIiIiMhwAlQpENtRIMo655lnnil+0gGAZVMg9io3gSAiIiIiIsMJUKVAbEeBKOueF154ofhpBwCWSYHYq9wEgoiIiIiIDCdAlQKxHQWirHu2bNkynsMDAJZLgdir3ASCiIiIiIgMJ0CVArEdBaIMISeffPLo3XffLX7qAYBlUCD2KjeBICIiIiIiwwlQpUBsR4EoQ8nFF188+u6774qffABg0RSIvcpNIIiIiIiIyHACVCkQ21EgypByww03FD/5AMCiKRB7lZtAEBERERGR4QSoUiC2o0CUoeXee+8tfvoBgEVSIPYqN4EgIiIiIiLDCVClQGxHgShDzMsvv1z8CwAAFkWB2KvcBIKIiIiIiAwnQJUCsR0Fogwx55133ujbb78t/hUAAIugQOxVbgJBRERERESGE6BKgdiOAlGGmltvvbX4VwAALIICsVe5CQQRERERERlOgCoFYjsKRBlyDhw4UPxLAAD6pkDsVW4CQUREREREhhOgSoHYjgJRhpyzzz579N133xX/GgCAPikQe5WbQBARERERkeEEqFIgtqNAlKHnnnvuKf41AAB9UiD2KjeBICIiIiIiwwlQpUBsR4Eo8l+j9957r/gXAQD0RYHYq9wEgoiIiIiIDCdAlQKxHQWiyH+NrrvuuuJfBADQFwVir3ITCCIiIiIiMpwAVQrEdhSIIv/ISy+9VPyrAAD6oEDsVW4CQUREREREhhOgSoHYjgJR5B+54oorin8VAEAfFIi9yk0giIiIiIjIcAJUKRDbUSCKHIlViADQHwVir3ITCCIiIiIiMpwAVQrEdhSIIkdiFSIA9EeB2KvcBIKIiIiIiAwnQJUCsR0Fosg/xypEAOiHArFXuQkEEREREREZToAqBWI7CkSRf84111xT/OsAALqkQOxVbgJBRERERESGE6BKgdiOAlHkX/PBBx8U/0IAgK4oEHuVm0AQEREREZHhBKhSILazLgXi6aefPtqxY0ejXHXVVeNcffXV48TKs0gck8jOnTtH11577cb/Rq677rpxrr/++nFuuOGGcW688cZxdu3aNc6f/vSn0Z///OdaicfGc+L5MWaMH68Z2xDbFdsY2xv357v88stHl1122eiSSy4ZXXzxxaNt27aNtm7dOrrgggtGZ5999ui0004bnXTSSaMtW7Zkj5PUy+7du4t/IQBAVxSIvcpNIIiIiIiIyHACVCkQ21mXAjH2g3/27bffjj7//PPRxx9/PHrvvfdGb7755ujgwYOjffv2je66665xEXnsscdmj+fQc9ZZZxVHEQDoigKxV7kJBBERERERGU6AKgViOwrEYfvuu+/G81v33XffeJVj7tgONQcOHCiOEgDQBQUiAAAAsDAKxHYUiKRixeJDDz00Ov/887PHeUiJy8oCAN1RIAIAAAALo0BsR4HIJC+++OL4Xoy54z2EnHrqqcWRAAC6oEAEAAAAFkaB2I4CkVlef/318f0Sc8d93fPKK68URwEAaEuBCAAAACyMArEdBSJ17dmzZ3T88cdnj/+65rbbbiv2HgBoS4EIAAAALIwCsR0FIk189NFHoxtuuCH7Hqxjzj777GLPAYC2FIgAAADAwigQ21EgMo+bb745+z6sYz788MNirwGANhSIAAAAwMIoENtRIDKv22+/PfterFueeuqpYo8BgDYUiAAAAMDCKBDbUSDSxl133ZV9P9Ypt9xyS7G3AEAbCkQAAABgYRSI7SgQaevWW2/NvifrkosuuqjYUwCgDQUiAAAAsDAKxHYUiLT13XffjS644ILs+7Iu+eKLL4q9BQDmpUAEAAAAFkaB2I4CkS7EHFnufVmXvPHGG8WeAgDzUiACAIP0s5/9bHTUUUeN4zJHALA4CsR2FIh05d57782+N+uQffv2FXsJAMxLgQgArIXf/va3G4Xg73//++Krk8W9X8rHR5588sniO81E+ViOEdsAAEynQGxHgUiXtm3bln1/Vj233357sYcAwLwUiEv0yiuvjH7yk5/80+RlrIaYdwIz9f77749++ctf/tPY8VrxmgCsNp8feel2x5/rSMu/OIbzOOWUUxq/LgAMmQKxHQUiXXr88cez78+qZ/v27cUeAgDzUiAuUTrhmCYmatuqTv6Wueaaa4pHALCqfH7kzVMghnTlYhzbphSIANCMArEdBSJdO/XUU7Pv0SrnzDPPLPYOAJiXAnGJJk0AR+KyavOKVSK5MSPzTIwCsLn4/Mibt0AM6f0Qm67kVCACQDMKxHYUiHTtnnvuyb5Hq5xjjz222DsAYF4KxCWqTgCnk5fHHHNM8ajm4r5P6TjlnyMKRIDV5/Mjr02BGJduLY9j0/sYKhABoBkFYjsKRLr28ccfZ9+jVc+nn35a7CEAMA8F4hJVJ4DT+zBF5r3f1A9/+MONMWIlSjqmAhFg9fn8yGtTILahQASAZhSI7SgQ6cPVV1+dfZ9WOYcOHSr2DgCYhwJxiaoTwLH6If37PJO1cY+q8vnlvbDajgnA5uLzI0+BCACrQYHYjgKRPjz44IPZ92mV89JLLxV7BwDMQ4G4RNUJ4BCXTSv/Xk7gNpFexq6c7C3/nn4NgNXl8yNPgQgAq0GB2I4CkT688cYb2fdplbN///5i7wCAeSgQlyg3AVy9ZNwDDzww/nodTz755D89t7yEXfq1OhPAsQ0xEZ1OJkfi7/H1eJ1Z0m2Je2qVYoVLTGyX34uJ1mmX2ov9j9dMnxPbEfsRK25K5WX3pk2ap2PEPs6SrsaJ16wjtikuJZhOYkfitWM/mryfdaT3K0uPM7DeNuvnR4jnlufB9JKo8ef4Wnxvnkusxjm5Omb8Pb5eSs+98ec6cp8z5fNjW9PPmknS96Pu6/q8AGDIFIjtKBDpywknnJB9r1Y1jz76aLFnAMA8FIhLlJsADukkZkwi1hWPLZ93zDHHFF+tPwEck8/VCdRJmTX5GBOf5WPLydR0+9LktikmVmMfco8vE9talpnp1ydJH1NnInzS+zNJTGKnE9uTEsejzoT0LDEBXx0bGIbN9vlRqm7XtNQZL8R5vvoLLdWU59W0jCs/eyapPn5S4ryelpQ56X7Pet3g8wKAoVMgtqNApC/bt2/PvlermoceeqjYMwBgHoOaQVqVArH69TqTh/GYdDIyXWGXjjVpwjZWQaSPi8REdExeRnLF4rTJ32qBOKk8jOTGiefkHltNObGbfm2S9DHTtr1UfR+mSVd2lEmPX/V7MRnedlI4PcZlul6xAmxOk85P1a8v4vOjNO08PymzSs4ovuoUbZF4XPpZFefeSSaNW56zc59500rE9LhPe93g8wIAFIhtKRDpyxVXXJF9r1Y1999/f7FnAMA8FIhLNGkCuLpSIMq9WdICMCYiU+lYkyaA00nLmNDNXaY0JhvTCdf486RJzXSyMn1OTISWk5axn7Hd8b+p6nGJ56cTt7Ft0yaqJ0kfM2siPEx6f6qqlw2MfazuUxyn6nhtLyFX/TmJAMMw6fy0jM+PUC3FyvN2ei6Mc3d1uyPTxq0WaulnSIjzb650i8TXJ4lx0sfmjlO8Tvq42Kfqub2U7te01/V5AQD/oEBsR4FIXx555JHse7Wqueeee4o9AwDmMagZpFUpEEM6IVqd0M1JV0tUJ0LLr0cmTdTG5GS8Zq44TKXFYCRdqZKqPi4SE6WzVlHE99PCMf486Tnx2uljy0ySPmbahHVp2vuTSo997OM01TEnTUbXlU7at51gBlbHZvr8qJZTs8718TlT5zxf/RyZVsxVj8e0x1dXrU/6HAvVz6RJKybT15+2nT4vAOAfFIjtKBDpy/79+7Pv1armrrvuKvYMAJiHAnGJpk0AVyc40xUXVdVJ1upEbPq9SRPATdQZr7pNMQFbZ/Kzut/pysOc6kR0ZJL0MXWOw7T3p1Td3jr7mG5vndVBAFWb6fOjuiJ81i+ihOr2586F1XFnnV+r+z2pyEtLvEmFYCq2rXx8nL9z0v2pW1z6vABgyBSI7SgQ6cvzzz+ffa9WNXfeeWexZwDAPBSISzSroEonDqdNcqaTrLnHld+LTJoAbiImR2eNV52UnlUEltJ9mTRRWzXrOJbSx9Q5DnXGPeaYYza+P2s1SSndx3g+QFOzzk+L/PxIX6vuOS2KynTs3PPSoq/uuOnnU67Ii3Kz/H5k2urDUhR96XNyBWn6fkwqEH1eAMARCsR2FIj0JebNcu/VqsYlTAGgHQXiEs2aAE4nDiO5S7xVJzZzK03S70+aAG5ingKxrphULZ8zaRK2atZxLKWPqXMc6oybTnDXPbbpuHX3ESA16/y0qM+PaiHXZJVc+lkS59JUtWCse35Nx8ydX6urAOtKn5M7TnXO6z4vAOAIBWI7CkT6cujQoex7taq5//77iz0DgCP27t07evHFF4u/MU392bM1sGoFYp2J2XSM6gRsKR2jzqRlTNzGqox4bKx4iEnLNOlqk0njzVsgps+ps60hPQaRSdLH1Bm7zrjp9+P4V49VLukkct1VlgCpWeenRX1+VM/1uXJtkvSefJHUvOPGObZ8Tvy5qnrc0nPztKTPmXUs4/E56Rg+LwAYOgViOwpE+vLaa69l36tVzcMPP1zsGQCMRm+88cbo9NNPH39GvPTSS8VXmaZ+s7MGVq1ADOmKvNwEbzq5OGnlR/n9SG4CuBTFYaxaSQvCWZk03hALxHliQhiYR53z0yI+P+J56WOaFIjT9mFRBeI86aJAnCc+LwBYJwrEdhSI9GXdViDGChMA+Prrr0c7duz4p88IBWI99ZudNbCKBWL1cmvpvZdilWD6vdwl6kL6mNwEcIhxmxSHZSaNp0Csl1iBA9BUnfPTIj4/qtux7gVifE7GpV+r0nH7KhB9XgCwThSI7SgQ6cu6rUB84oknij0DYKj++te/Zj8jXn755eIRTFO/2VkDq1ggVu8DFSsES+lEafr1qvT58Zo56UqVSFy6NCaYcxOl6etOGm+IBWLd7QVoq875aRGfH9UiskmBuBkuYdqVdNzc64b0dX1eADB0CsR2FIj0Je4HlXuvVjVPP/10sWcADM2zzz47nn/JfT5EFIj1dDd7tgJWsUAMMblbPiZWP8SkcBR76XOnTa6mj8tNWlYngCddyq7UZ4GYXlJv0iRsVd3jmD5m0nan6oybrtqsMyZAF+qe9/r+/Kie62PVY13Tyr7qNtY9v04bM1QvudqV9P2Y9Nnl8wIAjlAgtqNApC/PPPNM9r1a1bg8HcDwxNzX5Zdfnv1cSJNbOMW/6m72bAWsaoGYm6BNV27k7m2VSp+bm7Ssux2ldIJ20iTovAViOvas/SpNW8WSSidv61wKrs5xmTVZDdCHzfL5MW2V4zTV5+XOyen3Y1V8Helq+tw5uXo84u9dSN+PSZ8FPi8A4AgFYjsKRPry+OOPZ9+rVc27775b7BkAQxALpXKfB7koEOup3+ysgVUtEEO6Mi8mSNMybNaKwfJxkdwEcLodMfYs6QRtbrwwb4FYPSazJner9/iKTJJO3s6aNM/dEzKnuprFiQdYhM3y+RHSz4RInfNgnXN9es6OROk4TbraMjKppEv3v27hOUu6P5Ne1+cFAByhQGxHgUhf7rjjjux7tar56quvij0DYJ099thjoxNPPDH7WTAp5mXqqd/srIFVLhCrj00za1I1fWxuArg69rR/PNUJ2tx4Yd4CMV47fV5MTE/av1x5GJmkulJx0qX24jcVquVhJKfJ9vYh3ac6qyqB9bBZPj9C9Vw86zxYvWz2pMKtOu60VYjVz6bIpHGrj530WdBEeownva7PCwA4QoHYjgKRvmzfvj37Xq1iTj311GKvAFhXr7/++ujSSy/Nfg7MigKxnvrNzhpY5QKxOvFYps7qifTxuQngatkXk5rVf0DxmPh6+rjIpAnleQvEEJPE6XPjdWPCuRSrA6uPSTNJPK/62FgRUk7gxvdzk9BlJqm+j7G9udU0pfhePGfSJHNduZ8JYBg2y+dHqfr5EKseo5hLC7JJ59j4ek48N109GYlzf/r4+GxIXzv95Y9J59gYt/pLIrFvk8q8OH6xL7Htk8rG9P2Ydm6vvm8+LwAYKgViOwpE+hKlW+69WsVs27at2CsA1s2XX345uummm7Ln/7qp9h/kDWoGaZULxJArzaZNPJbSx8dr5sTkZPq4SExsxterE7jpxOuk8WK70uc0Ef94cysAc4ltqx6XaaYVj2ni9Zu8P7lxY4w4fmWqxzHSRvUYR+r8PACrbzN9foQo9eqet9PMWv1XXa04LfGZlT4+zruTxL7ntrf83CtT/f6kY5C+H9NeN/i8AAAFYlsKRPpw+PDh7Pu0qtm5c2exZwCsm+OOOy577m8SBWI97WakVsyqF4gx0Zo+PiYY60ifM2nyM1ZepKs4JiUue5Zu96TxqpOVTcVkdG4CNU1MssZ2NzmO8fh4Xvr4auI4xOs33Yf08nB1EhPGbVhRAsO1mT4/SnFOmnV+LROvX7fAim2fVU7G+TfO7+l5O7ZlmjqfM9VMumdk+n7Met3g8wKAoVMgtqNApA8HDhzIvk+rmttvv73YMwDWTe683zQKxHoGNYO02QrEdEI3Sqs60pIvvaznNOUEaUxAzpqwjW2K1RHpZG28Zkx2lv+o0hUekyZTY2K2fEzdieqqmAyO8dMJ6diu2L5035tOpIfYz+pEd4wbXy/F65fHoe4+xDEqtzk9huUY8fU4lvE6MX5b6SR0/BkYhs34+VGKx8XlPtPXi8RY1fNsXXFujXNcOmaMF6+Tble6ErLOJVpDHIvc9kbinB3bHJ8zMfYkcd4vn1P3dX1eADBkCsR2FIj0YdeuXdn3aVXz9NNPF3sGwLrJnfebRoFYjwKRlTdPgQgAAMByKBDbUSDStW+//XZ0/PHHZ9+nVc17771X7B0A6yZ33m8aBWI9CkRWngIRAABgdSgQ21Eg0rWnnnoq+x6tamKeCID1lTv3N40CsR4FIitPgQgAALA6FIjtKBDp2lVXXZV9j1Y1O3bsKPYMgHWUO/c3jQKxHgUiK0+BCAAAsDoUiO0oEOnSoUOHsu/PKufuu+8u9g6AdZQ79zeNArEeBSIrT4EIAACwOhSI7SgQ6dK6/Dylef7554u9A2Ad5c79TaNArEeByMpTIAIAAKwOBWI7CkS68uKLL2bfm1XPl19+WewhAOsod+5vGgViPQpEVt4111yzUR7+7Gc/K74KAADAZqRAbEeBSFcuvvji7HuzyrnyyiuLvQNgXeXO/02jQKxHgQgAAAAsjAKxHQUiXdi9e3f2fVn1PProo8UeArCucuf/plEg1qNABAAAABZGgdiOApG2nnzyyex7sg754IMPir1cfd98883os88+G+/ToUOHRq+99tro4MGDo9dff3301ltvjd57773RRx99NPr73/9ePIOcjz/+ePT222+Pj1vMDcdx++KLL4rvUhU/T3GM/ud//mf08ssvj3/2Pvnkk9H3339fPGKYPv/889Hhw4fHxyX+Hcb/xr+/+HfKZN9+++3o/fffH/8sxTGL81mc19rKnf+bRoFYjwIRAAAAWBgFYjsKRNqIEir3fqxDtm3bVuzlaoky8JlnnhmvCr3uuutGW7duHR1//PHZfZyU4447bnT22WePLrvsstH1118/uvvuu0cvvPDC6NNPPy1eZRiimNi3b9/oxhtvHP88xHHJHa9IHOM4ZpdccsnovvvuG73zzjvFKMMSxc6tt946uvzyy0ennXZa9liVOf3000cXXXTR6Oabbx699NJLxQjrJc6Rjz/++Oi2224bbd++fXTmmWdmj0Wak08+eXTeeeeN//3t3LlzvBI6Stihip+Nq666anTWWWdlj1fk/PPPH/35z38ePfHEE+NytqncmE2jQKxHgQgAAAAsjAKxHQUi84oJ7WkTuquee+65p9jTze27774bl3s33XTT6IwzzsjuS5c555xzxhP1sWpq0aKka5O6KwXjeEZhkdv/JolybJllYnw+5o5D3TzwwAPFSNPFuSBKw1mF4azE8+PnOErIVRb/Nm655ZbO/z2ee+654+N84MCB0VdffVW82vLECsDcz03dRJk6Taxu/8Mf/pA9FrNy9dVXj5599tlipNHo1FNPnZrcGE2TG3dahkqBCAAAACyMArEdBSLziInjOitpVjlxmbzNLFYDRkkxbVVc34mfgbvuumthZUZuG5pkVoEYhUOsIMw9t23+8pe/LLz0ic/H3LbUzb333luMlBfF6J/+9Kfsc9smtj1W762KuCxr/NJB2xK1SaLIX+Z5Kj4HcttVN5NKtC+//HK8ejr3nKa5+OKLx4V07nvLzlApEAEAAICFUSC2o0CkqZiMPeGEE7Lvw7okVq9sZrGqLVbw5LZ9GYnS5JFHHim2rj+5126SaQVirOzKPafLxCU79+/fX7xi/9oWiHHp2kmeeuqphZTXcenPr7/+unjVzScuGRyrJnPbvqjEMVrG5YXbFohxqdaq2I8LL7ww+/h5E5eBzX192RkqBSIAAACwMArEdhSINBH3l8od/3VLXCJwM4oJ+7jPXm6bN0N27NgxXonVl9xrNkmuQIxVdH2tOpyUuDzq22+/XWxBf9oWiLG6NOf222/PPr6vxKVA43KWm00cn9z2LiNbtmwZF76xem9R2haI8UsQqdj2Pv4txiWJc19fdoZKgQgAAAAsjAKxHQUidRw6dGhcDuWO/bol7vG3GUWpuczLldZNrLJ75ZVXiq3uVu71mqRaIEYptayVnHGcooDpU9sCMYrCVFwus+2YbfLQQw8VW7Jc8fO9devW7DYuO7Gq78UXXyy2tF9tC8RIKlZ+5x7TNiH39WVnqBSIAAAAwMIoENtRIDLNN998M17Vkjvm65q4POhmE5cHzW3rZs2JJ544evPNN4ut707utZokLRDj/n65xywyUfbE/HJf2pZ9cVnXUryf8b7mHrfIzLovY9/iPoe57dps2bt3b7HF/emyQPzrX/+a/X7b7Nq1azx+7nvLzlApEAEAAICFUSC2o0AkJy7rGPfVWvd7Heby8ccfF0dhc3j22Wez27nZEyvsur4vW+51mqQsEGPlYe77y0isKo37ivahbYF48803j8eJy9LG+5l7zDISZdMy/PnPf85uz2bNHXfcUWx5P7oqEJ955pns97rIq6++On6N3PeWnaFSIAIAAAALo0BsR4FI6fPPPx8999xz4/uz5Y7xELKsYmKSuE/eKpe41157bbEn3ci9RpNEgfjaa69lv7fsxH3autZVgXjhhRdmv7/MxC84LMpXX321sufFnTt3jleS96GLAjGObV/nuFgxW8p9f9kZKgUiAAAAsDAKxHYUiMP03nvvjYuUxx9/fDwRf9lll2WP65ASk83Ve+Qt07fffju66KKLstu6SokVlF3Jjd8ksbI29/XNkDPOOGP097//vdjTbnRRIF5++eXZ722GxErSRWh7HJedbdu2jc8nXeuiQLzyyiuzX+8i6SV4c99fdoZKgQgAAAAsjAKxHQXieonVHB999NHorbfeGh08eHD01FNPjfbs2TO68847xytRopCK+67ljuHQc//99xdHcXPo655gi86OHTuKPWovN/46Jf6Ndqlt8XX22Wdnv75ZEivX3n///WJv+7Fqly2dlOuvv77Yo+50USD2mVjBXcp9f9kZKgUiAAAAsDAKxHbWpUCMYuyxxx4br6jbt2/fOE888cQ4+/fvHydWq0ShFnn66acXlni9eP3Yltiu2MbY1r17944effTRccH34IMPjgus3bt3j+6+++7RXXfdNbr99tvHKyhuuumm0Y033ji+HOTVV1892r59++jSSy8d7/O55547vjdZrJ7LHReplziG3333XfGvYvliJdqWLVuy27qK6arkyY29bnn44YeLvW1v1VfO1ckVV1xR7G334ryce81VzX333VfsWTc2c4EY5/RU7jHLzlApEAEAAICFUSC2sy4FokibRIm7mdxxxx3Z7ewqMbke5fNZZ501OvXUU0fHHnts9nFdJYryLuTGXse8+eabxR63M4QCMXLPPfcUe9ydl156Kftaq564z21XNnOBGL+Ik8o9ZtkZKgUiAAAAsDAKxHYUiDL0xD3eNpO4BG1uO+dN3Fvv3nvvHU/2f/zxx6Pvv/++eKV/FvfFPHDgwHjVa9eXrowVtF3Ijd1XomSNYxErg2P18iuvvDJeTRyr0rZu3To67bTTss/rIrG6uAuLLhCvueaacZkXK6xffPHF8c9TlMexovriiy/OPqerxD1du3ThhRdmX6fLnHnmmaM//OEP4+MW79V5553X+2ryGP/dd98t9rKdzVwgxrkulXvMsjNUCkQAAABgYRSI7SgQZeg5dOhQ8a9hc3jggQey29k0sbowiq95xarMrlYmnn/++cWo7eTG7jpxH8JYfVbH888/P76kcG6ctomx21pEgRgrWaMw/Oyzz4pXnSz+rcX9WHPjtE1XJXXo6/6jUTrHJamjXJ0m7mEbl7OOIjk3TttEmduFzVogRhFblXvcsjNUCkQAAABgYRSI7SgQZciJ1WSbTUx+57a1SWIFYRerjF5++eXs+PPkq6++KkadX27crhIrzuYt7eK+hV1fBjZWpbXVd4EYK1vnEasF+1iR+OmnnxavML+4fGxu7LaJyxJ/++23xavUF78EEKuIc2O2SdyLt61FFIhRUMeq1riH8KuvvjpOFNFR8kcZnStZ57mPaHWMeRLbxmwKRAAAAGBhFIjtKBBlqLniiiuKfwWbx9/+9rfstjbJli1bOruHXoiViLnXaZr333+/GHF+uXG7yI4dOyZe2rWueO+6vqxpXFa2jb4KxOOPP76TsuTaa6/Njj9v4nKzbV155ZXZsedNXKK07b/Hr7/+enTbbbdlx5838UsGbfVZIMalVuv+gscLL7zwT//2vvnmm+I79aWvPW8UiPUoEAEAAICFUSC2o0CUoWazXbo07Nq1K7utTRL3nOvSd999Nzr11FOzr9Ukr7/+ejHi/HLjts1VV13VujwsRYnYxbEqEyus2uijQOyqPCx1WSK2LcW6Xn0YxXSUf1257777sq8zb9quwO6rQIxVhfOsJo3Vmpdccknxt2Zy29E0Xd+Hc10pEAEAAICFUSC2o0CUIWb//v3Fv4DNJeYaY1I/7sM3z2ULu7rXYFVcTjP3ek3y7LPPFqPNLzdum8TxioK0S2+88Ub2tebJKaecUow6nz4KxFjt1bXLLrss+1rz5LnnnitGbe5Pf/pTdsx5cv311xejdit+QSD3evPkpJNOGn355ZfFyM31USCefPLJo7fffrt4hcXJbUvTdPFLEkOgQAQAAAAWRoHYjgJRhpa77767+OlfDYcPHx499dRT40sYRtESl/bL7Vdknnt/1dHFyqdHHnmkGG1+uXHb5JVXXilG7lbcsy33evPkwIEDxajNdV0g3n777cXI3eqyiIryfR4ffvhhdrx5csEFF3ReTKf+8pe/ZF93ntx1113FqM31USAu65c7ctvSNArEehSIAAAAwMIoENtRIMqQct111xU/+ast7vEVl8uL+xPeeOONowsvvHC8f32JSwNWj2XTPPTQQ8Vo88uNO2/6LpLjMoy5122aNpcx7bJA3Lp1azFqP3bv3p193aY588wzixGb6fLyoNEZ9CnKySgpc6/dNLHib15dF4jbtm0rRl683PY0Taw+ZjYFIgAAALAwCsR2FIgylEShE8UbzR08eDB7TJvkgQceKEabX27cedPm0o11xKrR3Os2Taw6nVeXBeITTzxRjNqPuFdg3F8x99pNE6sJm4ryKjdW09x///3FiP3q4t9kmXlXznVdIO7bt68YefFy29M0CsR6FIgAAADAwigQ21EgyhAS9xNcxn211kUUDLnj2iT33ntvMdr8cuPOk127dhUj9uf7778f32Mu9/pNctxxxxUjNtdVgRjF3rfffluM2p8///nP2ddvmqeffroYsZ733nsvO07TxHv11VdfFaP278orr8xuR9PEJXfn0WWBGD9jfV72dZbcNjWNArEeBSIAAACwMArEdhSIsu6JSxoeOnSo+IlnHnGp1NyxbZJ5S4pUbtx50te9D6tuvfXW7Os3TRQ18+iqQLz55puLEfv16quvZl+/aeJ+oU08+OCD2XGaZlHHqRT3x8xtR9NceumlxYjNdFkgxqWY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RxqlYB1xac/yOZEmlyAFAOpTILajQFw/zz//fPYYDSFN7v/N6sm9502jQGwWBSLQJQUiALB20nsDRqJQnHRvwfI+kul9Gptc9hQAaEaB2I4CcT3ddttt2eM0hPzP//xPcRRYN7n3u2kUiM2iQAS6pEAEANZOlH/p/QzTYjAuaVomvWRp+phJZSMA0J4CsR0F4vq68MILs8dq3XPZZZcVR4B1k3u/m0aB2CwKRKBLCkQAYC298sor45KwWhBOSzxeeQgA/VIgtqNAXF/x/19zx2oIue+++4qjwDrJvddNo0BsFgUi0CUFIgCw1qIQ/P3vfz8uB9PLlEbKFYnxffdfAYDFUCC2o0Bcb3fddVf2eA0hLmW6fmJ1adsMqUC87rrrssegSW699dZiNID2FIgAAADAwigQ21Egrr+LL744e8zWPZdeemlxBACAzUCBCAAAACyMArEdBeL6e/3117PHbAhxKVMA2DwUiAAAAMDCKBDbUSAOw+7du7PHbQh56623iqMAACyTAhEAAABYGAViOwrE4YhLeuaO3brniiuuKI4AALBMCkQAAABgYRSI7SgQh+PNN9/MHrshZM+ePcVRAACWRYEIAAAALIwCsR0F4rDcf//92eO37jnuuONGhw8fLo4CALAMCkQAAABgYRSI7SgQh+fyyy/PHsN1z86dO4sjAAAsgwIRAAAAWBgFYjsKxOF56623ssdwCNm/f39xFACARVMgAgAAAAujQGxHgThMDz74YPY4rntOP/300eeff14cBQBgkRSIAAAAwMIoENtRIA7XFVdckT2W656bb765OAIAwCIpEAEAAICFUSC2o0AcrnfeeSd7LIeQl19+uTgKAMCiKBABAACAhVEgtqNAHLaHHnooezzXPVu3bi2OAACwKApEAAAAYGEUiO0oENm+fXv2mK57du/eXRwBAGARFIgAAADAwigQ21Eg8u6772aP6RBy6NCh4igAAH1TIAIAAAALo0BsR4FIePjhh7PHdd1z5ZVXFkcAAOibAhEAAABYGAViOwpESlGm5Y7tuuexxx4rjgAA0CcFIgAAALAwCsR2FIiU3nvvveyxXfecfPLJo08++aQ4CgBAXxSIAAAAwMIoENtRIJLas2dP9viue3bt2lUcAQCgLwpEAAAAYGEUiO0oEKnasWNH9hive55//vniCAAAfVAgAgAAAAujQGxHgUjV+++/nz3G655zzz23OAIAQB8UiAAAAMDCKBDbUSCS88gjj2SP87rnzjvvLI4AANA1BSIAAACwMArEdhSITHLVVVdlj/W654033iiOAADQJQUiAAAAsDAKxHYUiEzywQcfjI499tjs8V7nXHbZZcURAAC6pEAEAAAAFkaB2I4CkWkeffTR7PFe9zz00EPFEQAAuqJABAAAABZGgdiOApFZrr766uwxX+fEyssPP/ywOAIAQBcUiAAAAMDCKBDbUSAyy+HDh0dbtmzJHvd1zs6dO4sjAAB0QYEIAAAALIwCsR0FInXs3bs3e9zXPU899VRxBACAthSIAAAAwMIoENtRIFLXNddckz3265wzzjij2HsAoC0FIgAAALAwCsR2FIjUFfcEHOKlTG+55ZbiCAAAbSgQAQAAgIVRILajQKSJxx57LHv81z2vvPJKcQQAgHkpEAEAAICFUSC2o0CkqXX5mWmSbdu2FXsPAMxLgQgAAAAsjAKxHQUiTX300UeDvJTpvffeWxwBAGAeCkQAAABgYRSI7SgQmcfjjz+efR/WPYcPHy6OAADQlAIRAAAAWBgFYjsKROa1Lj87TXLllVcWew8ANKVABAAAABZGgdiOApF5xaVMjzvuuOz7sc557LHHiiMAADShQAQAAAAWRoHYjgKRNvbt25d9P9Y5J510UrH3AEATCkQAAABgYRSI7SgQaevaa6/NvifrnF27dhV7DwDUpUAEAAAAFkaB2I4CkbY+/vjj0fHHH599X9Y5Bw8eLI4AAFCHAhEAAABYGAViOwpEuvDEE09k35d1zrnnnlvsPQBQhwIRAAAAWBgFYjsKRLoyxEuZ3nnnncXeAwCzKBABAACAhVEgtqNApCuffPLJIC9levjw4eIIAADTKBABAACAhVEgtqNApEv79+/Pvj/rnMsuu6zYewBgmkEViIcOHRr96Ec/Kv4GAAAALJoCsR0FIl0b4qVM9+7dW+w9ADDJoArEcNRRg9tlAAAA2DROOumk0X/8x38Uf6MpBSJd+/TTT0cnnHBC9n1a12zZsqXYewBgksG1aXEJ07iUKQAAALB4v/vd70ZnnXVW8TeaUiDShyeffDL7Pq1zdu7cWew9AJAzuALx5z//+WjPnj3F3wAAAIBF+vd///fRNddcU/yNphSI9OW6667LvlfrnIMHDxZ7DwBUDa5APProo0e7du0q/gYAAAAskl/sbUeBSF/+/ve/D+5SpmeccUax9wBA1eAKRDdrBwAAgOX48MMPRz/4wQ+KvzEPBSJ9GuKlTG+//fZi7wGA1OAKxPiPlR/96EejL774ovgKAAAAsAh+qbc9BSJ9u/7667Pv2Trngw8+KPYeACgNrkAMv/rVr0a33XZb8TcAAABgEdz/sD0FIn377LPPRieddFL2fVvXXHTRRcXeAwClQRaIfuMRAAAAFiuuBBSXL3VFoHYUiCzC008/nX3f1jl79+4t9h4ACIMsEOM/VuKm7fv37y++AgAAAPTpd7/73eiss84q/sa8FIgsyhAvZQoAHDHIAjHs2rVrdPTRRxd/AwAAAPpy6NCh0Y9//GOrDzugQGRRPv/888FdyvSqq64q9h4AGGyBGH76059ahQgAAAA9c+/D7igQWaQhXsr04MGDxd4DwLANukDcs2fP6Be/+IXfgAQAAICe3HbbbaNf/epXxd9oS4HIot1www3Z93BdE6suAYCBF4ghfgMyfhMSAAAA6NZ///d/j6/+8+GHHxZfoS0FIosWv3g/tEuZxi8+AMDQDb5ADP/xH//ht4sAAACgQ1E6RHn4/PPPF1+hCwpEluGZZ57Jvo/rnMOHDxd7DwDDpEAsHH300aOtW7cWfwMAAADmFSsO47KlVvF0T4HIsgztUqbnnXdesecAMEwKxMRvfvObcQAAAID5xIrDn//856Pdu3cXX6FLCkSW5csvvxydfPLJ2fdzXfPoo48Wew8Aw6NArIhViPFbkocOHSq+AgAAANQRKw6jPHTZ0v4oEFmmIV7KFACGSoGYEf/B82//9m+j//zP/3SjdwAAAJhh//79o1/84hfjX8j139H9UiCybLt27cq+p+uaq666qthzABgWBeIE8R88USBGkXjWWWf5DyAAAACoiOLw3//930c//elPXbJ0QRSILNtXX301OuWUU7Lv67rm5ZdfLvYeAIZDgThDXMr0d7/73egHP/jB+DIsUSa6FAsAAABDFauPfvOb34x+9KMfjYvDa665pvgOi6BAZDN49tlns+/rumbLli3FngPAcCgQG9izZ8+4TIxViUcdddT4P5biEi0iIiIiIiIi65z4hdr47+DI0UcfPdq6dev4F25ZPAUim8XQLmUatzwCgCFRILYQ/7EUl2gRERERERERWefEL9QCAADDoUAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAAAojEb/fzPKghirR+siAAAAAElFTkSuQmCC',
          relativePosition: { x: -25, y: 0 },
          width: 550,
        },
        {
          columns: [
            // matricule du vehicule
            {
              text: this.vehicule.matricule,
              bold: true,
              fontSize: 15,
              margin: [70, 18, 0, 0],
            },
            //date de création du fichier
            {
              text: this.datepipe.transform(this.date, 'dd/MM/y'),
              margin: [100, 8, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // marque vehicule
            {
              text: this.vehicule.marque,
              bold: true,
              fontSize: 12,
              margin: [70, 15, 0, 0],
              width: 'auto',
            },
            // modele vehicule
            {
              text: this.vehicule.modele,
              bold: true,
              fontSize: 12,
              margin: [70, 15, 0, 0],
            },
          ],
        },
        {
          columns: [
            // couleur du vehicule
            {
              text: this.vehicule.couleur,
              bold: true,
              fontSize: 12,
              margin: [70, 15, 0, 0],
              width: 'auto',
            },
            // type carosserie
            {
              text: nomCarosserie[0] + '\n' + nomCarosserie[1],
              bold: true,
              fontSize: 9,
              margin: [91, 18.5, 0, 0],
            },
          ],
        },
        {
          columns: [
            // kilométrage actuel du vehicule
            {
              text: 'Kilométrage actuel:',
              width: 'auto',
              margin: [3, 40, 0, 0],
              fontSize: 12,
            },
            {
              text: this.vehicule.kmactuel,
              bold: true,
              margin: [183, 40, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage du prochain vidange huile moteur
            {
              text: 'Prochain vidange huile de moteur dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainVidangeHuileMoteur -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [76, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage prochain vidange liquide de refroidissement
            {
              text: 'Prochain vidange liquide de refroidissement dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainVidangeLiquideRefroidissement -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [20, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage prochain vidange huile boite de vitesse
            {
              text: 'Prochain vidange huile boite de vitesse dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainVidangeHuileBoiteVitesse -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [47, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage prochain changement filtre de climatiseur
            {
              text: 'Prochain changement filtre de climatiseur dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainChangementFiltreClimatiseur -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [32, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage Prochain changement filtre de carburant
            {
              text: 'Prochain changement filtre de carburant dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainChangementFiltreCarburant -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [40.5, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage Prochain changement des bougies
            {
              text: 'Prochain changement des bougies dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainChangementBougies -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [70, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage Prochain changement des courroies
            {
              text: 'Prochain changement des courroies dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainChangementCourroies -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [62.5, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // kilométrage Prochain changement des pneus
            {
              text: 'Prochain changement des pneus dans:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text:
                this.vehicule.kilometrageProchainChangementPneus -
                this.vehicule.kmactuel +
                ' Km',
              bold: true,
              margin: [80, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // Consommation normale
            {
              text: 'Consommation normale:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text: this.vehicule.consommationNormale + 'L/100Km',
              bold: true,
              margin: [155.5, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // Consommation actuelle
            {
              text: 'Consommation actuelle:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text: this.vehicule.consommation + 'L/100km',
              bold: true,
              margin: [157.5, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // Date du prochaine visite technique
            {
              text: 'Date du prochaine visite technique:',
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text: this.datepipe.transform(
                this.vehicule.datevisite,
                'dd/MM/y'
              ),
              bold: true,
              margin: [101, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // Date d'expiration d'assurance
            {
              text: "Date d'expiration d'assurance:",
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text: this.datepipe.transform(
                this.vehicule.dateassurance,
                'dd/MM/y'
              ),
              bold: true,
              margin: [129, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        {
          columns: [
            // Date d'expiration des taxes
            {
              text: "Date d'expiration des taxes:",
              width: 'auto',
              margin: [3, 0, 0, 0],
              fontSize: 12,
            },
            {
              text: this.datepipe.transform(this.vehicule.datetaxe, 'dd/MM/y'),
              bold: true,
              margin: [141, 0, 0, 0],
              fontSize: 12,
            },
          ],
        },
        // Historique Des Entretiens
        {
          text: 'Historique Des Entretiens',
          Style: 'header',
          fontSize: 18,
          bold: true,
          margin: [20, 30, 0, 15],
        },
        this.table(this.listeEntretiensAfficher, [
          'date',
          'kilometrage',
          'lieuIntervention',
          'description',
        ]),
      ],
    };
  }

  // afficher le fichier pdf
  printPage() {
    const fichierPDF = this.creerRapport(); //création du fichier
    pdfMake.createPdf(fichierPDF).open(); //lancement du fichier
  }

  //création du tableau historique des entretiens du vehicule
  buildTableBody(data: any, columns: any) {
    var body = [];

    body.push(['Date', 'Kilométrage', "Lieu d'intervention", 'Description']);

    data.forEach(function (row: any) {
      var dataRow: any = [];

      columns.forEach(function (column: any) {
        dataRow.push(row[column].toString());
      });

      body.push(dataRow);
    });

    return body;
  }

  // insérer le tableau  historique des entretiens dans le fichier pdf
  table(data: any, columns: any) {
    return {
      table: {
        dontBreakRows: true,
        headerRows: 1,
        body: this.buildTableBody(data, columns),
        widths: [100, 100, 100, '*'],
      },
    };
  }

  // ouvrir boite de dialogue historique consommation
  ouvrirHistoriqueConsommation() {
    const dialogRef = this.dialog.open(HistoriqueConsommation, {
      width: '800px',
      maxHeight: '80vh',
      data: { vehicule: this.vehicule },
    });
  }
}

//********************************************Boite de dialogue mise a jour vehicule ***********************************
/**
 * Cette boite de dialogue permet de modifier les informations d'un vehicule
 * Liste des méthodes:
    -chargerVehicule: get vehicule par id.
    - getCarburant: get liste des carburants.
    - fermerMiseAJourVehicule: fermer boite de dialogue mise a jour vehicule.
    - miseAJourVehicule: Enregistrer les modifications.
    - activerModificationKmActuel: activer l'input de modification kilométrage actuel.
    - desactiverModificationKmActuel: desactiver input modification kilométrage actuel.
 */

@Component({
  selector: 'app-maj-vehicule',
  templateUrl: './maj-vehicule.html',
  styleUrls: ['./maj-vehicule.scss'],
})
export class MajVehiculeComponent implements OnInit {
  //declaration des variables
  form: FormGroup;
  vehicule: any;
  idVehicule: any;
  carburants: any;
  kmActuelDesactive = true;

  //constructeur
  constructor(
    public dialogRef: MatDialogRef<MajVehiculeComponent>,
    public fb: FormBuilder,
    public service: VehiculeService,
    public _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.idVehicule = this.data.id; //charger l'id du vehicule à mettre a jour
    await this.chargerVehicule(this.idVehicule);
    await this.getCarburant();
    this.form = this.fb.group({
      kmactuel: [{ value: this.vehicule.kmactuel, disabled: true }],
      kmProchainVidangeHuileMoteur: [
        this.vehicule.kilometrageProchainVidangeHuileMoteur,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainVidangeLiquideRefroidissement: [
        this.vehicule.kilometrageProchainVidangeLiquideRefroidissement,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainVidangeHuileBoiteVitesse: [
        this.vehicule.kilometrageProchainVidangeHuileBoiteVitesse,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainChangementFiltreClimatiseur: [
        this.vehicule.kilometrageProchainChangementFiltreClimatiseur,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainChangementFiltreCarburant: [
        this.vehicule.kilometrageProchainChangementFiltreCarburant,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainChangementBougies: [
        this.vehicule.kilometrageProchainChangementBougies,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainChangementCourroies: [
        this.vehicule.kilometrageProchainChangementCourroies,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      kmProchainChangementPneus: [
        this.vehicule.kilometrageProchainChangementPneus,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          kmactuelValidator,
        ],
      ],
      consommationnormale: [
        this.vehicule.consommationNormale,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      carburant: [this.vehicule.carburant, [Validators.required]],
      datevisite: [new Date(this.vehicule.datevisite), [Validators.required]],
      dateassurance: [
        new Date(this.vehicule.dateassurance),
        [Validators.required],
      ],
      datetaxe: [new Date(this.vehicule.datetaxe), [Validators.required]],
    });
  }

  // get vehicule par id
  async chargerVehicule(id: any) {
    this.vehicule = await this.service.vehicule(id).toPromise();
    localStorage.setItem('kmactuelV', this.vehicule.kmactuel);
  }

  // get liste des carburants
  async getCarburant() {
    this.carburants = await this.service.carburants().toPromise();
  }

  // activer l'input de modification kilométrage actuel
  activerModificationKmActuel() {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Pour eviter les fautes de calcul de la consommation, cette action va supprimer les enregistrement qui ne sont pas encores enregistrées dans l'historique de consommation et va supposer que le vehicule est en plein carburant. Veuillez faire un plein avant de procéder!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ok',
      cancelButtonText: 'annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Mot de passe',
          input: 'password',
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          confirmButtonText: 'ok',
          showLoaderOnConfirm: true,
          preConfirm: (pass) => {
            if (pass !== 'infonet') {
              Swal.showValidationMessage(`Mot de passe incorrecte`);
            }
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            this.kmActuelDesactive = false;
            this.form.get('kmactuel').enable();
            this.form
              .get('kmactuel')
              .setValidators([
                Validators.required,
                Validators.pattern('^[0-9]*$'),
                kmactuelValidator,
              ]);
          }
        });
      }
    });
  }

  // desactiver input modification kilométrage actuel
  desactiverModificationKmActuel() {
    this.kmActuelDesactive = true;
    this.form.get('kmactuel').setValidators([]);
    this.form.get('kmactuel').setValue(this.vehicule.kmactuel);
    this.form.get('kmactuel').disable();
  }

  // fermer boite de dialogue mise a jour vehicule
  fermerMiseAJourVehicule(): void {
    this.dialogRef.close();
  }

  // Enregistrer les modifications
  async miseAJourVehicule() {
    var formData: any = new FormData();
    formData.append('id', this.idVehicule);
    formData.append('kmActuel', this.form.get('kmactuel').value);
    formData.append(
      'kilometrageProchainVidangeHuileMoteur',
      this.form.get('kmProchainVidangeHuileMoteur').value
    );
    formData.append(
      'kilometrageProchainVidangeLiquideRefroidissement',
      this.form.get('kmProchainVidangeLiquideRefroidissement').value
    );
    formData.append(
      'kilometrageProchainVidangeHuileBoiteVitesse',
      this.form.get('kmProchainVidangeHuileBoiteVitesse').value
    );
    formData.append(
      'kilometrageProchainChangementFiltreClimatiseur',
      this.form.get('kmProchainChangementFiltreClimatiseur').value
    );
    formData.append(
      'kilometrageProchainChangementFiltreCarburant',
      this.form.get('kmProchainChangementFiltreCarburant').value
    );
    formData.append(
      'kilometrageProchainChangementBougies',
      this.form.get('kmProchainChangementBougies').value
    );
    formData.append(
      'kilometrageProchainChangementCourroies',
      this.form.get('kmProchainChangementCourroies').value
    );
    formData.append(
      'kilometrageProchainChangementPneus',
      this.form.get('kmProchainChangementPneus').value
    );
    formData.append(
      'consommationNormale',
      this.form.get('consommationnormale').value
    );
    formData.append('carburant', this.form.get('carburant').value);
    formData.append(
      'distanceparcourie',
      Number(this.form.get('kmactuel').value) - Number(this.vehicule.kmactuel)
    );
    formData.append('datevisite', new Date(this.form.get('datevisite').value));
    formData.append(
      'dateassurance',
      new Date(this.form.get('dateassurance').value)
    );
    formData.append('datetaxe', new Date(this.form.get('datetaxe').value));
    let reservoir = this.kmActuelDesactive ? this.vehicule.reservoir : 100;
    let historiqueConsommation = this.kmActuelDesactive
      ? this.vehicule.historiqueConsommation
      : '';
    formData.append('reservoir', reservoir);
    formData.append('historique', historiqueConsommation);
    Swal.fire({
      title: 'Voulez vous enregistrer les modifications?',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.miseajourvehicule(formData).toPromise();
        this.fermerMiseAJourVehicule();
        Swal.fire('Modifications enregistrées!', '', 'success');
      }
    });
  }
}

//****************************************** */ Boite de dialogue mise a jour consommation **********************************
/**
 * Cette bpoite de dialogue permet de modifier le kilométrage actuel, la consommation et permet d'enregistrer les trois derniéres 
   historiques de consommation.
 * Liste des methodes:
   - getCarburant: get carburant par nom carburant.
   - getChauffeurs: get liste des chauffeurs.
   - formatLabel: formatter la valeur du label qui s'affiche lors du changement du position du slider.
   - afficherChauffeur: afficher le nom du chauffeur lors du saisie de l'id.
   - changerHistorique: changer l'historique de consommation enregistré dans vehicule.
   - calculerConsommationActuelle: calculer la consommation d'une vehicule dans une distance parcourie par un chauffeur.
   - calculerConsommation: calculer la consommation moyenne de tout les chauffeur qui ont circuler avec le vehicule avant de faire un nouveau plein.
   - calculerDitanceParcourue: calculer la distance parcourie depuis le dernier enregistrement.
   - remplirReservoir: activer mode remplissage reservoir.
   - calculerQuantiteCarburant: calculer quantité de carburant consommé depuis le dernier plein.
   - calculerConsommationRemplissage: calculer consommation global aprés le plein (quantiteCarburant*100)/distance parcourue entre 2 pleins.
   - enregistrer: enregistrer les modification de kilométrage actuel du vehicul, consommation, les historiques et la consommation.
   - fermerMiseAJourConsommation: fermer la boite de dialogue.
   - get montantConsomme: get formControl montantConsomme.
   - get idChauffeur: get formControl idChauffeur.
   - get kmActuel: get formControl kmActuel.
   - testerReservoirPlein: tester si le reservoir est initialement plein.
   - getTypeVehicule: get type vehicule.
 */
@Component({
  selector: 'app-maj-consommation',
  templateUrl: './maj-consommation.html',
  styleUrls: ['./maj-consommation.scss'],
})
export class MiseAJourConsommationComponent implements OnInit {
  reservoir: number = 0;
  mission: any;
  vehicule: any;
  carburant: any;
  consommationActuelle: number = 0;
  distanceParcourue: number = 0;
  form: FormGroup;
  chauffeurs: any;
  chauffeur = '';
  idInvalide = false;
  reservoirEstPlein = false;
  modeManuel = false;
  typeVehicule: string;

  checkBoxRemplirreservoir = false;
  sliderReservoirEstActive = true;
  constructor(
    private dialogRef: MatDialogRef<MiseAJourConsommationComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private service: VehiculeService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.service.getConfigurationApplication().subscribe((data) => {
      this.modeManuel = data.modeManuel;
      this.form = this.fb.group({
        kmActuel: [
          0,
          [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            kmactuelValidator,
            kmactuelConsommationValidator,
          ],
        ],
        idChauffeur: [
          '',
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        montantConsomme: [
          { value: '', disabled: true },
          [Validators.required, Validators.pattern('[+]?([0-9]*[.])?[0-9]+')],
        ],
      });
      this.vehicule = this.data.vehicule;
      this.reservoir = this.vehicule.reservoir;
      this.kmActuel.setValue(this.vehicule.kmactuel);
      localStorage.setItem('kmactuelV', this.vehicule.kmactuel);
      localStorage.setItem(
        'capaciteReservoir',
        this.vehicule.capaciteReservoir
      );
      localStorage.setItem('reservoir', this.vehicule.reservoir);
      localStorage.setItem(
        'consommationNormale',
        this.vehicule.consommationNormale
      );
      this.getCarburant();
      this.getChauffeurs();
      this.reservoirEstPlein = this.testerReservoirPlein();
      this.getTypeVehicule();
    });
  }

  // tester si le reservoir est initialement plein
  testerReservoirPlein() {
    return this.vehicule.reservoir === 100 ? true : false;
  }

  // get carburant par nom carburant
  getCarburant() {
    this.service.carburant(this.vehicule.carburant).subscribe((carburant) => {
      this.carburant = carburant;
    });
  }

  // get liste des chauffeurs
  getChauffeurs() {
    console.log(this.modeManuel);
    if (this.modeManuel) {
      this.service.getChauffeursManuel().subscribe((chauffeurs) => {
        this.chauffeurs = chauffeurs;
      });
    } else {
      this.service.getChauffeurs().subscribe((chauffeurs) => {
        this.chauffeurs = chauffeurs;
      });
    }
  }

  // formatter la valeur du label qui s'affiche lors du changement du position du slider
  formatLabel(value: number) {
    return value + '%';
  }

  // afficher le nom du chauffeur lors du saisie de l'id
  afficherChauffeur() {
    if (
      this.chauffeurs.filter(
        (chauffeur: any) => chauffeur.id_Employe == this.idChauffeur.value
      )[0]
    ) {
      this.chauffeur = this.chauffeurs.filter(
        (chauffeur: any) => chauffeur.id_Employe == this.idChauffeur.value
      )[0].nom;
      this.idInvalide = false;
    } else {
      this.chauffeur = 'Id chauffeur invalide';
      this.idInvalide = true;
    }
  }

  // changer l'historique de consommation enregistré dans vehicule
  changerHistorique() {
    let historique = this.vehicule.historiqueConsommation;
    this.calculerDitanceParcourue();
    if (this.checkBoxRemplirreservoir) {
      this.consommationActuelle = this.calculerConsommationRemplissage();
    }
    historique +=
      '#idChauffeur:' +
      this.idChauffeur.value +
      '/distance:' +
      this.distanceParcourue +
      '/consommation:' +
      this.consommationActuelle +
      '/nomChauffeur:' +
      this.chauffeur;
    return historique;
  }

  // calculer la consommation d'une vehicule dans une distance parcourie par un chauffeur
  calculerConsommationActuelle() {
    if (this.checkBoxRemplirreservoir) {
      this.consommationActuelle = this.calculerConsommationRemplissage();
    } else {
      this.calculerDitanceParcourue();
      let carburantConsomme =
        ((this.vehicule.reservoir - this.reservoir) *
          this.vehicule.capaciteReservoir) /
        100;
      let consommation = (carburantConsomme * 100) / this.distanceParcourue;
      this.consommationActuelle =
        Math.round((consommation + Number.EPSILON) * 100) / 100;
    }
  }

  // calculer la consommation moyenne de tout les chauffeur qui ont circuler avec le vehicule avant de faire un nouveau plein
  calculerConsommation() {
    let sommeConsommations = 0;
    let consommation = 0;
    let historiques = this.vehicule.historiqueConsommation.split('#');
    if (historiques.length > 1) {
      for (let i = 1; i < historiques.length; i++) {
        const historique = historiques[i];
        sommeConsommations += Number(historique.split('/')[2].split(':')[1]);
      }
    }
    sommeConsommations += this.consommationActuelle;
    consommation = sommeConsommations / historiques.length;
    return consommation;
  }

  // calculer la distance parcourie depuis le dernier enregistrement
  calculerDitanceParcourue() {
    let distanceParcourue = this.kmActuel.value - this.vehicule.kmactuel;
    this.distanceParcourue = distanceParcourue;
  }

  // activer mode remplissage reservoir
  remplirReservoir() {
    if (this.checkBoxRemplirreservoir) {
      this.reservoir = 100;
      this.sliderReservoirEstActive = false;
      this.montantConsomme.enable();
    } else {
      this.sliderReservoirEstActive = true;
      this.reservoir = this.vehicule.reservoir;
      this.montantConsomme.disable();
    }
  }

  // calculer quantité de carburant consommé depuis le dernier plein
  calculerQuantiteCarburant() {
    return this.montantConsomme.value / this.carburant.prixCarburant;
  }

  // calculer consommation global aprés le plein (quantiteCarburant*100)/distance parcourue entre 2 pleins
  calculerConsommationRemplissage() {
    let quantiteCarburant = this.calculerQuantiteCarburant();
    let historiques = this.vehicule.historiqueConsommation.split('#');
    let distanceParcourue = 0;
    if (historiques.length > 1) {
      for (let i = 1; i < historiques.length; i++) {
        const historique = historiques[i];
        distanceParcourue += Number(historique.split('/')[1].split(':')[1]);
      }
    }
    distanceParcourue += this.kmActuel.value - this.vehicule.kmactuel;
    let consommation = (quantiteCarburant * 100) / distanceParcourue;
    return Math.round((consommation + Number.EPSILON) * 100) / 100;
  }

  // enregistrer les modification de kilométrage actuel du vehicul, consommation, les historiques et la consommation
  enregistrer() {
    let consommation: any;
    let historique = '';
    let historiqueA = '';
    let historiqueB = '';
    let historiqueC = '';
    if (this.checkBoxRemplirreservoir) {
      consommation = this.calculerConsommationRemplissage();
      this.consommationActuelle = consommation;
      historiqueA = this.changerHistorique();
      historiqueB = this.vehicule.historiqueA;
      historiqueC = this.vehicule.historiqueB;
    } else {
      consommation = this.calculerConsommation();
      this.calculerConsommationActuelle();
      historique = this.changerHistorique();
      historiqueA = this.vehicule.historiqueA;
      historiqueB = this.vehicule.historiqueB;
      historiqueC = this.vehicule.historiqueC;
    }
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (this.typeVehicule === 'privé') {
          await this.service
            .modifierConsommation(
              this.vehicule.id,
              this.kmActuel.value,
              consommation,
              historique,
              historiqueA,
              historiqueB,
              historiqueC,
              this.reservoir
            )
            .toPromise();
        } else if (this.typeVehicule === 'loué') {
          await this.service
            .modifierConsommationVehiculeLoue(
              this.vehicule.id,
              this.kmActuel.value,
              consommation,
              historique,
              historiqueA,
              historiqueB,
              historiqueC,
              this.reservoir
            )
            .toPromise();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Type vehicule invalide! Verifier les données de votre vehicule.',
          });
        }
        this.fermerMiseAJourConsommation();
        Swal.fire('Consommation enregistrée!', '', 'success');
      }
    });
  }

  // fermer la boite de dialogue
  fermerMiseAJourConsommation(): void {
    this.dialogRef.close();
  }

  // get type vehicule
  getTypeVehicule() {
    this.service
      .getMatriculesVehiculesPrives()
      .subscribe((matriculesPrivesData: any) => {
        this.service
          .getMatriculesVehiculesLoues()
          .subscribe((matriculesLouesData: any) => {
            let matriculesPrives = matriculesPrivesData;
            let matriculesLoues = matriculesLouesData;
            let matriculeEstPrive =
              matriculesPrives.filter(
                (matricule: any) => matricule == this.vehicule.matricule
              ).length > 0;
            let matriculeEstLoue =
              matriculesLoues.filter(
                (matricule: any) => matricule == this.vehicule.matricule
              ).length > 0;
            if (matriculeEstPrive) {
              this.typeVehicule = 'privé';
            } else if (matriculeEstLoue) {
              this.typeVehicule = 'loué';
            }
          });
      });
  }

  // get formControl montantConsomme
  get montantConsomme() {
    return this.form.get('montantConsomme');
  }

  // get formControl idChauffeur
  get idChauffeur() {
    return this.form.get('idChauffeur');
  }

  // get formControl kmActuel
  get kmActuel() {
    return this.form.get('kmActuel');
  }
}

//********************************************* */ Boite de dialogue notification ****************************************
/**
 * Cette boite de dialogue permet d'afficher les notification disponibles pour un vehicule
 * Liste des méthodes:
  - chargerVehicule: get vehicule par identifiant.
  - testerExistanceReclamation: tester s'il y a une reclamation qui existe ou non.
  - fermerNotification: fermer la boite du dialogue notification.
  - supprimerReclamation: supprimer reclamation.
  - testExistanceEntretien: teste s'il y a un entretien dans les 1000 prochains km.
  - testExpirationVisite: tester s'il y a une visite technique dans les 30 prochains jours.
  - testExpirationAssurance: tester si l'assurance s'expire dans les 30 prochains jours.
  - testExpirationTaxe: tester si les taxes s'expirent dans les 30 prochains jours.
  - testConsommation: tester si la consommation est anormale avec 1L/100 ou plus de differnece entre elle et la consommation normale.
  - testePresenceNotification: réaliser les testes précedent et prendre la decision d'affichage des notifications ou non.
 */
@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss'],
})
export class NotificationComponent implements OnInit {
  //declaration des variables
  idVehicule: any;
  vehicule: any;
  kmRestantPourProchainEntretien = 0;
  reclamationExiste = false;
  entretienExiste = false;
  visiteExiste = false;
  assuranceExiste = false;
  taxeExiste = false;
  consommationAnormale = false;
  notificationExiste = false;
  datePresent = new Date();
  carburantConsomme: any;
  consommationActuelle: any;
  listeEntretien: any = [];

  // variables de droits d'accés
  nom: any;
  acces: any;
  tms: any;

  //consructeur
  constructor(
    public dialogRef: MatDialogRef<NotificationComponent>,
    public service: VehiculeService,
    public _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }
  async ngOnInit() {
    this.idVehicule = this.data.id; //charger id vehicule
    await this.chargerVehicule();
    this.testerExistanceReclamation();
    this.testePresenceNotification();
  }

  //get vehicule par identifiant
  async chargerVehicule() {
    this.vehicule = await this.service.vehicule(this.idVehicule).toPromise();
  }

  // tester s'il y a une reclamation qui existe ou non
  testerExistanceReclamation() {
    let sujetExiste = this.vehicule.sujet.toString() === '';
    if (sujetExiste) {
      this.reclamationExiste = false;
    } else {
      this.reclamationExiste = true;
    }
  }

  //fermer la boite du dialogue notification
  fermerNotification(): void {
    this.dialogRef.close();
  }

  //supprimer reclamation
  async supprimerReclamation() {
    // supprimer la reclamation
    var formData: any = new FormData();
    formData.append('id', this.idVehicule);
    formData.append('sujet', '');
    formData.append('description', '');
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous allez supprimer la reclamation!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Supprimer!',
      cancelButtonText: 'Annuler',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.reclamationvehicule(formData).toPromise();
        Swal.fire('Supprimé!', 'La réclamation a été supprimée.', 'success');
      }
    });
    this.reclamationExiste = false;
  }

  //teste s'il y a un entretien dans les 1000 prochains km
  testExistanceEntretien() {
    let listeEntretien = [
      {
        type: 'Vidange huile moteur',
        kilometrage: this.vehicule.kilometrageProchainVidangeHuileMoteur,
      },
      {
        type: 'Vidange liquide de refroidissement',
        kilometrage:
          this.vehicule.kilometrageProchainVidangeLiquideRefroidissement,
      },
      {
        type: 'Vidange huile boite de vitesse',
        kilometrage: this.vehicule.kilometrageProchainVidangeHuileBoiteVitesse,
      },
      {
        type: 'Changement du filtre climatiseur',
        kilometrage:
          this.vehicule.kilometrageProchainChangementFiltreClimatiseur,
      },
      {
        type: 'Changement du filtre essence/gazoil',
        kilometrage: this.vehicule.kilometrageProchainChangementFiltreCarburant,
      },
      {
        type: 'Changement des bougies',
        kilometrage: this.vehicule.kilometrageProchainChangementBougies,
      },
      {
        type: 'Changement des courroies',
        kilometrage: this.vehicule.kilometrageProchainChangementCourroies,
      },
      {
        type: 'Changement des pneus',
        kilometrage: this.vehicule.kilometrageProchainChangementPneus,
      },
    ];
    this.listeEntretien = listeEntretien.filter(
      (entretien) => entretien.kilometrage - this.vehicule.kmactuel < 1000
    );
    if (this.listeEntretien.length > 0) {
      this.entretienExiste = true;
    } else {
      this.entretienExiste = false;
    }
  }

  //tester s'il y a une visite technique dans les 30 prochains jours
  testExpirationVisite() {
    let dateVisite = new Date(this.vehicule.datevisite);
    var DifferenceVisite = dateVisite.getTime() - this.datePresent.getTime();
    var DifferenceVisiteJ = DifferenceVisite / (1000 * 3600 * 24);
    if (DifferenceVisiteJ < 30) {
      this.visiteExiste = true;
    } else {
      this.visiteExiste = false;
    }
  }

  //tester si l'assurance s'expire dans les 30 prochains jours
  testExpirationAssurance() {
    let dateAssurance = new Date(this.vehicule.dateassurance);
    var DifferenceAssurance =
      dateAssurance.getTime() - this.datePresent.getTime();
    var DifferenceAssuranceJ = DifferenceAssurance / (1000 * 3600 * 24);
    if (DifferenceAssuranceJ < 30) {
      this.assuranceExiste = true;
    } else {
      this.assuranceExiste = false;
    }
  }

  //tester si les taxes s'expirent dans les 30 prochains jours
  testExpirationTaxe() {
    let dateTaxe = new Date(this.vehicule.datetaxe);
    var DifferenceTaxe = dateTaxe.getTime() - this.datePresent.getTime();
    var DifferenceTaxeJ = DifferenceTaxe / (1000 * 3600 * 24);
    if (DifferenceTaxeJ < 30) {
      this.taxeExiste = true;
    } else {
      this.taxeExiste = false;
    }
  }

  //tester si la consommation est anormale avec 1L/100 ou plus de differnece entre elle et la consommation normale
  testConsommation() {
    this.consommationActuelle = this.vehicule.consommation;
    if (this.vehicule.consommationNormale + 1 < this.consommationActuelle) {
      this.consommationAnormale = true;
    } else {
      this.consommationAnormale = false;
    }
  }

  //réaliser les testes précedent et prendre la decision d'affichage des notifications ou non
  testePresenceNotification() {
    this.testExistanceEntretien();
    this.testExpirationVisite();
    this.testExpirationAssurance();
    this.testExpirationTaxe();
    this.testConsommation();
    let notificationEstExistante =
      this.taxeExiste ||
      this.assuranceExiste ||
      this.visiteExiste ||
      this.entretienExiste ||
      this.reclamationExiste ||
      this.consommationAnormale;
    if (notificationEstExistante) {
      this.notificationExiste = false;
    } else {
      this.notificationExiste = true;
    }
  }
}

//*****************************************************Boite de dialogue reclamation *********************************************
/**
 * Cette boite de dialogue permet de saisir une réclamation concernant un vehicule
 * Liste des méthodes:
  - chargerVehicule: get vehicule par identifiant.
  - fermerReclamation: fermer la boite de dialogue.
  - enregistrerReclamation: enregistre la reclamation.
 */
@Component({
  selector: 'app-reclamation',
  templateUrl: './reclamation.html',
  styleUrls: ['./reclamation.scss'],
})
export class ReclamationComponent implements OnInit {
  //declaration des variables
  form: FormGroup;
  idVehicule: any;
  vehicule: any;

  //constructeur
  constructor(
    public dialogRef: MatDialogRef<ReclamationComponent>,
    public fb: FormBuilder,
    public service: VehiculeService,
    public _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sujet: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.idVehicule = this.data.id;
    this.chargerVehicule();
  }

  // get vehicule par identifiant
  async chargerVehicule() {
    this.vehicule = await this.service.vehicule(this.idVehicule).toPromise();
  }

  //fermer la boite de dialogue
  fermerReclamation(): void {
    this.dialogRef.close();
  }

  //enregistre la reclamation
  async enregistrerReclamation() {
    var formData: any = new FormData();
    formData.append('id', this.idVehicule);
    formData.append('sujet', this.form.get('sujet').value);
    formData.append('description', this.form.get('description').value);
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.reclamationvehicule(formData).toPromise();
        this.dialogRef.close();
        Swal.fire('Réclamation enregistrée!', '', 'success');
      }
    });
  }
}

// ********************************Boite dialogue entretien ******************************************
/**
 * Cette Boite de dialogue permet de faire le saisie de l'entretient passé recement et de modifier le kilométrage du prochain entretien
 * Liste des methodes:
  - selectionnerVidangeHuileMoteur: si on selectionne le type de vidange huile moteur on  met les valeur de filtre à huile et filtre à air a 'true' car il sont obligatoire a changer.
  - changerEtatInput: si on selectionne un checkbox son input sera activé si non on le desactive.
  - tetsterValidite: teste s'il ya au moins un check box selectionné.
  - fermerBoiteDialogueEntretien: fermer la boite de dilaogue entretien.
  - valider: enregistrer les modifications.
 */
@Component({
  selector: 'boite-dialogue-entretien',
  templateUrl: 'boite-dialogue-entretien.html',
  styleUrls: ['boite-dialogue-entretien.scss'],
})
export class BoiteDialogueEntretien implements OnInit {
  form: FormGroup;
  date: Date = new Date();
  valide = false;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BoiteDialogueEntretien>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public service: VehiculeService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      lieuIntervention: ['', [Validators.required]],
      huileMoteur: false,
      prochainVidangeHuileMoteur: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      liquideRefroidissement: false,
      prochainVidangeLiquideRefroidissement: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      huileBoiteVitesse: false,
      prochainVidangeHuileBoiteVitesse: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      filtreHuile: false,
      filtreAir: false,
      filtreClimatiseur: false,
      prochainChangementFiltreClimatiseur: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      filtrCarburant: false,
      prochainChangementFiltrCarburant: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      bougies: false,
      prochainChangementBougies: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      courroies: false,
      prochainChangementCourroies: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      pneus: false,
      prochainChangementPneus: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      reparation: false,
      noteReparation: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  // si on selectionne le type de vidange huile moteur on  met les valeur de filtre à huile et filtre à air a 'true' car il sont obligatoire a changer
  selectionnerVidangeHuileMoteur() {
    if (this.form.get('huileMoteur').value) {
      this.form.get('filtreHuile').setValue(true);
      this.form.get('filtreAir').setValue(true);
    } else {
      this.form.get('filtreHuile').enable();
      this.form.get('filtreAir').enable();
    }
  }

  // si on selectionne un checkbox son input sera activé si non on le desactive
  changerEtatInput(checkBoxFormControlName: any, inputFormControlName: any) {
    this.form.get(checkBoxFormControlName).value
      ? this.form.get(inputFormControlName).enable()
      : this.form.get(inputFormControlName).disable();
    this.tetsterValidite();
  }

  //teste s'il ya au moins un check box selectionné
  tetsterValidite() {
    let listeCheckbox = [
      this.form.get('huileMoteur').value,
      this.form.get('liquideRefroidissement').value,
      this.form.get('huileBoiteVitesse').value,
      this.form.get('filtreHuile').value,
      this.form.get('filtreAir').value,
      this.form.get('filtreClimatiseur').value,
      this.form.get('filtrCarburant').value,
      this.form.get('bougies').value,
      this.form.get('courroies').value,
      this.form.get('pneus').value,
      this.form.get('reparation').value,
    ];
    this.valide = false;
    listeCheckbox.forEach((element) => {
      if (element) {
        this.valide = true;
      }
    });
  }

  // fermer la boite de dilaogue entretien
  fermerBoiteDialogueEntretien() {
    this.dialogRef.close();
  }

  //enregistrer les modifications
  async valider() {
    let formdata: any = new FormData();
    let formdata2: any = new FormData();
    let kilometrageProchainVidangeHuileMoteur;
    let kilometrageProchainVidangeLiquideRefroidissement;
    let kilometrageProchainVidangeHuileBoiteVitesse;
    let kilometrageProchainChangementFiltreClimatiseur;
    let kilometrageProchainChangementFiltreCarburant;
    let kilometrageProchainChangementBougies;
    let kilometrageProchainChangementCourroies;
    let kilometrageProchainChangementPneus;

    //si valeur checkbox est true le kilometrage du prochain entretien =(kilometrage actuel + kilometrage necessaire pour faire un nouveau entretien)
    // sinon le kilometrage reste le meme
    this.form.get('huileMoteur').value
      ? (kilometrageProchainVidangeHuileMoteur =
          this.data.vehicule.kmactuel +
          this.form.get('prochainVidangeHuileMoteur').value)
      : (kilometrageProchainVidangeHuileMoteur =
          this.data.vehicule.kilometrageProchainVidangeHuileMoteur);
    this.form.get('liquideRefroidissement').value
      ? (kilometrageProchainVidangeLiquideRefroidissement =
          this.data.vehicule.kmactuel +
          this.form.get('prochainVidangeLiquideRefroidissement').value)
      : (kilometrageProchainVidangeLiquideRefroidissement =
          this.data.vehicule.kilometrageProchainVidangeLiquideRefroidissement);
    this.form.get('huileBoiteVitesse').value
      ? (kilometrageProchainVidangeHuileBoiteVitesse =
          this.data.vehicule.kmactuel +
          this.form.get('prochainVidangeHuileBoiteVitesse').value)
      : (kilometrageProchainVidangeHuileBoiteVitesse =
          this.data.vehicule.kilometrageProchainVidangeHuileBoiteVitesse);
    this.form.get('filtreClimatiseur').value
      ? (kilometrageProchainChangementFiltreClimatiseur =
          this.data.vehicule.kmactuel +
          this.form.get('prochainChangementFiltreClimatiseur').value)
      : (kilometrageProchainChangementFiltreClimatiseur =
          this.data.vehicule.kilometrageProchainChangementFiltreClimatiseur);
    this.form.get('filtrCarburant').value
      ? (kilometrageProchainChangementFiltreCarburant =
          this.data.vehicule.kmactuel +
          this.form.get('prochainChangementFiltrCarburant').value)
      : (kilometrageProchainChangementFiltreCarburant =
          this.data.vehicule.kilometrageProchainChangementFiltreCarburant);
    this.form.get('bougies').value
      ? (kilometrageProchainChangementBougies =
          this.data.vehicule.kmactuel +
          this.form.get('prochainChangementBougies').value)
      : (kilometrageProchainChangementBougies =
          this.data.vehicule.kilometrageProchainChangementBougies);
    this.form.get('courroies').value
      ? (kilometrageProchainChangementCourroies =
          this.data.vehicule.kmactuel +
          this.form.get('prochainChangementCourroies').value)
      : (kilometrageProchainChangementCourroies =
          this.data.vehicule.kilometrageProchainChangementCourroies);
    this.form.get('pneus').value
      ? (kilometrageProchainChangementPneus =
          this.data.vehicule.kmactuel +
          this.form.get('prochainChangementPneus').value)
      : (kilometrageProchainChangementPneus =
          this.data.vehicule.kilometrageProchainChangementPneus);

    // on ajoute les valeurs de checkbox dans le formData qui va etre utilisé pour créer un nouveau entretien
    formdata.append('idVehicule', this.data.vehicule.id);
    formdata.append('date', this.date);
    formdata.append('kilometrage', this.data.vehicule.kmactuel);
    formdata.append(
      'lieuIntervention',
      this.form.get('lieuIntervention').value
    );
    formdata.append('huileMoteur', this.form.get('huileMoteur').value);
    formdata.append(
      'liquideRefroidissement',
      this.form.get('liquideRefroidissement').value
    );
    formdata.append(
      'huileBoiteVitesse',
      this.form.get('huileBoiteVitesse').value
    );
    formdata.append('filtreHuile', this.form.get('filtreHuile').value);
    formdata.append('filtreAir', this.form.get('filtreAir').value);
    formdata.append(
      'filtreClimatiseur',
      this.form.get('filtreClimatiseur').value
    );
    formdata.append('filtreCarburant', this.form.get('filtrCarburant').value);
    formdata.append('bougies', this.form.get('bougies').value);
    formdata.append('courroies', this.form.get('courroies').value);
    formdata.append('pneus', this.form.get('pneus').value);
    formdata.append('reparation', this.form.get('reparation').value);
    formdata.append('noteReparation', this.form.get('noteReparation').value);

    // on ajoute les valeur des kilometrages prochain entretien pour faire le mise a jour dans le table vehicule
    formdata2.append('id', this.data.vehicule.id);
    formdata2.append(
      'kilometrageProchainVidangeHuileMoteur',
      kilometrageProchainVidangeHuileMoteur
    );
    formdata2.append(
      'kilometrageProchainVidangeLiquideRefroidissement',
      kilometrageProchainVidangeLiquideRefroidissement
    );
    formdata2.append(
      'kilometrageProchainVidangeHuileBoiteVitesse',
      kilometrageProchainVidangeHuileBoiteVitesse
    );
    formdata2.append(
      'kilometrageProchainChangementFiltreClimatiseur',
      kilometrageProchainChangementFiltreClimatiseur
    );
    formdata2.append(
      'kilometrageProchainChangementFiltreCarburant',
      kilometrageProchainChangementFiltreCarburant
    );
    formdata2.append(
      'kilometrageProchainChangementBougies',
      kilometrageProchainChangementBougies
    );
    formdata2.append(
      'kilometrageProchainChangementCourroies',
      kilometrageProchainChangementCourroies
    );
    formdata2.append(
      'kilometrageProchainChangementPneus',
      kilometrageProchainChangementPneus
    );
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.creerEntretien(formdata).toPromise();
        await this.service.majKilometrageEntretien(formdata2).toPromise();
        this.fermerBoiteDialogueEntretien();
        Swal.fire('Entretien enregistrée!', '', 'success');
      }
    });
  }
}
// ********************************************Detail Vehicule Loué***********************************************
/**
 * Cette boite de dialogue permet d'afficher les informations d'un vehicule loué
 * Liste des methodes:
  - fermerDetailVehiculeLoue: fermer la boite de dialogue.
  - testerTypeMatricule: teste le type de matricule.
  - chargerVehiculeLoue: get vehicule loué par identifiant.
  - ouvrirHistoriqueConsommation: ouvrir boite de dialogue historique consommation.
 */
@Component({
  selector: 'app-detail-vehicule-loue',
  templateUrl: './detail-vehicule-loue.html',
  styleUrls: ['./detail-vehicule-loue.scss'],
})
export class DetailVehiculeLoueComponent implements OnInit {
  //declaration des variables
  vehicule: any;
  idVehicule: number;
  tun = false;
  rs = false;
  serie: String;
  numCar: String;
  matRS: String;
  matricule: String;
  constructor(
    public dialogRef: MatDialogRef<DetailVehiculeLoueComponent>,
    public service: VehiculeService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.idVehicule = Number(this.data.id); // ID du vehicule selectionné
    await this.chargerVehiculeLoue();
    this.testerTypeMatricule();
  }

  //get vehicule loué par identifiant
  async chargerVehiculeLoue() {
    this.vehicule = await this.service
      .vehiculeLoue(this.idVehicule)
      .toPromise();
  }

  //teste le type de matricule
  testerTypeMatricule() {
    this.matricule = this.vehicule.matricule;
    if (this.vehicule.matricule.includes('TUN')) {
      this.tun = true;
      this.rs = false;
      this.serie = this.matricule.split('TUN')[0];
      this.numCar = this.matricule.split('TUN')[1];
    }
    if (this.vehicule.matricule.includes('RS')) {
      this.tun = false;
      this.rs = true;
      this.matRS = this.matricule.replace('RS', '');
    }
  }

  //fermer la boite de dialogue
  fermerDetailVehiculeLoue(): void {
    this.dialogRef.close();
  }

  // ouvrir boite de dialogue historique consommation
  ouvrirHistoriqueConsommation() {
    const dialogRef = this.dialog.open(HistoriqueConsommation, {
      width: '800px',
      maxHeight: '80vh',
      data: { vehicule: this.vehicule },
    });
  }
}

//********************************************* Historique Consommation ******************************
/**
 * Cette boite de dialogue permet d'afficher les trois derniéres historiques enregistrées pour un vehicule
 */
@Component({
  templateUrl: 'historique-consommation.html',
  styleUrls: ['historique-consommation.scss'],
})
export class HistoriqueConsommation implements OnInit {
  vehicule: any;
  historiqueA: any = [];
  historiqueB: any = [];
  historiqueC: any = [];
  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {}

  ngOnInit() {
    this.vehicule = this.data.vehicule;
    this.extraireHistorique();
  }

  // formuler des liste d'objets qui contiennent l'historique de consommation
  extraireHistorique() {
    let historiqueA = this.vehicule.historiqueA.split('#');
    let historiqueB = this.vehicule.historiqueB.split('#');
    let historiqueC = this.vehicule.historiqueC.split('#');

    if (historiqueA.length > 1) {
      for (let i = 1; i < historiqueA.length; i++) {
        const historique = historiqueA[i];
        this.historiqueA.push({
          idChauffeur: historique.split('/')[0].split(':')[1],
          distance: historique.split('/')[1].split(':')[1],
          consommation: historique.split('/')[2].split(':')[1],
          nomChauffeur: historique.split('/')[3].split(':')[1],
        });
      }
    }
    if (historiqueB.length > 1) {
      for (let i = 1; i < historiqueB.length; i++) {
        const historique = historiqueB[i];
        this.historiqueB.push({
          idChauffeur: historique.split('/')[0].split(':')[1],
          distance: historique.split('/')[1].split(':')[1],
          consommation: historique.split('/')[2].split(':')[1],
          nomChauffeur: historique.split('/')[3].split(':')[1],
        });
      }
    }
    if (historiqueC.length > 1) {
      for (let i = 1; i < historiqueC.length; i++) {
        const historique = historiqueC[i];
        this.historiqueC.push({
          idChauffeur: historique.split('/')[0].split(':')[1],
          distance: historique.split('/')[1].split(':')[1],
          consommation: historique.split('/')[2].split(':')[1],
          nomChauffeur: historique.split('/')[3].split(':')[1],
        });
      }
    }
  }
}

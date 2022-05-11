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
      background: {
        //definition du fond arriére
        image:
          'data:image/jpeg;base64,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RRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABR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Lj/wQo/6MZ/82Z/bD/8AogqP+IXH/ghR/wBGM/8AmzP7Yf8A9EFQB+/1FfgD/wAQuP8AwQo/6MZ/82Z/bD/+iCo/4hcf+CFH/RjP/mzP7Yf/ANEFQB+/1FfgD/xC4/8ABCj/AKMZ/wDNmf2w/wD6IKj/AIhcf+CFH/RjP/mzP7Yf/wBEFQB+/wBRX4A/8QuP/BCj/oxn/wA2Z/bD/wDogqP+IXH/AIIUf9GM/wDmzP7Yf/0QVAH7/UV+AP8AxC4/8EKP+jGf/Nmf2w//AKIKj/iFx/4IUf8ARjP/AJsz+2H/APRBUAfv9RX4A/8AELj/AMEKP+jGf/Nmf2w//ogqP+IXH/ghR/0Yz/5sz+2H/wDRBUAfv9RX4A/8QuP/AAQo/wCjGf8AzZn9sP8A+iCo/wCIXH/ghR/0Yz/5sz+2H/8ARBUAfv8AUV+AP/ELj/wQo/6MZ/8ANmf2w/8A6IKvv/8AYY/4JcfsJ/8ABNf/AIWj/wAMU/Az/hS//C6P+EJ/4WX/AMXN+MXxG/4SX/hXP/CXf8Ib/wAlZ+IPjv8Asf8Asf8A4TvxX/yAP7K/tD+1f+Jr9u+w6b9jAPv+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9k=',
        width: 595.28,
        height: 841.89,
      },
      content: [
        //contenue du fichier PDF
        {
          image:
            'data:image/png;base64,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RERERESGE6BKgdjO//7f/3v0X//1XzKAHHvssaMTTzxxdMYZZ4wuuOCC0aWXXjrasWPH6Prrrx/dcssto7/+9a+jBx98cFxUvvTSS6NDhw6NPv300+InBQCgHQVir3ITCCIiIiIiMpwAVQrEdhSIUidROm7btm109dVXj/7yl7+MV52+8MIL41WO3377bfHTBAAwmQKxV7kJBBERERERGU6AKgViOwpE6SJnnnnmaPv27aM777xzfInVt99+u/gJAwD4BwVir3ITCCIiIiIiMpwAVQrEdhSI0le2bNkyXrX45z//eXzvxsOHDxc/dQDAECkQe5WbQBARERERkeEEqFIgtqNAlEXm3HPPHReKsUrxk08+KX4KAYAhUCD2KjeBICIiIiIiwwlQpUBsR4Eoy8zll18+2rNnj9WJADAACsRe5SYQRERERERkOAGqFIjtKBBls+TSSy8dPfbYY6Nvvvmm+OkEANaJArFXuQkEEREREREZToAqBWI7CkTZbDnppJNGt9122+jtt98ufkoBgHWgQOxVbgJBRERERESGE6BKgdiOAlE2c3bu3Dl68803i59WAGCVKRB7lZtAEBERERGR4QSoUiC2o0CUVcgNN9wwOnToUPFTCwCsIgVir3ITCCIiIiIiMpwAVQrEdhSIskq56aabRp999lnx0wsArBIFYq9yEwgiIiIiIjKcAFUKxHYUiLJqOfnkk0ePPfZY8RMMAKwKBWKvchMIIiIiIiIynABVCsR2FIiyqtm+ffvob3/7W/GTDABsdgrEXuUmEEREREREZDgBqhSI7SgQZdWzb9++4qcZANjMFIi9yk0giIiIiIjIcAJUKRDbUSDKOuTWW28tfqIBgM1Kgdir3ASCiIiIiIgMJ0CVArEdBaKsSy699NLRBx98UPxkAwCbjQKxV7kJBBERERERGU6AKgViOwpEWaeceeaZozfffLP46QYANhMFYq9yEwgiIiIiIjKcAFUKxHYUiLJuOeGEE0YvvfRS8RMOAGwWCsRe5SYQRERERERkOAGqFIjtKBBlXbN///7ipxwA2AwUiL3KTSCIiIiIiMhwAlQpENtRIMo655lnnil+0gGAZVMg9io3gSAiIiIiIsMJUKVAbEeBKOueF154ofhpBwCWSYHYq9wEgoiIiIiIDCdAlQKxHQWirHu2bNkynsMDAJZLgdir3ASCiIiIiIgMJ0CVArEdBaIMISeffPLo3XffLX7qAYBlUCD2KjeBICIiIiIiwwlQpUBsR4EoQ8nFF188+u6774qffABg0RSIvcpNIIiIiIiIyHACVCkQ21EgypByww03FD/5AMCiKRB7lZtAEBERERGR4QSoUiC2o0CUoeXee+8tfvoBgEVSIPYqN4EgIiIiIiLDCVClQGxHgShDzMsvv1z8CwAAFkWB2KvcBIKIiIiIiAwnQJUCsR0Fogwx55133ujbb78t/hUAAIugQOxVbgJBRERERESGE6BKgdiOAlGGmltvvbX4VwAALIICsVe5CQQRERERERlOgCoFYjsKRBlyDhw4UPxLAAD6pkDsVW4CQUREREREhhOgSoHYjgJRhpyzzz579N133xX/GgCAPikQe5WbQBARERERkeEEqFIgtqNAlKHnnnvuKf41AAB9UiD2KjeBICIiIiIiwwlQpUBsR4Eo8l+j9957r/gXAQD0RYHYq9wEgoiIiIiIDCdAlQKxHQWiyH+NrrvuuuJfBADQFwVir3ITCCIiIiIiMpwAVQrEdhSIIv/ISy+9VPyrAAD6oEDsVW4CQUREREREhhOgSoHYjgJR5B+54oorin8VAEAfFIi9yk0giIiIiIjIcAJUKRDbUSCKHIlViADQHwVir3ITCCIiIiIiMpwAVQrEdhSIIkdiFSIA9EeB2KvcBIKIiIiIiAwnQJUCsR0Fosg/xypEAOiHArFXuQkEEREREREZToAqBWI7CkSRf84111xT/OsAALqkQOxVbgJBRERERESGE6BKgdiOAlHkX/PBBx8U/0IAgK4oEHuVm0AQEREREZHhBKhSILazLgXi6aefPtqxY0ejXHXVVeNcffXV48TKs0gck8jOnTtH11577cb/Rq677rpxrr/++nFuuOGGcW688cZxdu3aNc6f/vSn0Z///OdaicfGc+L5MWaMH68Z2xDbFdsY2xv357v88stHl1122eiSSy4ZXXzxxaNt27aNtm7dOrrgggtGZ5999ui0004bnXTSSaMtW7Zkj5PUy+7du4t/IQBAVxSIvcpNIIiIiIiIyHACVCkQ21mXAjH2g3/27bffjj7//PPRxx9/PHrvvfdGb7755ujgwYOjffv2je66665xEXnsscdmj+fQc9ZZZxVHEQDoigKxV7kJBBERERERGU6AKgViOwrEYfvuu+/G81v3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oUOHRq+99tro4MGDo9dff3301ltvjd57773RRx99NPr73/9ePIOcjz/+ePT222+Pj1vMDcdx++KLL4rvUhU/T3GM/ud//mf08ssvj3/2Pvnkk9H3339fPGKYPv/889Hhw4fHxyX+Hcb/xr+/+HfKZN9+++3o/fffH/8sxTGL81mc19rKnf+bRoFYjwIRAAAAWBgFYjsKRNqIEir3fqxDtm3bVuzlaoky8JlnnhmvCr3uuutGW7duHR1//PHZfZyU4447bnT22WePLrvsstH1118/uvvuu0cvvPDC6NNPPy1eZRiimNi3b9/oxhtvHP88xHHJHa9IHOM4ZpdccsnovvvuG73zzjvFKMMSxc6tt946uvzyy0ennXZa9liVOf3000cXXXTR6Oabbx699NJLxQjrJc6Rjz/++Oi2224bbd++fXTmmWdmj0Wak08+eXTeeeeN//3t3LlzvBI6Stihip+Nq666anTWWWdlj1fk/PPPH/35z38ePfHEE+NytqncmE2jQKxHgQgAAAAsjAKxHQUi84oJ7WkTuquee+65p9jTze27774bl3s33XTT6IwzzsjuS5c555xzxhP1sWpq0aKka5O6KwXjeEZhkdv/JolybJllYnw+5o5D3TzwwAPFSNPFuSBKw1mF4azE8+PnOErIVRb/Nm655ZbO/z2ee+654+N84MCB0VdffVW82vLECsDcz03dRJk6Taxu/8Mf/pA9FrNy9dVXj5599tlipNHo1FNPnZrcGE2TG3dahkqBCAAAACyMArEdBSLziInjOitpVjlxmbzNLFYDRkkxbVVc34mfgbvuumthZUZuG5pkVoEYhUOsIMw9t23+8pe/LLz0ic/H3LbUzb333luMlBfF6J/+9Kfsc9smtj1W762KuCxr/NJB2xK1SaLIX+Z5Kj4HcttVN5NKtC+//HK8ejr3nKa5+OKLx4V07nvLzlApEAEAAICFUSC2o0CkqZiMPeGEE7Lvw7okVq9sZrGqLVbw5LZ9GYnS5JFHHim2rj+5126SaQVirOzKPafLxCU79+/fX7xi/9oWiHHp2kmeeuqphZTXcenPr7/+unjVzScuGRyrJnPbvqjEMVrG5YXbFohxqdaq2I8LL7ww+/h5E5eBzX192RkqBSIAAACwMArEdhSINBH3l8od/3VLXCJwM4oJ+7jPXm6bN0N27NgxXonVl9xrNkmuQIxVdH2tOpyUuDzq22+/XWxBf9oWiLG6NOf222/PPr6vxKVA43KWm00cn9z2LiNbtmwZF76xem9R2haI8UsQqdj2Pv4txiWJc19fdoZKgQgAAAAsjAKxHQUidRw6dGhcDuWO/bol7vG3GUWpuczLldZNrLJ75ZVXiq3uVu71mqRaIEYptayVnHGcooDpU9sCMYrCVFwus+2YbfLQQw8VW7Jc8fO9devW7DYuO7Gq78UXXyy2tF9tC8RIKlZ+5x7TNiH39WVnqBSIAAAAwMIoENtRIDLNN998M17Vkjvm65q4POhmE5cHzW3rZs2JJ544evPNN4ut707utZokLRDj/n65xywyUfbE/HJf2pZ9cVnXUryf8b7mHrfIzLovY9/iPoe57dps2bt3b7HF/emyQPzrX/+a/X7b7Nq1azx+7nvLzlApEAEAAICFUSC2o0AkJy7rGPfVWvd7Heby8ccfF0dhc3j22Wez27nZEyvsur4vW+51mqQsEGPlYe77y0isKo37ivahbYF48803j8eJy9LG+5l7zDISZdMy/PnPf85uz2bNHXfcUWx5P7oqEJ955pns97rIq6++On6N3PeWnaFSIAIAAAALo0BsR4FI6fPPPx8999xz4/uz5Y7xELKsYmKSuE/eKpe41157bbEn3ci9RpNEgfjaa69lv7fsxH3autZVgXjhhRdmv7/MxC84LMpXX321sufFnTt3jleS96GLAjGObV/nuFgxW8p9f9kZKgUiAAAAsDAKxHYUiMP03nvvjYuUxx9/fDwRf9lll2WP65ASk83Ve+Qt07fffju66KKLstu6SokVlF3Jjd8ksbI29/XNkDPOOGP097//vdjTbnRRIF5++eXZ722GxErSRWh7HJedbdu2jc8nXeuiQLzyyiuzX+8i6SV4c99fdoZKgQgAAAAsjAKxHQXieonVHB999NHorbfeGh08eHD01FNPjfbs2TO68847xytRopCK+67ljuHQc//99xdHcXPo655gi86OHTuKPWovN/46Jf6Ndqlt8XX22Wdnv75ZEivX3n///WJv+7Fqly2dlOuvv77Yo+50USD2mVjBXcp9f9kZKgUiAAAAsDAKxHbWpUCMYuyxxx4br6jbt2/fOE888cQ4+/fvHydWq0ShFnn66acXlni9eP3Yltiu2MbY1r17944effTRccH34IMPjgus3bt3j+6+++7RXXfdNbr99tvHKyhuuumm0Y033ji+HOTVV1892r59++jSSy8d7/O55547vjdZrJ7LHReplziG3333XfGvYvliJdqWLVuy27qK6arkyY29bnn44YeLvW1v1VfO1ckVV1xR7G334ryce81VzX333VfsWTc2c4EY5/RU7jHLzlApEAEAAICFUSC2sy4FokibRIm7mdxxxx3Z7ewqMbke5fNZZ501OvXUU0fHHnts9nFdJYryLuTGXse8+eabxR63M4QCMXLPPfcUe9ydl156Kftaq564z21XNnOBGL+Ik8o9ZtkZKgUiAAAAsDAKxHYUiDL0xD3eNpO4BG1uO+dN3Fvv3nvvHU/2f/zxx6Pvv/++eKV/FvfFPHDgwHjVa9eXrowVtF3Ijd1XomSNYxErg2P18iuvvDJeTRyr0rZu3To67bTTss/rIrG6uAuLLhCvueaacZkXK6xffPHF8c9TlMexovriiy/OPqerxD1du3ThhRdmX6fLnHnmmaM//OEP4+MW79V5553X+2ryGP/dd98t9rKdzVwgxrkulXvMsjNUCkQAAABgYRSI7SgQZeg5dOhQ8a9hc3jggQey29k0sbowiq95xarMrlYmnn/++cWo7eTG7jpxH8JYfVbH888/P76kcG6ctomx21pEgRgrWaMw/Oyzz4pXnSz+rcX9WHPjtE1XJXXo6/6jUTrHJamjXJ0m7mEbl7OOIjk3TttEmduFzVogRhFblXvcsjNUCkQAAABgYRSI7SgQZciJ1WSbTUx+57a1SWIFYRerjF5++eXs+PPkq6++KkadX27crhIrzuYt7eK+hV1fBjZWpbXVd4EYK1vnEasF+1iR+OmnnxavML+4fGxu7LaJyxJ/++23xavUF78EEKuIc2O2SdyLt61FFIhRUMeq1riH8KuvvjpOFNFR8kcZnStZ57mPaHWMeRLbxmwKRAAAAGBhFIjtKBBlqLniiiuKfwWbx9/+9rfstjbJli1bOruHXoiViLnXaZr333+/GHF+uXG7yI4dOyZe2rWueO+6vqxpXFa2jb4KxOOPP76TsuTaa6/Njj9v4nKzbV155ZXZsedNXKK07b/Hr7/+enTbbbdlx5838UsGbfVZIMalVuv+gscLL7zwT//2vvnmm+I79aWvPW8UiPUoEAEAAICFUSC2o0CUoWazXbo07Nq1K7utTRL3nOvSd999Nzr11FOzr9Ukr7/+ejHi/HLjts1VV13VujwsRYnYxbEqEyus2uijQOyqPCx1WSK2LcW6Xn0YxXSUf1257777sq8zb9quwO6rQIxVhfOsJo3Vmpdccknxt2Zy29E0Xd+Hc10pEAEAAICFUSC2o0CUIWb//v3Fv4DNJeYaY1I/7sM3z2ULu7rXYFVcTjP3ek3y7LPPFqPNLzdum8TxioK0S2+88Ub2tebJKaecUow6nz4KxFjt1bXLLrss+1rz5LnnnitGbe5Pf/pTdsx5cv311xejdit+QSD3evPkpJNOGn355ZfFyM31USCefPLJo7fffrt4hcXJbUvTdPFLEkOgQAQAAAAWRoHYjgJRhpa77767+OlfDYcPHx499dRT40sYRtESl/bL7Vdknnt/1dHFyqdHHnmkGG1+uXHb5JVXXilG7lbcsy33evPkwIEDxajNdV0g3n777cXI3eqyiIryfR4ffvhhdrx5csEFF3ReTKf+8pe/ZF93ntx1113FqM31USAu65c7ctvSNArEehSIAAAAwMIoENtRIMqQct111xU/+ast7vEVl8uL+xPeeOONowsvvHC8f32JSwNWj2XTPPTQQ8Vo88uNO2/6LpLjMoy5122aNpcx7bJA3Lp1azFqP3bv3p193aY588wzixGb6fLyoNEZ9CnKySgpc6/dNLHib15dF4jbtm0rRl683PY0Taw+ZjYFIgAAALAwCsR2FIgylEShE8UbzR08eDB7TJvkgQceKEabX27cedPm0o11xKrR3Os2Taw6nVeXBeITTzxRjNqPuFdg3F8x99pNE6sJm4ryKjdW09x///3FiP3q4t9kmXlXznVdIO7bt68YefFy29M0CsR6FIgAAADAwigQ21EgyhAS9xNcxn211kUUDLnj2iT33ntvMdr8cuPOk127dhUj9uf7778f32Mu9/pNctxxxxUjNtdVgRjF3rfffluM2p8///nP2ddvmqeffroYsZ733nsvO07TxHv11VdfFaP278orr8xuR9PEJXfn0WWBGD9jfV72dZbcNjWNArEeBSIAAACwMArEdhSIsu6JSxoeOnSo+IlnHnGp1NyxbZJ5S4pUbtx50te9D6tuvfXW7Os3TRQ18+iqQLz55puLEfv16quvZl+/aeJ+oU08+OCD2XGaZlHHqRT3x8xtR9NceumlxYjNdFkgxqWY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RxqlYB1xac/yOZEmlyAFAOpTILajQFw/zz//fPYYDSFN7v/N6sm9502jQGwWBSLQJQUiALB20nsDRqJQnHRvwfI+kul9Gptc9hQAaEaB2I4CcT3ddttt2eM0hPzP//xPcRRYN7n3u2kUiM2iQAS6pEAEANZOlH/p/QzTYjAuaVomvWRp+phJZSMA0J4CsR0F4vq68MILs8dq3XPZZZcVR4B1k3u/m0aB2CwKRKBLCkQAYC298sor45KwWhBOSzxeeQgA/VIgtqNAXF/x/19zx2oIue+++4qjwDrJvddNo0BsFgUi0CUFIgCw1qIQ/P3vfz8uB9PLlEbKFYnxffdfAYDFUCC2o0Bcb3fddVf2eA0hLmW6fmJ1adsMqUC87rrrssegSW699dZiNID2FIgAAADAwigQ21Egrr+LL744e8zWPZdeemlxBACAzUCBCAAAACyMArEdBeL6e/3117PHbAhxKVMA2DwUiAAAAMDCKBDbUSAOw+7du7PHbQh56623iqMAACyTAhEAAABYGAViOwrE4YhLeuaO3brniiuuKI4AALBMCkQAAABgYRSI7SgQh+PNN9/MHrshZM+ePcVRAACWRYEIAAAALIwCsR0F4rDcf//92eO37jnuuONGhw8fLo4CALAMCkQAAABgYRSI7SgQh+fyyy/PHsN1z86dO4sjAAAsgwIRAAAAWBgFYjsKxOF56623ssdwCNm/f39xFACARVMgAgAAAAujQGxHgThMDz74YPY4rntOP/300eeff14cBQBgkRSIAAAAwMIoENtRIA7XFVdckT2W656bb765OAIAwCIpEAEAAICFUSC2o0AcrnfeeSd7LIeQl19+uTgKAMCiKBABAACAhVEgtqNAHLaHHnooezzXPVu3bi2OAACwKApEAAAAYGEUiO0oENm+fXv2mK57du/eXRwBAGARFIgAAADAwigQ21Eg8u6772aP6RBy6NCh4igAAH1TIAIAAAALo0BsR4FIePjhh7PHdd1z5ZVXFkcAAOibAhEAAABYGAViOwpESlGm5Y7tuuexxx4rjgAA0CcFIgAAALAwCsR2FIiU3nvvveyxXfecfPLJo08++aQ4CgBAXxSIAAAAwMIoENtRIJLas2dP9viue3bt2lUcAQCgLwpEAAAAYGEUiO0oEKnasWNH9hive55//vniCAAAfVAgAgAAAAujQGxHgUjV+++/nz3G655zzz23OAIAQB8UiAAAAMDCKBDbUSCS88gjj2SP87rnzjvvLI4AANA1BSIAAACwMArEdhSITHLVVVdlj/W654033iiOAADQJQUiAAAAsDAKxHYUiEzywQcfjI499tjs8V7nXHbZZcURAAC6pEAEAAAAFkaB2I4CkWkeffTR7PFe9zz00EPFEQAAuqJABAAAABZGgdiOApFZrr766uwxX+fEyssPP/ywOAIAQBcUiAAAAMDCKBDbUSAyy+HDh0dbtmzJHvd1zs6dO4sjAAB0QYEIAAAALIwCsR0FInXs3bs3e9zXPU899VRxBACAthSIAAAAwMIoENtRIFLXNddckz3265wzzjij2HsAoC0FIgAAALAwCsR2FIjUFfcEHOKlTG+55ZbiCAAAbSgQAQAAgIVRILajQKSJxx57LHv81z2vvPJKcQQAgHkpEAEAAICFUSC2o0CkqXX5mWmSbdu2FXsPAMxLgQgAAAAsjAKxHQUiTX300UeDvJTpvffeWxwBAGAeCkQAAABgYRSI7SgQmcfjjz+efR/WPYcPHy6OAADQlAIRAAAAWBgFYjsKROa1Lj87TXLllVcWew8ANKVABAAAABZGgdiOApF5xaVMjzvuuOz7sc557LHHiiMAADShQAQAAAAWRoHYjgKRNvbt25d9P9Y5J510UrH3AEATCkQAAABgYRSI7SgQaevaa6/NvifrnF27dhV7DwDUpUAEAAAAFkaB2I4CkbY+/vjj0fHHH599X9Y5Bw8eLI4AAFCHAhEAAABYGAViOwpEuvDEE09k35d1zrnnnlvsPQBQhwIRAAAAWBgFYjsKRLoyxEuZ3nnnncXeAwCzKBABAACAhVEgtqNApCuffPLJIC9levjw4eIIAADTKBABAACAhVEgtqNApEv79+/Pvj/rnMsuu6zYewBgmkEViIcOHRr96Ec/Kv4GAAAALJoCsR0FIl0b4qVM9+7dW+w9ADDJoArEcNRRg9tlAAAA2DROOumk0X/8x38Uf6MpBSJd+/TTT0cnnHBC9n1a12zZsqXYewBgksG1aXEJ07iUKQAAALB4v/vd70ZnnXVW8TeaUiDShyeffDL7Pq1zdu7cWew9AJAzuALx5z//+WjPnj3F3wAAAIBF+vd///fRNddcU/yNphSI9OW6667LvlfrnIMHDxZ7DwBUDa5APProo0e7du0q/gYAAAAskl/sbUeBSF/+/ve/D+5SpmeccUax9wBA1eAKRDdrBwAAgOX48MMPRz/4wQ+KvzEPBSJ9GuKlTG+//fZi7wGA1OAKxPiPlR/96EejL774ovgKAAAAsAh+qbc9BSJ9u/7667Pv2Trngw8+KPYeACgNrkAMv/rVr0a33XZb8TcAAABgEdz/sD0FIn377LPPRieddFL2fVvXXHTRRcXeAwClQRaIfuMRAAAAFiuuBBSXL3VFoHYUiCzC008/nX3f1jl79+4t9h4ACIMsEOM/VuKm7fv37y++AgAAAPTpd7/73eiss84q/sa8FIgsyhAvZQoAHDHIAjHs2rVrdPTRRxd/AwAAAPpy6NCh0Y9//GOrDzugQGRRPv/888FdyvSqq64q9h4AGGyBGH76059ahQgAAAA9c+/D7igQWaQhXsr04MGDxd4DwLANukDcs2fP6Be/+IXfgAQAAICe3HbbbaNf/epXxd9oS4HIot1www3Z93BdE6suAYCBF4ghfgMyfhMSAAAA6NZ///d/j6/+8+GHHxZfoS0FIosWv3g/tEuZxi8+AMDQDb5ADP/xH//ht4sAAACgQ1E6RHn4/PPPF1+hCwpEluGZZ57Jvo/rnMOHDxd7DwDDpEAsHH300aOtW7cWfwMAAADmFSsO47KlVvF0T4HIsgztUqbnnXdesecAMEwKxMRvfvObcQAAAID5xIrDn//856Pdu3cXX6FLCkSW5csvvxydfPLJ2fdzXfPoo48Wew8Aw6NArIhViPFbkocOHSq+AgAAANQRKw6jPHTZ0v4oEFmmIV7KFACGSoGYEf/B82//9m+j//zP/3SjdwAAAJhh//79o1/84hfjX8j139H9UiCybLt27cq+p+uaq666qthzABgWBeIE8R88USBGkXjWWWf5DyAAAACoiOLw3//930c//elPXbJ0QRSILNtXX301OuWUU7Lv67rm5ZdfLvYeAIZDgThDXMr0d7/73egHP/jB+DIsUSa6FAsAAABDFauPfvOb34x+9KMfjYvDa665pvgOi6BAZDN49tlns+/rumbLli3FngPAcCgQG9izZ8+4TIxViUcdddT4P5biEi0iIiIiIiIi65z4hdr47+DI0UcfPdq6dev4F25ZPAUim8XQLmUatzwCgCFRILYQ/7EUl2gRERERERERWefEL9QCAADDoUAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAADYoEAEAAAAAAAANigQAQAAAAAAgA0KRAAAAAAAAGCDAhEAAAAAAAAojEb/fzPKghirR+siAAAAAElFTkSuQmCC',
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
              text: this.vehicule.consommation + "L/100km",
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

  activerModificationKmActuel() {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Pour eviter les fautes de calcul de la consommation, cette action va supprimer les enregistrement qui ne sont pas encores enregistrées dans l'historique de consommation et va supposer que le vehicule est en plein carburant. Veuillez faire un plein avant de procéder!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ok',
      cancelButtonText: 'annuler'
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
    })
  }

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
    let historiqueConsommation = this.kmActuelDesactive? this.vehicule.historiqueConsommation : "";
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
        this.fermerMiseAJourConsommation();
        Swal.fire('Consommation enregistrée!', '', 'success');
      }
    });
  }

  // fermer la boite de dialogue
  fermerMiseAJourConsommation(): void {
    this.dialogRef.close();
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
    @Inject(MAT_DIALOG_DATA) public data: any
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

import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientServiceService } from '../Service/client-service.service';
import { VisualiserImageClient } from '../modifier-client/modifier-client.component';

@Component({
  selector: 'app-visualiser-client',
  templateUrl: './visualiser-client.component.html',
  styleUrls: ['./visualiser-client.component.scss'],
})
export class VisualiserClientComponent implements OnInit {
  categorie_ville: any;
  categorie_region: any;
  Informations_Banques: FormGroup;
  Informations_Generales: FormGroup;
  Identification_Fiscale: FormGroup;
  Vente: FormGroup;
  id_client: any;
  client: any;
  debut_exoneration_tva: any;
  fin_exoneration_tva: any;
  constructor(
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private serviceClient: ClientServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.Informations_Generales = this.fb.group({
      Nom_Client: [''],
      Categorie_Client: [''],
      Representant: [''],
      Type_Piece_Identite: [''],
      N_Piece_Identite: [''],
      Date_Livraison_Identite: [''],
      Description: [''],
    });
    this.Identification_Fiscale = this.fb.group({
      Categorie_Fiscale: [''],
      Identification_Fiscale: [''],
      N_Attestation_Exoneration: [''],
      Etablie_Le: [''],
      Valable_Au: [''],
      Taux_Reduction_Tva: [],
      Timbre_Fiscal: [],
    });
    this.Informations_Banques = this.fb.group({
      Banque1: [''],
      Rib1: [''],
      Banque2: [''],
      Rib2: [''],
    });
    this.Vente = this.fb.group({
      Solde_Facture: [],
      Risque: [],
      Plafond: [],
      Bloque_Vente: [],
    });
    this.id_client = this.route.snapshot.params.id;
    this.Client();
  }
  Client() {
    this.serviceClient.Client(this.id_client).subscribe((resp: any) => {
      this.client = resp;
      console.log(resp);
      this.debut_exoneration_tva = new Date(this.client.debut_Exoneration);
      this.debut_exoneration_tva = this.datePipe.transform(
        this.debut_exoneration_tva,
        'dd-MM-yyyy'
      );
      this.fin_exoneration_tva = new Date(this.client.fin_Exoneration);
      this.fin_exoneration_tva = this.datePipe.transform(
        this.fin_exoneration_tva,
        'dd-MM-yyyy'
      );
      let villes = [
        {
          nom: 'Sfax',
          valeur: 'Tunisie',
        },
        {
          nom: 'Ariana',
          valeur: 'Tunisie',
        },
        {
          nom: 'Ben_Arous',
          valeur: 'Tunisie',
        },
        {
          nom: 'Gabes',
          valeur: 'Tunisie',
        },
        {
          nom: 'Gafsa',
          valeur: 'Tunisie',
        },
        {
          nom: 'Jendouba',
          valeur: 'Tunisie',
        },
        {
          nom: 'Kairouan',
          valeur: 'Tunisie',
        },
        {
          nom: 'Kasserine',
          valeur: 'Tunisie',
        },
        {
          nom: 'Kebili',
          valeur: 'Tunisie',
        },
        {
          nom: 'Manouba',
          valeur: 'Tunisie',
        },
        {
          nom: 'Kef',
          valeur: 'Tunisie',
        },
        {
          nom: 'Mahdia',
          valeur: 'Tunisie',
        },
        {
          nom: 'Mednine',
          valeur: 'Tunisie',
        },
        {
          nom: 'Monastir',
          valeur: 'Tunisie',
        },
        {
          nom: 'Nabeul',
          valeur: 'Tunisie',
        },
        {
          nom: 'Sidi_Bouzid',
          valeur: 'Tunisie',
        },
        {
          nom: 'Siliana',
          valeur: 'Tunisie',
        },
        {
          nom: 'Sousse',
          valeur: 'Tunisie',
        },
        {
          nom: 'Tataouine',
          valeur: 'Tunisie',
        },
        {
          nom: 'Tozeur',
          valeur: 'Tunisie',
        },
        {
          nom: 'Tunis',
          valeur: 'Tunisie',
        },
        {
          nom: 'Zaghouan',
          valeur: 'Tunisie',
        },
        {
          nom: 'Beja',
          valeur: 'Tunisie',
        },
      ];
      this.categorie_ville = villes.sort(function (a, b) {
        return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
      });
      let listeRegions = [
        {
          nom: 'Esskhira',
          valeur: 'Sfax',
        },
        {
          nom: 'El_Hencha',
          valeur: 'Sfax',
        },
        {
          nom: 'El_Amra',
          valeur: 'Sfax',
        },
        {
          nom: 'Bir_Al_Ben_Khelifa',
          valeur: 'Sfax',
        },
        {
          nom: 'Agareb',
          valeur: 'Sfax',
        },
        {
          nom: 'Ghraiba',
          valeur: 'Sfax',
        },
        {
          nom: 'Jebeniana',
          valeur: 'Sfax',
        },
        {
          nom: 'Kerkenah',
          valeur: 'Sfax',
        },
        {
          nom: 'Mahras',
          valeur: 'Sfax',
        },
        {
          nom: 'Menzel_Chaker',
          valeur: 'Sfax',
        },
        {
          nom: 'Sakiet_Eddaier',
          valeur: 'Sfax',
        },
        {
          nom: 'Sakiet_Ezzit',
          valeur: 'Sfax',
        },
        {
          nom: 'Sfax_Est',
          valeur: 'Sfax',
        },
        {
          nom: 'Sfax_Sud',
          valeur: 'Sfax',
        },
        {
          nom: 'Sfax_Ville',
          valeur: 'Sfax',
        },
        {
          nom: 'Ariana_Ville',
          valeur: 'Ariana',
        },
        {
          nom: 'Ettadhamen',
          valeur: 'Ariana',
        },
        {
          nom: 'Kalaat_Landlous',
          valeur: 'Ariana',
        },
        {
          nom: 'Soukra',
          valeur: 'Ariana',
        },
        {
          nom: 'Mnihla',
          valeur: 'Ariana',
        },
        {
          nom: 'Raoued',
          valeur: 'Ariana',
        },
        {
          nom: 'Sidi_Thabet',
          valeur: 'Ariana',
        },
        {
          nom: 'Bou_Mhel_El_Bassatine',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'El_Mourouj',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Ezzahra',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Fouchana',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Hammam_Chatt',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Hammam_Lif',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Mohamadia',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Mornag',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Nouvelle_Medina',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'Rades',
          valeur: 'Ben_Arous',
        },
        {
          nom: 'El_Hamma',
          valeur: 'Gabes',
        },
        {
          nom: 'El_Metouia',
          valeur: 'Gabes',
        },
        {
          nom: 'Gabes_Medina',
          valeur: 'Gabes',
        },
        {
          nom: 'Gabes_Ouest',
          valeur: 'Gabes',
        },
        {
          nom: 'Gabes_Sud',
          valeur: 'Gabes',
        },
        {
          nom: 'Ghannouche',
          valeur: 'Gabes',
        },
        {
          nom: 'Mareth',
          valeur: 'Gabes',
        },
        {
          nom: 'Matmata',
          valeur: 'Gabes',
        },
        {
          nom: 'Menzel_Habib',
          valeur: 'Gabes',
        },
        {
          nom: 'Nouvelle_Matmata',
          valeur: 'Gabes',
        },
        {
          nom: 'Belkhir',
          valeur: 'Gafsa',
        },
        {
          nom: 'El_Guettar',
          valeur: 'Gafsa',
        },
        {
          nom: 'El_Ksar',
          valeur: 'Gafsa',
        },
        {
          nom: 'El_Mdhilla',
          valeur: 'Gafsa',
        },
        {
          nom: 'Gafsa_Nord',
          valeur: 'Gafsa',
        },
        {
          nom: 'Gafsa_Sud',
          valeur: 'Gafsa',
        },
        {
          nom: 'Metlaoui',
          valeur: 'Gafsa',
        },
        {
          nom: 'Moulares',
          valeur: 'Gafsa',
        },
        {
          nom: 'Redeyef',
          valeur: 'Gafsa',
        },
        {
          nom: 'Sidi_Aich',
          valeur: 'Gafsa',
        },
        {
          nom: 'Sned',
          valeur: 'Gafsa',
        },
        {
          nom: 'Ain_Draham',
          valeur: 'Jendouba',
        },
        {
          nom: 'Balta_Bou_Aouene',
          valeur: 'Jendouba',
        },
        {
          nom: 'Bou_Salem',
          valeur: 'Jendouba',
        },
        {
          nom: 'Fernana',
          valeur: 'Jendouba',
        },
        {
          nom: 'Ghardimaou',
          valeur: 'Jendouba',
        },
        {
          nom: 'Jendouba',
          valeur: 'Jendouba',
        },
        {
          nom: 'Jendouba_Nord',
          valeur: 'Jendouba',
        },
        {
          nom: 'Oued_Mliz',
          valeur: 'Jendouba',
        },
        {
          nom: 'Tabarka',
          valeur: 'Jendouba',
        },
        {
          nom: 'Bou_Hajla',
          valeur: 'Kairouan',
        },
        {
          nom: 'Chebika',
          valeur: 'Kairouan',
        },
        {
          nom: 'Cherarda',
          valeur: 'Kairouan',
        },
        {
          nom: 'El_Ala',
          valeur: 'Kairouan',
        },
        {
          nom: 'Haffouz',
          valeur: 'Kairouan',
        },
        {
          nom: 'Hajeb_El_Ayoun',
          valeur: 'Kairouan',
        },
        {
          nom: 'Kairouan_Nord',
          valeur: 'Kairouan',
        },
        {
          nom: 'Kairouan_Sud',
          valeur: 'Kairouan',
        },
        {
          nom: 'Nasrallah',
          valeur: 'Kairouan',
        },
        {
          nom: 'Oueslatia',
          valeur: 'Kairouan',
        },
        {
          nom: 'Sbikha',
          valeur: 'Kairouan',
        },
        {
          nom: 'El_Ayoun',
          valeur: 'Kasserine',
        },
        {
          nom: 'Ezzouhour',
          valeur: 'Kasserine',
        },
        {
          nom: 'Feriana',
          valeur: 'Kasserine',
        },
        {
          nom: 'Foussana',
          valeur: 'Kasserine',
        },
        {
          nom: 'Haidra',
          valeur: 'Kasserine',
        },
        {
          nom: 'Hassi_El_Frid',
          valeur: 'Kasserine',
        },
        {
          nom: 'Jediliane',
          valeur: 'Kasserine',
        },
        {
          nom: 'Kasserine_Nord',
          valeur: 'Kasserine',
        },
        {
          nom: 'Kasserine_Sud',
          valeur: 'Kasserine',
        },
        {
          nom: 'Mejel_Bel_Abbes',
          valeur: 'Kasserine',
        },
        {
          nom: 'Sbeitla',
          valeur: 'Kasserine',
        },
        {
          nom: 'Sbiba',
          valeur: 'Kasserine',
        },
        {
          nom: 'Thala',
          valeur: 'Kasserine',
        },
        {
          nom: 'Douz',
          valeur: 'Kebili',
        },
        {
          nom: 'El_Faouar',
          valeur: 'Kebili',
        },
        {
          nom: 'Kebili_Nord',
          valeur: 'Kebili',
        },
        {
          nom: 'Kebili_Sud',
          valeur: 'Kebili',
        },
        {
          nom: 'Souk_El_Ahad',
          valeur: 'Kebili',
        },
        {
          nom: 'Borj_El_Amri',
          valeur: 'Manouba',
        },
        {
          nom: 'Douar_Hicher',
          valeur: 'Manouba',
        },
        {
          nom: 'El_Battan',
          valeur: 'Manouba',
        },
        {
          nom: 'Jedaida',
          valeur: 'Manouba',
        },
        {
          nom: 'Mannouba',
          valeur: 'Manouba',
        },
        {
          nom: 'Mornaguia',
          valeur: 'Manouba',
        },
        {
          nom: 'Oued_Ellil',
          valeur: 'Manouba',
        },
        {
          nom: 'Tebourba',
          valeur: 'Manouba',
        },
        {
          nom: 'Dahmani',
          valeur: 'Kef',
        },
        {
          nom: 'El_Ksour',
          valeur: 'Kef',
        },
        {
          nom: 'Jerissa',
          valeur: 'Kef',
        },
        {
          nom: 'Kalaa_El_Khasba',
          valeur: 'Kef',
        },
        {
          nom: 'Kalaat_Sinane',
          valeur: 'Kef',
        },
        {
          nom: 'Le_Kef_Est',
          valeur: 'Kef',
        },
        {
          nom: 'Le_Kef_Ouest',
          valeur: 'Kef',
        },
        {
          nom: 'Le_Sers',
          valeur: 'Kef',
        },
        {
          nom: 'Nebeur',
          valeur: 'Kef',
        },
        {
          nom: 'Sakiet_Sidi_Youssef',
          valeur: 'Kef',
        },
        {
          nom: 'Tajerouine',
          valeur: 'Kef',
        },
        {
          nom: 'Touiref',
          valeur: 'Kef',
        },
        {
          nom: 'Bou_Merdes',
          valeur: 'Mahdia',
        },
        {
          nom: 'Chorbane',
          valeur: 'Mahdia',
        },
        {
          nom: 'El_Jem',
          valeur: 'Mahdia',
        },
        {
          nom: 'Hbira',
          valeur: 'Mahdia',
        },
        {
          nom: 'Ksour_Essaf',
          valeur: 'Mahdia',
        },
        {
          nom: 'Chebba',
          valeur: 'Mahdia',
        },
        {
          nom: 'Mahdia',
          valeur: 'Mahdia',
        },
        {
          nom: 'Melloulech',
          valeur: 'Mahdia',
        },
        {
          nom: 'Ouled_Chamakh',
          valeur: 'Mahdia',
        },
        {
          nom: 'Sidi_Alouene',
          valeur: 'Mahdia',
        },
        {
          nom: 'Souassi',
          valeur: 'Mahdia',
        },
        {
          nom: 'Ajim',
          valeur: 'Mednine',
        },
        {
          nom: 'Ben_Guerdane',
          valeur: 'Mednine',
        },
        {
          nom: 'Beni_Khedache',
          valeur: 'Mednine',
        },
        {
          nom: 'Houmet_Essouk',
          valeur: 'Mednine',
        },
        {
          nom: 'Medenine_Nord',
          valeur: 'Mednine',
        },
        {
          nom: 'Medenine_Sud',
          valeur: 'Mednine',
        },
        {
          nom: 'Midoun',
          valeur: 'Mednine',
        },
        {
          nom: 'Sidi_Makhlouf',
          valeur: 'Mednine',
        },
        {
          nom: 'Zarzis',
          valeur: 'Mednine',
        },
        {
          nom: 'Bekalta',
          valeur: 'Monastir',
        },
        {
          nom: 'Bembla',
          valeur: 'Monastir',
        },
        {
          nom: 'Beni_Hassen',
          valeur: 'Monastir',
        },
        {
          nom: 'Jemmal',
          valeur: 'Monastir',
        },
        {
          nom: 'Ksar_Helal',
          valeur: 'Monastir',
        },
        {
          nom: 'Ksibet_El_Mediouni',
          valeur: 'Monastir',
        },
        {
          nom: 'Moknine',
          valeur: 'Monastir',
        },
        {
          nom: 'Monastir',
          valeur: 'Monastir',
        },
        {
          nom: 'Sahline',
          valeur: 'Monastir',
        },
        {
          nom: 'Teboulba',
          valeur: 'Monastir',
        },
        {
          nom: 'Zeramdine',
          valeur: 'Monastir',
        },
        {
          nom: 'Béni Khalled',
          valeur: 'Nabeul',
        },
        {
          nom: 'Béni Khiar',
          valeur: 'Nabeul',
        },
        {
          nom: 'Bou Argoub',
          valeur: 'Nabeul',
        },
        {
          nom: 'Dar Chaâbane El Fehri',
          valeur: 'Nabeul',
        },
        {
          nom: 'El Haouaria',
          valeur: 'Nabeul',
        },
        {
          nom: 'El Mida',
          valeur: 'Nabeul',
        },
        {
          nom: 'Grombalia',
          valeur: 'Nabeul',
        },
        {
          nom: 'Hammam Ghezèze',
          valeur: 'Nabeul',
        },
        {
          nom: 'Hammamet',
          valeur: 'Nabeul',
        },
        {
          nom: 'Kélibia',
          valeur: 'Nabeul',
        },
        {
          nom: 'Korba',
          valeur: 'Nabeul',
        },
        {
          nom: 'Menzel Bouzelfa',
          valeur: 'Nabeul',
        },
        {
          nom: 'Menzel Temime',
          valeur: 'Nabeul',
        },
        {
          nom: 'Nabeul',
          valeur: 'Nabeul',
        },
        {
          nom: 'Soliman',
          valeur: 'Nabeul',
        },
        {
          nom: 'Takelsa',
          valeur: 'Nabeul',
        },
        {
          nom: 'Bir El Hafey',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Cebbala Ouled Asker',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Jilma',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Meknassy',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Menzel Bouzaiane',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Mezzouna',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Ouled Haffouz',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Regueb',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Sidi Ali Ben Aoun',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Sidi Bouzid Est',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Sidi Bouzid Ouest',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Souk Jedid',
          valeur: 'Sidi_Bouzid',
        },
        {
          nom: 'Bargou',
          valeur: 'Siliana',
        },
        {
          nom: 'Bou Arada',
          valeur: 'Siliana',
        },
        {
          nom: 'El Aroussa',
          valeur: 'Siliana',
        },
        {
          nom: 'El Krib',
          valeur: 'Siliana',
        },
        {
          nom: 'Gaâfour',
          valeur: 'Siliana',
        },
        {
          nom: 'Kesra',
          valeur: 'Siliana',
        },
        {
          nom: 'Makthar',
          valeur: 'Siliana',
        },
        {
          nom: 'Rouhia',
          valeur: 'Siliana',
        },
        {
          nom: 'Sidi Bou Rouis',
          valeur: 'Siliana',
        },
        {
          nom: 'Siliana Nord',
          valeur: 'Siliana',
        },
        {
          nom: 'Siliana Sud',
          valeur: 'Siliana',
        },
        {
          nom: 'Akouda',
          valeur: 'Sousse',
        },
        {
          nom: 'Bouficha',
          valeur: 'Sousse',
        },
        {
          nom: 'Enfida',
          valeur: 'Sousse',
        },
        {
          nom: 'Hammam Sousse',
          valeur: 'Sousse',
        },
        {
          nom: 'Hergla',
          valeur: 'Sousse',
        },
        {
          nom: 'Kalâa Kebira',
          valeur: 'Sousse',
        },
        {
          nom: 'Kalâa Seghira',
          valeur: 'Sousse',
        },
        {
          nom: 'Kondar',
          valeur: 'Sousse',
        },
        {
          nom: "M'saken",
          valeur: 'Sousse',
        },
        {
          nom: "Sidi Bou Ali",
          valeur: 'Sousse',
        },
        {
          nom: "Sidi El Hani",
          valeur: 'Sousse',
        },
        {
          nom: "Sousse Jawhara",
          valeur: 'Sousse',
        },
        {
          nom: "Sousse Médina",
          valeur: 'Sousse',
        },
        {
          nom: "Sousse Riadh",
          valeur: 'Sousse',
        },
        {
          nom: "Sousse Sidi Abdelhamid",
          valeur: 'Sousse',
        },
        {
          nom: "Bir Lahmar",
          valeur: 'Tataouine',
        },
        {
          nom: "Dehiba",
          valeur: 'Tataouine',
        },
        {
          nom: "Ghomrassen",
          valeur: 'Tataouine',
        },
        {
          nom: "Remada",
          valeur: 'Tataouine',
        },
        {
          nom: "Smâr",
          valeur: 'Tataouine',
        },
        {
          nom: "Tataouine Nord",
          valeur: 'Tataouine',
        },
        {
          nom: "Tataouine Sud",
          valeur: 'Tataouine',
        },
        {
          nom: "Degache",
          valeur: 'Tozeur',
        },
        {
          nom: "Hazoua",
          valeur: 'Tozeur',
        },
        {
          nom: "Nefta",
          valeur: 'Tozeur',
        },
        {
          nom: "Tameghza",
          valeur: 'Tozeur',
        },
        {
          nom: "Tozeur",
          valeur: 'Tozeur',
        },
        {
          nom: "Bab El Bhar",
          valeur: 'Tunis',
        },
        {
          nom: "Bab Souika",
          valeur: 'Tunis',
        },
        {
          nom: "Carthage",
          valeur: 'Tunis',
        },
        {
          nom: "Cité El Khadra",
          valeur: 'Tunis',
        },
        {
          nom: "Djebel Jelloud",
          valeur: 'Tunis',
        },
        {
          nom: "El Kabaria",
          valeur: 'Tunis',
        },
        {
          nom: "El Menzah",
          valeur: 'Tunis',
        },
        {
          nom: "El Omrane",
          valeur: 'Tunis',
        },
        {
          nom: "El Omrane supérieur",
          valeur: 'Tunis',
        },
        {
          nom: "El Ouardia",
          valeur: 'Tunis',
        },
        {
          nom: "Ettahrir",
          valeur: 'Tunis',
        },
        {
          nom: "Ezzouhour",
          valeur: 'Tunis',
        },
        {
          nom: "Hraïria",
          valeur: 'Tunis',
        },
        {
          nom: "La Goulette",
          valeur: 'Tunis',
        },
        {
          nom: "La Marsa",
          valeur: 'Tunis',
        },
        {
          nom: "Le Bardo",
          valeur: 'Tunis',
        },
        {
          nom: "Le Kram",
          valeur: 'Tunis',
        },
        {
          nom: "Médina",
          valeur: 'Tunis',
        },
        {
          nom: "Séjoumi",
          valeur: 'Tunis',
        },
        {
          nom: "Sidi El Béchir",
          valeur: 'Tunis',
        },
        {
          nom: "Sidi Hassine",
          valeur: 'Tunis',
        },
        {
          nom: "Bir Mcherga",
          valeur: 'Zaghouan',
        },
        {
          nom: "El Fahs",
          valeur: 'Zaghouan',
        },
        {
          nom: "Nadhour",
          valeur: 'Zaghouan',
        },
        {
          nom: "Saouaf",
          valeur: 'Zaghouan',
        },
        {
          nom: "Zaghouan",
          valeur: 'Zaghouan',
        },
        {
          nom: "Zriba",
          valeur: 'Zaghouan',
        },
        {
          nom: "Amdoun",
          valeur: 'Beja',
        },
        {
          nom: "Béja Nord",
          valeur: 'Beja',
        },
        {
          nom: "Béja Sud",
          valeur: 'Beja',
        },
        {
          nom: "Goubellat",
          valeur: 'Beja',
        },
        {
          nom: "Medjez el-Bab",
          valeur: 'Beja',
        },
        {
          nom: "Nefza",
          valeur: 'Beja',
        },
        {
          nom: "Téboursouk",
          valeur: 'Beja',
        },
        {
          nom: "Testour",
          valeur: 'Beja',
        },
        {
          nom: "Thibar",
          valeur: 'Beja',
        },
      ];
      let regionsVille = listeRegions.filter((region: any) => region.valeur === this.client.ville);
      this.categorie_region = regionsVille.sort(function (a, b) {
        return a.nom === b.nom ? 0 : a.nom < b.nom ? -1 : 1;
      });
    });
  }
  afficherImage(id: any): void {
    const dialogRef = this.dialog.open(VisualiserImageClient, {
      data: { id_Clt: id },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}

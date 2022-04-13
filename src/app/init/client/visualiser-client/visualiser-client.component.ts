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
  styleUrls: ['./visualiser-client.component.scss']
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
  fin_exoneration_tva: any
  constructor(private datePipe: DatePipe, public dialog: MatDialog, private serviceClient: ClientServiceService, private fb: FormBuilder, private route: ActivatedRoute) {
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
      Timbre_Fiscal: []
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
      this.debut_exoneration_tva = new Date(this.client.debut_Exoneration);
      this.debut_exoneration_tva = this.datePipe.transform(this.debut_exoneration_tva, 'dd-MM-yyyy');
      this.fin_exoneration_tva = new Date(this.client.fin_Exoneration);
      this.fin_exoneration_tva = this.datePipe.transform(this.fin_exoneration_tva, 'dd-MM-yyyy');
      //afficher ville selon pays
      this.serviceClient.ListerVille(this.client.pays).subscribe((reponse: Response) => {

        this.categorie_ville = reponse;
      
      });
      this.serviceClient.ListerRegion(this.client.ville).subscribe((reponse: Response) => {

        this.categorie_region = reponse;
     
      });
    });
  }
  afficherImage(id: any): void {
    const dialogRef = this.dialog.open(VisualiserImageClient, {

      data: { id_Clt: id }
    });

    dialogRef.afterClosed().subscribe(result => {
    

    });
  }

  ngOnInit(): void {
  }

}

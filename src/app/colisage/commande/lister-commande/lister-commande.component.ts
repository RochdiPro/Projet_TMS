import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { InformationCommandeComponent } from '../dialogs/dialogs.component';
import { CommandeService } from '../services/commande.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss'],
})
export class ListerCommandeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    'id',
    'referenceDocument',
    'nomClient',
    'ville',
    'adresse',
    'dateCreation',
    'tracking',
    'etat',
    'actions',
  ];
  dataSource = new MatTableDataSource();

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  constructor(
    public serviceCommande: CommandeService,
    public dialog: MatDialog
  ) {
    // code accés presentée d'une facon manuelle
    // enlever les deux lignes suivantes lors du deployement
    sessionStorage.setItem('Utilisateur', '' + "tms2");
    sessionStorage.setItem('Acces', "1000400");

    this.nom = sessionStorage.getItem('Utilisateur'); 
    this.acces = sessionStorage.getItem('Acces'); 


    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);              
  
    this.wms = Number( arrayOfDigits[4])
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  async ngOnInit() {
    await this.getListeCommandes();
  }

  //recuperer la liste des commandes
  async getListeCommandes() {
    this.dataSource.data = await this.serviceCommande
      .getListeCommandes()
      .toPromise()

  }

  // on met le tracking number au format suivante ("xxxxx xxxxx xxxxx") pour faciliter son affichage
  formatTrackingNumber(trackingNumber: any){
    const trackingNumberStr = trackingNumber.toString();
    return [trackingNumberStr.slice(0, 5), " ", trackingNumberStr.slice(5, 10)," ",trackingNumberStr.slice(11)].join('')
  }

  // fonction a executer avec le bouton info commande
  // ouvrir la boite de dialogue information du commande
  ouvrirBoiteDialogueInformationCommande(commande: any) {
    const dialogRef = this.dialog.open(InformationCommandeComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { commande: commande },
    });
    // la boite de dialogue info commande contient des boutons pour la modification du position et de la liste de colisage
    // c'est pourquoi apres la fermeture de cette boite de dialogue on rafraichit la liste des commandes pour mettre a jour les champs modifiés
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getListeCommandes();
    });
  }

  //supprime commande et sa liste colisage quand on appuie sur bouton 'annuler'
  async annulerCommande(commande: any){
    await this.serviceCommande.supprimerCommande(commande.id).toPromise();
    await this.serviceCommande.deleteColisParIdCommande(commande.id).toPromise();
    Swal.fire({
      icon: 'success',
      title: 'Commande annulée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.getListeCommandes();
  }
}

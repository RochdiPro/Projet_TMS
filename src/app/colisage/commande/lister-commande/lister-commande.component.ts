import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { BoiteDialogueModifierColisage, BoiteDialogueModifierPositionComponent, InformationCommandeComponent } from '../dialogs/dialogs.component';
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
    'reference',
    'nomClient',
    'ville',
    'adresse',
    'date',
    'etat',
    'actions',
  ];
  dataSource = new MatTableDataSource();
  constructor(
    public serviceCommande: CommandeService,
    public dialog: MatDialog
  ) {}

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
      .toPromise();
  }

  ouvrirBoiteDialogueInformationCommande(commande: any) {
    const dialogRef = this.dialog.open(InformationCommandeComponent, {
      width: '1000px',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getListeCommandes();
    });
  }

  //supprime commande et sa liste colisage quand on appuie sur bouton 'annuler'
  async annulerCommande(commande: any){
    await this.serviceCommande.supprimerCommande(commande.id).toPromise();
    await this.serviceCommande.deleteColisParReference(commande.referenceDocument).toPromise();
    Swal.fire({
      icon: 'success',
      title: 'Commande annulée',
      showConfirmButton: false,
      timer: 1500,
    });
    this.getListeCommandes();
  }
}

//************************************************* Boite de dialogue modifier *******************************

@Component({
  selector: 'modifier-commande',
  templateUrl: 'modifier-position-client.html',
})
export class ModifierCommande implements OnInit {
  constructor(
    public dialgRef: MatDialogRef<ModifierCommande>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {}
}

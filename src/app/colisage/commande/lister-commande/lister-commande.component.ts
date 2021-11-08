import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BoiteDialogueModifierColisage, BoiteDialogueModifierPositionComponent } from '../dialogs/dialogs.component';
import { CommandeService } from '../services/commande.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss'],
})
export class ListerCommandeComponent implements OnInit {
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
    this.dataSource = await this.serviceCommande
      .getListeCommandes()
      .toPromise();
  }

  ouvrirBoiteDialogueModifierPosition(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierPositionComponent, {
      width: '1000px',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getListeCommandes();
    });
  }

  ouvrirBoiteDialogueModifierColisage(commande: any) {
    const dialogRef = this.dialog.open(BoiteDialogueModifierColisage, {
      width: '1000px',
      data: { commande: commande },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getListeCommandes();
    });
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

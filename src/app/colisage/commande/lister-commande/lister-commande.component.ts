import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommandeService } from '../services/commande.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss']
})
export class ListerCommandeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['id', 'reference', 'idClient', 'nomClient', 'contact', 'telephone', 'ville', 'adresse', 'date', 'etat', 'actions'];
  dataSource = new MatTableDataSource;
  constructor(public serviceCommande: CommandeService, public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  async ngOnInit() {
    await this.getListeCommandes();
  }

  async getListeCommandes() {
    this.dataSource = await this.serviceCommande.getListeCommandes().toPromise()
  }

  ouvrirBoiteDialogueModifierCommande() {
    const dialogRef = this.dialog.open(ModifierCommande, {
      width: '600'
    })
  }

}

//************************************************* Boite de dialogue modifier *******************************

@Component({
  selector: 'modifier-commande',
  templateUrl: 'modifier-position-client.html'
})

export class ModifierCommande implements OnInit {
  constructor(public dialgRef: MatDialogRef<ModifierCommande>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit() {
    

  }
}


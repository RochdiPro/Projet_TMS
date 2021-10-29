import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColisageService } from 'src/app/colisage.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss']
})
export class ListerCommandeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  displayedColumns: string[] = ['id', 'reference','idClient', 'nomClient', 'contact', 'telephone', 'ville', 'adresse', 'date'];
  dataSource = new MatTableDataSource<TableCommandes>();
  constructor(public service: ColisageService) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  async ngOnInit() {
    await this.getListeCommandes();
  }

  async getListeCommandes(){
    this.dataSource = await this.service.getListeCommandes().toPromise()
  }

}

//interface pour injecter les données dans le dataSource
interface TableCommandes {
  id: Number;
  referenceDocument: String;
  idClient: Number;
  nomClient: String;
  contact: String;
  telephone: Number;
  categorieClient: String;
  ville: String;
  adresse: String;
  typePieceIdentite: String;
  numPieceIdentite: Number;
  dateCreation: Date;

}

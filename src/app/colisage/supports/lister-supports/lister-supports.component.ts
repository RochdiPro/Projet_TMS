import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SupportService } from '../services/support.service';

@Component({
  selector: 'app-lister-supports',
  templateUrl: './lister-supports.component.html',
  styleUrls: ['./lister-supports.component.scss'],
})
export class ListerSupportsComponent implements OnInit {
  listeSupports: any;
  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;

  displayedColumns: string[] = [
    'id',
    'nomSupport',
    'typeSupport',
    'poidsEmballage',
    'dimensions',
    'volume'
  ];
  dataSource: MatTableDataSource<Support>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    
  }
  constructor(private serviceSupport: SupportService, public router: Router) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    this.chargerListeSupports();
  }

  // get le liste des supports
  async chargerListeSupports() {
    this.listeSupports = await this.serviceSupport.supports().toPromise();
    this.dataSource = new MatTableDataSource<Support>(this.listeSupports);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  modifierSupport(support: any) {
    this.serviceSupport.supp = support; //on enregistre le support dans une variable dans le SupportService pour le passer a l'interface de modification
    this.router.navigate(['/Menu/Menu_Colisage/Supports/Modifier_Support']); //navigation vers l'interface modifier support
  }

  async supprimerSupport(support: any) {
    await this.serviceSupport.supprimerSupport(support.id_support).toPromise();
    this.chargerListeSupports(); //actualisation du liste support aprés supprimation
  }
}

export interface Support {
  id: number;
  nomSupport: string;
  typeSupport: string;
  poidsEmballage: number;
  longueur: number;
  largeur: number;
  hauteur: number;
  volume: number;
  codeBarre: string;
}

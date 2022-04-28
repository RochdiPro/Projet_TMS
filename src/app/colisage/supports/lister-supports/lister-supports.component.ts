/**
 Constructeur: get droit d'accées depuis sessionStorage
 Liste des methodes:
 * createFiltresFormGroup: créer le formGroup des filtres.
 * filtrerCommandes: filtrer la liste des supports.
 * viderChamp: vider le champ de filtre.
 * chargerListeSupports: get le liste des supports.
 * modifierSupport: modifier un support.
 * supprimerSupport: supprimer un support.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    'volume',
    'actions'
  ];
  dataSource: MatTableDataSource<Support>;
  filtres: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    
  }
  constructor(private serviceSupport: SupportService, public router: Router, private fb: FormBuilder) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {
    this.createFiltresFormGroup();
    this.chargerListeSupports();
  }

    //créer le formGroup des filtres
    createFiltresFormGroup() {
      this.filtres = this.fb.group({
        id: '',
        nom: '',
        type: '',
      });
    }

  // filtrer la liste des supports
  filtrerCommandes() {
    this.serviceSupport.filtrerSupportsTroisChamps(
      this.filtres.get('id').value,
      this.filtres.get('nom').value,
      this.filtres.get('type').value,
    ).subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  //vider le champ de filtre
  viderChamp(champ: string) {
    this.filtres.get(champ).setValue('');
    this.filtrerCommandes();
  }

  // get le liste des supports
  async chargerListeSupports() {
    this.listeSupports = await this.serviceSupport.supports().toPromise();
    this.dataSource = new MatTableDataSource<Support>(this.listeSupports);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //modifier un support
  modifierSupport(support: any) {
    this.serviceSupport.supp = support; //on enregistre le support dans une variable dans le SupportService pour le passer a l'interface de modification
    this.router.navigate(['/Menu/Menu_Colisage/Supports/Modifier_Support']); //navigation vers l'interface modifier support
  }

  //supprimer un support
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

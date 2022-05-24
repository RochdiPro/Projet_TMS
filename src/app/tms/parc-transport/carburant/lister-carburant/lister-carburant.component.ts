/**
 * Constructeur: get droit d'accées depuis sessionStorage.
 Liste des méthodes:
 * getCarburant: get liste des carburants.
 * ouvrirModifierCarburant: ouvrir boite de dialogue modifier carburant.
 */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModifierPrixComponent } from '../modifier-prix/modifier-prix.component';
import { CarburantService } from '../services/carburant.service';

@Component({
  selector: 'app-lister-carburant',
  templateUrl: './lister-carburant.component.html',
  styleUrls: ['./lister-carburant.component.scss'],
})
export class ListerCarburantComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nom', 'prix', 'modifier'];
  dataSource: any;

   // variables de droits d'accés
   nom: any;
   acces: any;
   tms: any;

  // pour activer et desactiver le progress bar de chargement
  chargementEnCours = true;
  constructor(private service: CarburantService, private dialog: MatDialog) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
  }

  ngOnInit(): void {
    this.getCarburant();
  }

  // get liste des carburants
  getCarburant() {
    this.chargementEnCours = true;
    this.service.carburants().subscribe(
      (data) => {
        this.dataSource = data;
        this.chargementEnCours = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // ouvrir boite de dialogue modifier carburant
  ouvrirModifierCarburant(carburant: any) {
    let dialogRef = this.dialog.open(ModifierPrixComponent, {
      width: '1200px',
      data: { carburant: carburant },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getCarburant();
    });
  }
}

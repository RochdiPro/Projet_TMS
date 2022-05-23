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

  // pour activer et desactiver le progress bar de chargement
  chargementEnCours = true;
  constructor(private service: CarburantService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getCarburant();
  }

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

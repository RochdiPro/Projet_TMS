import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParcTransportService } from 'src/app/parc-transport.service';
import { DatePipe } from '@angular/common';
import { kmactuelValidator } from './kmactuel.validator';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2'

// ***************************************Page vehicule********************************************
@Component({
  selector: 'app-vehicule',
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.scss']
})
export class VehiculeComponent implements OnInit {
  //Declaration des variables
  mesVehicules = false; //pour l'activation du tab mes vehicules
  vehiculesLoues = false; //pour l'activation du tab vehicules loues

  constructor(public router: Router) { }
  ngOnInit(): void {
    if (this.router.url === '/Menu/TMS/Parc/Vehicules/Mes-Vehicules') this.activerMesVehicules();
    if (this.router.url === '/Menu/TMS/Parc/Vehicules/Vehicules-Loues') this.activerVehiculesLoues();

  }

  activerMesVehicules() {
    this.mesVehicules = true;
    this.vehiculesLoues = false;
  }

  activerVehiculesLoues() {
    this.mesVehicules = false;
    this.vehiculesLoues = true;
  }

}
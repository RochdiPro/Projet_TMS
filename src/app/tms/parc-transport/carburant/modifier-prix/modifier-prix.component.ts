import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Data } from '@angular/router';
import Swal from 'sweetalert2';
import { CarburantService } from '../services/carburant.service';

@Component({
  selector: 'app-modifier-prix',
  templateUrl: './modifier-prix.component.html',
  styleUrls: ['./modifier-prix.component.scss'],
})
export class ModifierPrixComponent implements OnInit {
  //declaration des variables
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<ModifierPrixComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private fb: FormBuilder,
    private service: CarburantService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      prixCarburant: [
        this.data.carburant.prixCarburant,
        [Validators.required, Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')],
      ],
    });
  }

    //modifier prix carburant
    async miseAJourCarburant() { 
      var formData: any = new FormData();
      formData.append("id", this.data.carburant.id);
      formData.append("nom", this.data.carburant.nom);
      formData.append("prixCarburant", this.form.get('prixCarburant').value);
      this.service.modifierCarburant(formData).subscribe((next)=> {
        Swal.fire({
          icon: 'success',
          title: 'Carburant enregistré',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close()
      },
      (error)=> {
        console.log(error);
      });
    }

    fermerModifierCarburant() {
      this.dialogRef.close()
    }
}

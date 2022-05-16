import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CarburantService } from '../services/carburant.service';

@Component({
  selector: 'app-ajouter-carburant',
  templateUrl: './ajouter-carburant.component.html',
  styleUrls: ['./ajouter-carburant.component.scss']
})
export class AjouterCarburantComponent implements OnInit {
  //declaration des variables
  form: FormGroup;
  constructor(private fb: FormBuilder, private service: CarburantService, public _router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required]],
      prixCarburant: [
        '',
        [Validators.required, Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')],
      ],
    });
  }

   //ajouter nouveau carburant
   async enregistrerCarburant() {
    var formData: any = new FormData();
    formData.append('nom', this.form.get('nom').value);
    formData.append('prixCarburant', this.form.get('prixCarburant').value);
    Swal.fire({
      title: 'Voulez vous enregistrer?',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.service.creerCarburant(formData).toPromise();
        this.fermerAjouterCarburant();
        Swal.fire('Carburant enregistré!', '', 'success');
        this.form.get('nom').setValue("");
        this.form.get('prixCarburant').setValue("");
      }
    });
  }

  //fermer la boite de dialogue
  fermerAjouterCarburant(): void {
    this._router.navigateByUrl('/Menu/TMS/Parc/Carburants/lister-carburants')
  }

}

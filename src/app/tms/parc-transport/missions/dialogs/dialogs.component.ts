import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChauffeurService } from '../../chauffeurs/services/chauffeur.service';

// ************************************ Boite dialogue affecter chauffeur ********************************
@Component({
  selector: 'affecter-chauffeur',
  templateUrl: 'affecter-chauffeur.html',
  styleUrls: ['affecter-chauffeur.scss'],
})
export class AffecterChauffeur implements OnInit {
  chauffeursCompatibles: any;
  selectedValue: any;
  chauffeurs: any;
  couplesVehiculeChauffeurs: any = [];
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<AffecterChauffeur>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceChauffeur: ChauffeurService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this;
    this.creerForm();
    await this.getListeChauffeurs();
    this.verifierCompatibiliteChauffeur();
  }

  creerForm() {
    this.form = this.fb.group({
      chauffeurs: this.fb.array([]),
    });
    this.vehicules.forEach(() => {
        const chauffeur = this.fb.group({ chauffeur: '' });
        this.chauffeursForms.push(chauffeur);
        
    });
  }

  get chauffeursForms() {
    return this.form.get('chauffeurs') as FormArray;
  }

  get vehicules() {
    return this.data.vehicules;
  }

  async getListeChauffeurs() {
    this.chauffeurs = await this.serviceChauffeur.getChauffeurs().toPromise();
  }

  verifierCompatibiliteChauffeur() {
    this.vehicules.forEach((vehicule: any) => {
      let categorie = vehicule.vehicule.categories.split('/');
      let chauffeurs: any = [];
      categorie.forEach((value: any) => {
        this.chauffeurs.forEach((chauffeur: any) => {
          if (value === chauffeur.categorie_Permis) {
            chauffeurs.push(chauffeur);
          }
        });
      });
      this.couplesVehiculeChauffeurs.push({
        vehicule: vehicule.vehicule,
        chauffeurs: chauffeurs,
      });
    });
  }

  // si un chauffeur est disponible pour plusieurs vehicules et on selectionne se chauffeur dans un vehicule on l'enleve pour les autres
  rafraichirListeChauffeur(i: any){
    for (let j = 0; j < this.couplesVehiculeChauffeurs.length; j++) {
      this.couplesVehiculeChauffeurs[j].chauffeurs.forEach((chauffeurLoop: any) => {
        if(j !== i && this.chauffeursForms.controls[i].get('chauffeur').value === chauffeurLoop) {
          let index = this.couplesVehiculeChauffeurs[j].chauffeurs.findIndex((chauffeur: any) => this.chauffeursForms.controls[i].get('chauffeur').value.id === chauffeur.id);
          this.couplesVehiculeChauffeurs[j].chauffeurs.splice(index,1);
          console.log(this.couplesVehiculeChauffeurs[j].chauffeurs)
        }
      });
      
    }
  }

  //   bouton ok
  valider() {
    let couplesVehiculeChauffeur = [];
    for (let i = 0; i < this.couplesVehiculeChauffeurs.length; i++) {
      console.log(this.chauffeursForms.controls[i].get('chauffeur').value);
      couplesVehiculeChauffeur.push({
        vehicule: this.couplesVehiculeChauffeurs[i].vehicule,
        chauffeur: this.chauffeursForms.controls[i].get('chauffeur').value,
      });
    }
    this.dialogRef.close(couplesVehiculeChauffeur);
  }
}

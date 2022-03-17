import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { InfoGeneral } from '../interfaces et classes/info-general';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

@Component({
  selector: 'app-configuration-position',
  templateUrl: './configuration-position.component.html',
  styleUrls: ['./configuration-position.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('300ms', style({ opacity: 1, top: '30px' })),
      ]),
    ]),
  ],
})
export class ConfigurationPositionComponent implements OnInit {
  infos: InfoGeneral;
  formPosition: FormGroup;
  latitudeMap: number = 34.13805398935568;
  longitudeMap: number = 9.012231614565236;
  zoom: number = 5;

  latitudeMarker: number = 0;
  longitudeMarker: number = 0;
  afficherMarker = false;

  constructor(
    private fb: FormBuilder,
    private serviceConfig: ConfigurationTmsService
  ) {}

  ngOnInit(): void {
    this.creerFormGroup();
    // get infos generales
    this.serviceConfig.infosGenerals().subscribe((result) => {
      this.infos = result;
      // afficher les valeurs enregistrées dans les inputs
      if (this.infos.adresse != '') {
        this.adresse.setValue(this.infos.adresse);
        this.ville.setValue(this.infos.ville);
      }
      // afficher la position enregistrée sur le map
      if (this.infos.latitude != 0 && this.infos.longitude != 0) {
        this.latitudeMap = this.infos.latitude;
        this.latitudeMarker = this.infos.latitude;
        this.longitudeMap = this.infos.longitude;
        this.longitudeMarker = this.infos.longitude;
        this.afficherMarker = true;
      }
    });
  }

  // création du formGroup
  creerFormGroup() {
    this.formPosition = this.fb.group({
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
    });
  }

  positionerMarquer(event: any) {
    //pour positionner un marqueur sur le map
    if (!this.afficherMarker) {
      this.latitudeMarker = event.coords.lat;
      this.longitudeMarker = event.coords.lng;
      this.afficherMarker = true;
    }
  }
  modifierPositionMarquer(event: any) {
    //pour modifier la position du marqueur existant
    this.latitudeMarker = event.coords.lat;
    this.longitudeMarker = event.coords.lng;
  }

  enregistrer() {
    this.infos.adresse = this.adresse.value;
    this.infos.ville = this.ville.value;
    this.infos.latitude = this.latitudeMarker;
    this.infos.longitude = this.longitudeMarker;
    this.serviceConfig.modifierAdresse(this.infos).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Configuration bien enregistrée',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Une erreur est survenue lors de l'enregistrement de vos modifications!",
        });
      }
    );
  }

  // getters des formControls
  get adresse() {
    return this.formPosition.get('adresse');
  }

  get ville() {
    return this.formPosition.get('ville');
  }

  get coordonnePlaces() {
    let valide;
    this.latitudeMarker == 0 || this.longitudeMarker == 0
      ? (valide = false)
      : (valide = true);
    return valide;
  }
}

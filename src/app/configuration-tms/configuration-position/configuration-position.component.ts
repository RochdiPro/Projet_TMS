import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private serviceConfig: ConfigurationTmsService) {}

  ngOnInit(): void {
    this.creerFormGroup();
    this.serviceConfig.infosGenerals().subscribe((result) => {
      this.infos = result;
      if (this.infos.adresse != "") {
        this.adresse.setValue(this.infos.adresse);
        this.complementAdresse.setValue(this.infos.complementAdresse);
      }
      if (this.infos.latitude != 0 && this.infos.longitude != 0) {
        this.latitudeMap = this.infos.latitude;
        this.latitudeMarker = this.infos.latitude;
        this.longitudeMap = this.infos.longitude;
        this.longitudeMarker = this.infos.longitude;
        this.afficherMarker = true;
      }
    })
  }

  creerFormGroup() {
    this.formPosition = this.fb.group({
      adresse: ['', Validators.required],
      complementAdresse: [''],
    });
  }

  positionerMarquer(event: any) { //pour positionner un marqueur sur le map
    if (!this.afficherMarker) {
      this.latitudeMarker = event.coords.lat;
      this.longitudeMarker = event.coords.lng;
      this.afficherMarker = true;
    }

  }
  modifierPositionMarquer(event: any) { //pour modifier la position du marqueur existant
    this.latitudeMarker = event.coords.lat;
    this.longitudeMarker = event.coords.lng;

  }

  enregistrer() {
    this.infos.adresse = this.adresse.value;
    this.infos.complementAdresse = this.complementAdresse.value;
    this.infos.latitude = this.latitudeMarker;
    this.infos.longitude = this.longitudeMarker;
    this.serviceConfig.modifierAdresse(this.infos).subscribe(()=> {
      console.log("enregistrée");
    })
  }

  get adresse() {
    return this.formPosition.get('adresse');
  }

  get complementAdresse() {
    return this.formPosition.get('complementAdresse');
  }

  get coordonnePlaces() {
    let valide;
    (this.latitudeMarker == 0 || this.longitudeMarker == 0) ? valide = false : valide = true;
    return valide;
  }
}

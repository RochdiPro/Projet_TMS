import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  formPosition: FormGroup;
  latitudeMap: number = 0;
  longitudeMap: number = 0;
  zoom: number = 12;

  latitudeMarker: number = 0;
  longitudeMarker: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.creerFormGroup();
  }

  creerFormGroup() {
    this.formPosition = this.fb.group({
      adresse: ['', Validators.required],
      complementAdresse: [''],
    });
  }

  get adresse() {
    return this.formPosition.get('adresse');
  }
}

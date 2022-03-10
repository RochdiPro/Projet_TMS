import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

@Component({
  selector: 'app-configuration-serveur',
  templateUrl: './configuration-serveur.component.html',
  styleUrls: ['./configuration-serveur.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('300ms', style({ opacity: 1, top: '30px' })),
      ]),
    ]),
  ],
})
export class ConfigurationServeurComponent implements OnInit {
  formConfigurationServeur: FormGroup;
  constructor(
    private fb: FormBuilder,
    private serviceConfiguration: ConfigurationTmsService
  ) {}

  ngOnInit(): void {
    this.creerFormGroup();
  }

  creerFormGroup() {
    this.formConfigurationServeur = this.fb.group({
      adresseIP: ['', [
        Validators.required,
        Validators.pattern("^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\:([0-9]{4})$"),
      ],],
      adresseEmail: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      apiGoogle: ['', Validators.required]
    });
  }

  enregistrer() {

  }

  get adresseIP() {
    return this.formConfigurationServeur.get('adresseIP');
  }
  get apiGoogle() {
    return this.formConfigurationServeur.get('apiGoogle');
  }
  get email() {
    return this.formConfigurationServeur.get('adresseEmail');
  }
}

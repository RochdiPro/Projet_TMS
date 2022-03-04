import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-configuration-generale',
  templateUrl: './configuration-generale.component.html',
  styleUrls: ['./configuration-generale.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('300ms', style({ opacity: 1, top: '30px' })),
      ]),
    ]),
  ],
})
export class ConfigurationGeneraleComponent implements OnInit {
  formConfigurationInformationsGeneral: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.creerFormGroup();
  }

  creerFormGroup() {
    this.formConfigurationInformationsGeneral = this.fb.group({
      nomSociete: ['', Validators.required],
      numeroTelephone: [
        '',
        [Validators.required, Validators.pattern('^((\\+216-?)|0)?[0-9]{8}$')],
      ],
      adresseEmail: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });
  }

  get nomSociete() {
    return this.formConfigurationInformationsGeneral.get('nomSociete');
  }
  get numeroTelephone() {
    return this.formConfigurationInformationsGeneral.get('numeroTelephone');
  }
  get email() {
    return this.formConfigurationInformationsGeneral.get('adresseEmail');
  }
}

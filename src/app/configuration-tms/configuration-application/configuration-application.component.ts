import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ConfigurationApplication } from '../interfaces et classes/configuration-application';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

@Component({
  selector: 'app-configuration-application',
  templateUrl: './configuration-application.component.html',
  styleUrls: ['./configuration-application.component.scss'],
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
  configuration: ConfigurationApplication;
  email: string;
  constructor(
    private fb: FormBuilder,
    private serviceConfiguration: ConfigurationTmsService
  ) {}

  ngOnInit(): void {
    this.creerFormGroup();
    this.serviceConfiguration
      .getConfigurationApplication()
      .subscribe((result) => {
        this.configuration = result;
        if (this.configuration) {
          this.adresseIP.setValue(this.configuration.adresseIp);
          this.apiGoogle.setValue(this.configuration.apiKeyGoogle);
        }
      });
    this.serviceConfiguration
      .getEmailAdress()
      .subscribe((result) => {
        this.email = result;
      });
  }

  creerFormGroup() {
    this.formConfigurationServeur = this.fb.group({
      adresseIP: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}):([0-9]{4})$'
          ),
        ],
      ],
      apiGoogle: ['', Validators.required],
    });
  }

  enregistrer() {
    let nouvelConfig: ConfigurationApplication = new ConfigurationApplication(
      this.adresseIP.value,
      this.apiGoogle.value
    );
    if (this.configuration) {
      this.serviceConfiguration
        .modifierConfigurationApplication(nouvelConfig)
        .subscribe(
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
            throw error;
          }
        );
    } else {
      this.serviceConfiguration.createConfigApplication(nouvelConfig).subscribe(
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
  }

  get adresseIP() {
    return this.formConfigurationServeur.get('adresseIP');
  }
  get apiGoogle() {
    return this.formConfigurationServeur.get('apiGoogle');
  }
}

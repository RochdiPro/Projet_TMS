import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { InfoGeneral } from '../interfaces et classes/info-general';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

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
  infos: InfoGeneral;
  constructor(
    private fb: FormBuilder,
    private serviceConfiguration: ConfigurationTmsService
  ) {}

  ngOnInit(): void {
    this.creerFormGroup();
    this.serviceConfiguration.infosGenerals().subscribe((result) => {
      this.infos = result;
      if (this.infos) {
        this.nomSociete.setValue(this.infos.nomSociete);
        this.numeroTelephone.setValue(this.infos.telephone);
        this.email.setValue(this.infos.email);
      }
    });
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

  enregistrer() {
    let nouveauInfos: InfoGeneral = new InfoGeneral(
      this.nomSociete.value,
      this.numeroTelephone.value,
      this.email.value
    );
    if (this.infos) {
      this.serviceConfiguration.modifierInfosGenerals(nouveauInfos).subscribe(
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
    } else {
      this.serviceConfiguration.createInfosGenerals(nouveauInfos).subscribe(
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

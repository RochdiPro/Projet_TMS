import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { InfoGeneral } from '../classes/info-general';
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
    // get configuration info general
    this.serviceConfiguration.infosGenerals().subscribe((result) => {
      this.infos = result;
      // afficher les valeurs dans les inputs
      if (this.infos) {
        this.nomSociete.setValue(this.infos.nomSociete);
        this.numeroTelephone.setValue(this.infos.telephone);
        this.email.setValue(this.infos.email);
        this.matriculeFiscale.setValue(this.infos.matriculeFiscale);
        this.registreCommerce.setValue(this.infos.registreCommerce);
        this.numeroFax.setValue(this.infos.fax);
        this.siteWeb.setValue(this.infos.siteWeb);
        this.banque.setValue(this.infos.banque);
        this.rib.setValue(this.infos.rib);
      }
    });
  }

  // creation du formGroup info general
  creerFormGroup() {
    this.formConfigurationInformationsGeneral = this.fb.group({
      nomSociete: ['', Validators.required],
      matriculeFiscale: ['', Validators.required],
      registreCommerce: ['', Validators.required],
      banque: ['', Validators.required],
      rib: ['', Validators.required],
      numeroTelephone: [
        '',
        [Validators.required, Validators.pattern('^((\\+216-?)|0)?[0-9]{8}$')],
      ],
      numeroFax: [
        '',
        [Validators.required, Validators.pattern('^((\\+216-?)|0)?[0-9]{8}$')],
      ],
      siteWeb: ['', Validators.required],
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
      this.email.value,
      this.matriculeFiscale.value,
      this.registreCommerce.value,
      this.numeroFax.value,
      this.siteWeb.value,
      this.banque.value,
      this.rib.value
    );
    // si il'y a deja des information enregistrée on les modifient si non on crée des nouvelles informations
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

  //getters des formControls
  get nomSociete() {
    return this.formConfigurationInformationsGeneral.get('nomSociete');
  }
  get matriculeFiscale() {
    return this.formConfigurationInformationsGeneral.get('matriculeFiscale');
  }
  get registreCommerce() {
    return this.formConfigurationInformationsGeneral.get('registreCommerce');
  }
  get numeroTelephone() {
    return this.formConfigurationInformationsGeneral.get('numeroTelephone');
  }
  get numeroFax() {
    return this.formConfigurationInformationsGeneral.get('numeroFax');
  }
  get siteWeb() {
    return this.formConfigurationInformationsGeneral.get('siteWeb');
  }
  get email() {
    return this.formConfigurationInformationsGeneral.get('adresseEmail');
  }
  get banque() {
    return this.formConfigurationInformationsGeneral.get('banque');
  }
  get rib() {
    return this.formConfigurationInformationsGeneral.get('rib');
  }
}

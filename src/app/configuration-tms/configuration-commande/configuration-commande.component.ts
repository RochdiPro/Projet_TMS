import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EtapesCreationData } from '../dialogs/dialogs.component';
import { CoefficientsFraisLivraison } from '../interfaces et classes/coefficients-frais-livraison';
import { CoefficientsScoreCommande } from '../interfaces et classes/coefficients-score-commande';
import { ConfigurationExcel } from '../interfaces et classes/configuration-excel';
import { ConfigurationTmsService } from '../services/configuration-tms.service';

@Component({
  selector: 'app-configuration-commande',
  templateUrl: './configuration-commande.component.html',
  styleUrls: ['./configuration-commande.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('300ms', style({ opacity: 1, top: '30px' })),
      ]),
    ]),
  ],
})
export class ConfigurationCommandeComponent implements OnInit {
  formCoefficientFraisTransport: FormGroup;
  formCoefficientFormuleScore: FormGroup;
  formParametreExcel: FormGroup;

  coefficientFraisLivraison: CoefficientsFraisLivraison;
  coefficientsScoreCommande: CoefficientsScoreCommande;
  parametreExcel: ConfigurationExcel;

  hintTaxeFixe = false;
  hintLimite = false;
  hintUniteLimite = false;
  hintTaxeSupplimentaire = false;
  hintLimiteTaxeSupplimentaire = false;

  hoverClient = false;
  hoverFraisLivraison = false;
  hoverPrixFacture = false;
  hoverRetard = false;
  constructor(
    private fb: FormBuilder,
    private serviceConfig: ConfigurationTmsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.creerForms();
    // charger les paramétres de calcul frais livraison
    this.serviceConfig.fraisLivraison().subscribe((result) => {
      this.coefficientFraisLivraison = result;
      if (this.coefficientFraisLivraison) {
        this.taxefixe.setValue(this.coefficientFraisLivraison.taxeFixe);
        this.limite.setValue(this.coefficientFraisLivraison.limite);
        this.uniteLimite.setValue(this.coefficientFraisLivraison.uniteLimite);
        this.taxeSupplimentaire.setValue(
          this.coefficientFraisLivraison.taxeSupplimentaire
        );
        this.limiteTaxeSupplimentaire.setValue(
          this.coefficientFraisLivraison.limiteTaxeSupp
        );
      }
    });
    // charger les coefficcients du formule score commande
    this.serviceConfig.coeifficientsScoreCommande().subscribe((result) => {
      this.coefficientsScoreCommande = result;
      if (this.coefficientsScoreCommande) {
        this.client.setValue(this.coefficientsScoreCommande.client);
        this.fraisLivraison.setValue(
          this.coefficientsScoreCommande.fraisLivraison
        );
        this.prixFacture.setValue(this.coefficientsScoreCommande.prixFacture);
        this.retard.setValue(this.coefficientsScoreCommande.retard);
      }
    });
    // charger les paramétre des fichiers excels
    this.serviceConfig.configurationExcel().subscribe((result) => {
      this.parametreExcel = result;
      if (this.parametreExcel) {
        this.reference.setValue(this.parametreExcel.reference);
        this.idClient.setValue(this.parametreExcel.idClient);
        this.nomClient.setValue(this.parametreExcel.nomClient);
        this.contact.setValue(this.parametreExcel.contact);
        this.telephone.setValue(this.parametreExcel.telephone);
        this.email.setValue(this.parametreExcel.email);
        this.ville.setValue(this.parametreExcel.ville);
        this.adresse.setValue(this.parametreExcel.adresse);
        this.typePieceIdentite.setValue(this.parametreExcel.typePieceIdentite);
        this.numPieceIdentite.setValue(this.parametreExcel.numPieceIdentite);
        this.categorieClient.setValue(this.parametreExcel.categorieClient);
        this.dateCreation.setValue(this.parametreExcel.dateCreation);
        this.type.setValue(this.parametreExcel.type);
        this.modePaiement.setValue(this.parametreExcel.modePaiement);
        this.devise.setValue(this.parametreExcel.devise);
        this.totalTTC.setValue(this.parametreExcel.totalTTC);
        this.etat.setValue(this.parametreExcel.etat);
        this.idProduit.setValue(this.parametreExcel.idProduit);
        this.typeProduit.setValue(this.parametreExcel.typeProduit);
        this.nomProduit.setValue(this.parametreExcel.nomProduit);
        this.existanceNumSerie.setValue(this.parametreExcel.existanceNumSerie);
        this.existanceNumImei.setValue(this.parametreExcel.existanceNumImei);
        this.quantite.setValue(this.parametreExcel.quantite);
        this.numSerie.setValue(this.parametreExcel.numSerie);
        this.imei1.setValue(this.parametreExcel.imei1);
        this.imei2.setValue(this.parametreExcel.imei2);
      }
    });
  }

  creerForms() {
    this.formCoefficientFraisTransport = this.fb.group({
      taxefixe: ['', Validators.required],
      limite: ['', Validators.required],
      uniteLimite: ['', Validators.required],
      taxeSupplimentaire: ['', Validators.required],
      limiteTaxeSupplimentaire: ['', Validators.required],
    });
    this.formCoefficientFormuleScore = this.fb.group({
      client: ['', Validators.required],
      fraisLivraison: ['', Validators.required],
      prixFacture: ['', Validators.required],
      retard: ['', Validators.required],
    });
    this.formParametreExcel = this.fb.group({
      reference: ['', Validators.required],
      idClient: ['', Validators.required],
      nomClient: ['', Validators.required],
      contact: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', Validators.required],
      ville: ['', Validators.required],
      adresse: ['', Validators.required],
      typePieceIdentite: ['', Validators.required],
      numPieceIdentite: ['', Validators.required],
      categorieClient: ['', Validators.required],
      dateCreation: ['', Validators.required],
      type: ['', Validators.required],
      modePaiement: ['', Validators.required],
      devise: ['', Validators.required],
      totalTTC: ['', Validators.required],
      etat: ['', Validators.required],
      idProduit: ['', Validators.required],
      typeProduit: ['', Validators.required],
      nomProduit: ['', Validators.required],
      existanceNumSerie: ['', Validators.required],
      existanceNumImei: ['', Validators.required],
      quantite: ['', Validators.required],
      numSerie: ['', Validators.required],
      imei1: ['', Validators.required],
      imei2: ['', Validators.required],
    });
  }

  enregistrerCoefficientFraisTransport() {
    let nouveauCoefficientFraisLivraison = new CoefficientsFraisLivraison(
      this.taxefixe.value,
      this.limite.value,
      this.uniteLimite.value,
      this.taxeSupplimentaire.value,
      this.limiteTaxeSupplimentaire.value
    );
    if (this.coefficientFraisLivraison) {
      this.serviceConfig
        .modifierCoefficientsFraisLivraison(nouveauCoefficientFraisLivraison)
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
          }
        );
    } else {
      this.serviceConfig
        .createCoefficientsFraisLivraison(nouveauCoefficientFraisLivraison)
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
          }
        );
    }
  }

  enregistrerCoefficientsFormuleScore() {
    let nouveauCoefficientsFormuleScore = new CoefficientsScoreCommande(
      this.prixFacture.value,
      this.fraisLivraison.value,
      this.client.value,
      this.retard.value
    );
    if (this.coefficientsScoreCommande) {
      this.serviceConfig
        .modifierCoefficientsScoreCommande(nouveauCoefficientsFormuleScore)
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
          }
        );
    } else {
      this.serviceConfig
        .createCoefficientsScoreCommande(nouveauCoefficientsFormuleScore)
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
          }
        );
    }
  }

  enregistrerParametreExcel() {
    let nouveauParametreExcel = new ConfigurationExcel(
      this.reference.value,
      this.idClient.value,
      this.nomClient.value,
      this.contact.value,
      this.telephone.value,
      this.email.value,
      this.ville.value,
      this.adresse.value,
      this.typePieceIdentite.value,
      this.numPieceIdentite.value,
      this.categorieClient.value,
      this.dateCreation.value,
      this.type.value,
      this.modePaiement.value,
      this.devise.value,
      this.totalTTC.value,
      this.etat.value,
      this.idProduit.value,
      this.typeProduit.value,
      this.nomProduit.value,
      this.existanceNumSerie.value,
      this.existanceNumImei.value,
      this.quantite.value,
      this.numSerie.value,
      this.imei1.value,
      this.imei2.value
    );
    if (this.parametreExcel) {
      this.serviceConfig
        .modifierParametreExcel(nouveauParametreExcel)
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
          }
        );
    } else {
      this.serviceConfig.createConfigExcel(nouveauParametreExcel).subscribe(
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

  hoverCoefficientScore(coefficient: string) {
    let hover;
    switch (coefficient) {
      case 'client':
        this.hoverClient = true;
        this.hoverFraisLivraison = false;
        this.hoverPrixFacture = false;
        this.hoverRetard = false;
        break;
      case 'frais livraison':
        this.hoverClient = false;
        this.hoverFraisLivraison = true;
        this.hoverPrixFacture = false;
        this.hoverRetard = false;
        break;
      case 'prix facture':
        this.hoverClient = false;
        this.hoverFraisLivraison = false;
        this.hoverPrixFacture = true;
        this.hoverRetard = false;
        break;
      case 'retard':
        this.hoverClient = false;
        this.hoverFraisLivraison = false;
        this.hoverPrixFacture = false;
        this.hoverRetard = true;
        break;
      case 'nohover':
        this.hoverClient = false;
        this.hoverFraisLivraison = false;
        this.hoverPrixFacture = false;
        this.hoverRetard = false;
        break;

      default:
        break;
    }
  }

  ovrirEtapesCreationData() {
    this.dialog.open(EtapesCreationData, {
      width: '600px'
    })
  }

  get taxefixe() {
    return this.formCoefficientFraisTransport.get('taxefixe');
  }

  get limite() {
    return this.formCoefficientFraisTransport.get('limite');
  }

  get uniteLimite() {
    return this.formCoefficientFraisTransport.get('uniteLimite');
  }

  get taxeSupplimentaire() {
    return this.formCoefficientFraisTransport.get('taxeSupplimentaire');
  }

  get limiteTaxeSupplimentaire() {
    return this.formCoefficientFraisTransport.get('limiteTaxeSupplimentaire');
  }

  get client() {
    return this.formCoefficientFormuleScore.get('client');
  }

  get fraisLivraison() {
    return this.formCoefficientFormuleScore.get('fraisLivraison');
  }

  get prixFacture() {
    return this.formCoefficientFormuleScore.get('prixFacture');
  }

  get retard() {
    return this.formCoefficientFormuleScore.get('retard');
  }

  get reference() {
    return this.formParametreExcel.get('reference');
  }

  get idClient() {
    return this.formParametreExcel.get('idClient');
  }

  get nomClient() {
    return this.formParametreExcel.get('nomClient');
  }

  get contact() {
    return this.formParametreExcel.get('contact');
  }

  get telephone() {
    return this.formParametreExcel.get('telephone');
  }

  get email() {
    return this.formParametreExcel.get('email');
  }

  get ville() {
    return this.formParametreExcel.get('ville');
  }

  get adresse() {
    return this.formParametreExcel.get('adresse');
  }

  get typePieceIdentite() {
    return this.formParametreExcel.get('typePieceIdentite');
  }

  get numPieceIdentite() {
    return this.formParametreExcel.get('numPieceIdentite');
  }

  get categorieClient() {
    return this.formParametreExcel.get('categorieClient');
  }

  get dateCreation() {
    return this.formParametreExcel.get('dateCreation');
  }

  get type() {
    return this.formParametreExcel.get('type');
  }

  get modePaiement() {
    return this.formParametreExcel.get('modePaiement');
  }

  get devise() {
    return this.formParametreExcel.get('devise');
  }

  get totalTTC() {
    return this.formParametreExcel.get('totalTTC');
  }

  get etat() {
    return this.formParametreExcel.get('etat');
  }

  get idProduit() {
    return this.formParametreExcel.get('idProduit');
  }

  get typeProduit() {
    return this.formParametreExcel.get('typeProduit');
  }

  get nomProduit() {
    return this.formParametreExcel.get('nomProduit');
  }

  get existanceNumSerie() {
    return this.formParametreExcel.get('existanceNumSerie');
  }

  get existanceNumImei() {
    return this.formParametreExcel.get('existanceNumImei');
  }

  get quantite() {
    return this.formParametreExcel.get('quantite');
  }

  get numSerie() {
    return this.formParametreExcel.get('numSerie');
  }

  get imei1() {
    return this.formParametreExcel.get('imei1');
  }

  get imei2() {
    return this.formParametreExcel.get('imei2');
  }
}

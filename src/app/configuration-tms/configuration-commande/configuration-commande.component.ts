import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-configuration-commande',
  templateUrl: './configuration-commande.component.html',
  styleUrls: ['./configuration-commande.component.scss'],
})
export class ConfigurationCommandeComponent implements OnInit {
  formCoefficientFraisTransport: FormGroup;
  formCoefficientFormuleScore: FormGroup;
  formParametreExcel: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.creerForms();
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
}

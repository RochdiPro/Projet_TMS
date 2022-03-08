import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  constructor(private fb: FormBuilder, private serviceConfig: ConfigurationTmsService) {}

  ngOnInit(): void {
    this.creerForms();
    this.serviceConfig.fraisLivraison().subscribe((result) => {
      
    })
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

  get taxefixe() {
    return this.formCoefficientFraisTransport.get("taxefixe");
  }

  get limite() {
    return this.formCoefficientFraisTransport.get("limite");
  }

  get uniteLimite() {
    return this.formCoefficientFraisTransport.get("uniteLimite");
  }

  get taxeSupplimentaire() {
    return this.formCoefficientFraisTransport.get("taxeSupplimentaire");
  }

  get limiteTaxeSupplimentaire() {
    return this.formCoefficientFraisTransport.get("limiteTaxeSupplimentaire");
  }

  get client() {
    return this.formCoefficientFormuleScore.get("client");
  }

  get fraisLivraison() {
    return this.formCoefficientFormuleScore.get("fraisLivraison");
  }

  get prixFacture() {
    return this.formCoefficientFormuleScore.get("prixFacture");
  }

  get retard() {
    return this.formCoefficientFormuleScore.get("retard");
  }

  get reference() {
    return this.formParametreExcel.get("reference");
  }

  get idClient() {
    return this.formParametreExcel.get("idClient");
  }

  get nomClient() {
    return this.formParametreExcel.get("nomClient");
  }

  get contact() {
    return this.formParametreExcel.get("contact");
  }

  get telephone() {
    return this.formParametreExcel.get("telephone");
  }

  get email() {
    return this.formParametreExcel.get("email");
  }

  get ville() {
    return this.formParametreExcel.get("ville");
  }

  get adresse() {
    return this.formParametreExcel.get("adresse");
  }

  get typePieceIdentite() {
    return this.formParametreExcel.get("typePieceIdentite");
  }

  get numPieceIdentite() {
    return this.formParametreExcel.get("numPieceIdentite");
  }

  get categorieClient() {
    return this.formParametreExcel.get("categorieClient");
  }

  get dateCreation() {
    return this.formParametreExcel.get("dateCreation");
  }

  get type() {
    return this.formParametreExcel.get("type");
  }

  get modePaiement() {
    return this.formParametreExcel.get("modePaiement");
  }

  get devise() {
    return this.formParametreExcel.get("devise");
  }

  get totalTTC() {
    return this.formParametreExcel.get("totalTTC");
  }

  get etat() {
    return this.formParametreExcel.get("etat");
  }

  get idProduit() {
    return this.formParametreExcel.get("idProduit");
  }

  get typeProduit() {
    return this.formParametreExcel.get("typeProduit");
  }

  get nomProduit() {
    return this.formParametreExcel.get("nomProduit");
  }

  get existanceNumSerie() {
    return this.formParametreExcel.get("existanceNumSerie");
  }

  get existanceNumImei() {
    return this.formParametreExcel.get("existanceNumImei");
  }

  get quantite() {
    return this.formParametreExcel.get("quantite");
  }

  get numSerie() {
    return this.formParametreExcel.get("numSerie");
  }

  get imei1() {
    return this.formParametreExcel.get("imei1");
  }

  get imei2() {
    return this.formParametreExcel.get("imei2");
  }
}

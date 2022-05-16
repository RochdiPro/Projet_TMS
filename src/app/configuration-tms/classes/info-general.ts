export class InfoGeneral {
  id: number;
  nomSociete: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  latitude: number;
  longitude: number;
  matriculeFiscale: string;
  registreCommerce: string;
  fax: string;
  siteWeb: string;
  banque: string;
  rib: string;

  constructor(
    nomSociete: string,
    telephone: string,
    email: string,
    matriculeFiscale: string,
    registreCommerce: string,
    fax: string,
    siteWeb: string,
    banque: string,
    rib: string
  ) {
    this.nomSociete = nomSociete;
    this.telephone = telephone;
    this.email = email;
    this.adresse = '';
    this.ville = '';
    this.latitude = 0;
    this.longitude = 0;
    this.matriculeFiscale = matriculeFiscale;
    this.registreCommerce = registreCommerce;
    this.fax = fax;
    this.siteWeb = siteWeb;
    this.banque = banque;
    this.rib = rib;
  }
}

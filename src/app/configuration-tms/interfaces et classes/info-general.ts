export class InfoGeneral {
  id: number;
  nomSociete: string;
  telephone: string;
  email: string;
  adresse: string;
  complementAdresse: string;
  latitude: number;
  longitude: number;

  constructor(
    nomSociete: string, 
    telephone: string, 
    email: string, 
) {
    this.nomSociete = nomSociete
    this.telephone = telephone
    this.email = email
    this.adresse = ""
    this.complementAdresse = ""
    this.latitude = 0
    this.longitude = 0
  }

}

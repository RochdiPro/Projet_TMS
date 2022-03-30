export class InfoGeneral {
  id: number;
  nomSociete: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
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
    this.ville = ""
    this.latitude = 0
    this.longitude = 0
  }

}

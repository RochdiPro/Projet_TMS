export class ConfigurationExcel {
  reference: string;
  idClient: string;
  nomClient: string;
  contact: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  typePieceIdentite: string;
  numPieceIdentite: string;
  categorieClient: string;
  dateCreation: string;
  type: string;
  modePaiement: string;
  devise: string;
  totalTTC: string;
  etat: string;
  idProduit: string;
  typeProduit: string;
  nomProduit: string;
  existanceNumSerie: string;
  existanceNumImei: string;
  quantite: string;
  numSerie: string;
  imei1: string;
  imei2: string;

  constructor(
    reference: string, 
    idClient: string, 
    nomClient: string, 
    contact: string, 
    telephone: string, 
    email: string, 
    ville: string, 
    adresse: string, 
    typePieceIdentite: string, 
    numPieceIdentite: string, 
    categorieClient: string, 
    dateCreation: string, 
    type: string, 
    modePaiement: string, 
    devise: string, 
    totalTTC: string, 
    etat: string, 
    idProduit: string, 
    typeProduit: string, 
    nomProduit: string, 
    existanceNumSerie: string, 
    existanceNumImei: string, 
    quantite: string, 
    numSerie: string, 
    imei1: string, 
    imei2: string
) {
    this.reference = reference
    this.idClient = idClient
    this.nomClient = nomClient
    this.contact = contact
    this.telephone = telephone
    this.email = email
    this.ville = ville
    this.adresse = adresse
    this.typePieceIdentite = typePieceIdentite
    this.numPieceIdentite = numPieceIdentite
    this.categorieClient = categorieClient
    this.dateCreation = dateCreation
    this.type = type
    this.modePaiement = modePaiement
    this.devise = devise
    this.totalTTC = totalTTC
    this.etat = etat
    this.idProduit = idProduit
    this.typeProduit = typeProduit
    this.nomProduit = nomProduit
    this.existanceNumSerie = existanceNumSerie
    this.existanceNumImei = existanceNumImei
    this.quantite = quantite
    this.numSerie = numSerie
    this.imei1 = imei1
    this.imei2 = imei2
  }

}

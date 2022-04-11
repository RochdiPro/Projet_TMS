export class ConfigurationExcelProduit {
  id: number;
  idProduit: string;
  nom: string;
  marque: string;
  unite: string;
  valeurUnite: string;
  codeBarre: string;
  type1: string;
  type2: string;


  constructor(
    idProduit: string,
    nom: string,
    marque: string,
    unite: string,
    valeurUnite: string,
    codeBarre: string,
    type1: string,
    type2: string,

  ) {
    this.idProduit = idProduit;
    this.nom = nom;
    this.marque = marque;
    this.unite = unite;
    this.valeurUnite = valeurUnite;
    this.codeBarre = codeBarre;
    this.type1 = type1;
    this.type2 = type2;
  }
}

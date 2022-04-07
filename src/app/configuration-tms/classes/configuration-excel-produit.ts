export class ConfigurationExcelProduit {
  id: number;
  idProduit: string;
  nom: string;
  marque: string;
  unite: string;
  valeurUnite: string;
  codeBarre: string;
  longueur: string;
  largeur: string;
  hauteur: string;
  volume: string;
  poids: string;

  constructor(
    idProduit: string,
    nom: string,
    marque: string,
    unite: string,
    valeurUnite: string,
    codeBarre: string,
    longueur: string,
    largeur: string,
    hauteur: string,
    volume: string,
    poids: string
  ) {
    this.idProduit = idProduit;
    this.nom = nom;
    this.marque = marque;
    this.unite = unite;
    this.valeurUnite = valeurUnite;
    this.codeBarre = codeBarre;
    this.longueur = longueur;
    this.largeur = largeur;
    this.hauteur = hauteur;
    this.volume = volume;
    this.poids = poids;
  }
}

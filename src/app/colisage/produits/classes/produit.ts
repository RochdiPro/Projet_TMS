export class Produit {
    id: number;
    nom: string;
    marque: string;
    unite: string;
    valeurUnite: number;
    codeBarre: string;
    longueur: number;
    largeur: number;
    hauteur: number;
    volume: number;
    poids: number;

  constructor(
    nom: string, 
    marque: string, 
    unite: string, 
    valeurUnite: number, 
    codeBarre: string, 
    longueur: number, 
    largeur: number, 
    hauteur: number, 
    volume: number, 
    poids: number
) {
    this.nom = nom
    this.marque = marque
    this.unite = unite
    this.valeurUnite = valeurUnite
    this.codeBarre = codeBarre
    this.longueur = longueur
    this.largeur = largeur
    this.hauteur = hauteur
    this.volume = volume
    this.poids = poids
  }

}
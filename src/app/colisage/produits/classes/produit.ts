export class Produit {
    id: number;
    idProduit: number;
    nom: string;
    marque: string;
    unite: string;
    valeurUnite: number;
    codeBarre: string;
    type1: number;
    type2: number;


  constructor(
    nom: string, 
    marque: string, 
    unite: string, 
    valeurUnite: number, 
    codeBarre: string, 
    type1: number, 
    type2: number, 

) {
    this.nom = nom
    this.marque = marque
    this.unite = unite
    this.valeurUnite = valeurUnite
    this.codeBarre = codeBarre
    this.type1 = type1
    this.type2 = type2
  }

}
export class CoefficientsScoreCommande {
  prixFacture: number;
  fraisLivraison: number;
  client: number;
  retard: number;

  constructor(
    prixFacture: number, 
    fraisLivraison: number, 
    client: number, 
    retard: number
) {
    this.prixFacture = prixFacture
    this.fraisLivraison = fraisLivraison
    this.client = client
    this.retard = retard
  }

}

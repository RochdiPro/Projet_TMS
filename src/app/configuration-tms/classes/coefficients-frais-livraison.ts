export class CoefficientsFraisLivraison {
  id: number;
  taxeFixe: number;
  limite: number;
  uniteLimite: string;
  taxeSupplimentaire: number;
  limiteTaxeSupp: number;

  constructor( 
    taxeFixe: number, 
    limite: number, 
    uniteLimite: string, 
    taxeSupplimentaire: number, 
    limiteTaxeSupp: number
) {
    this.taxeFixe = taxeFixe
    this.limite = limite
    this.uniteLimite = uniteLimite
    this.taxeSupplimentaire = taxeSupplimentaire
    this.limiteTaxeSupp = limiteTaxeSupp
  }

}
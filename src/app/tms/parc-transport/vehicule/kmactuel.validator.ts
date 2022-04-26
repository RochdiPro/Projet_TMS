import { AbstractControl } from "@angular/forms";

export function kmactuelValidator(control: AbstractControl): { [key: string]: any } | null {
    const kmactuel = Number(localStorage.getItem('kmactuelV'));
    const km = (Number(control.value) <= kmactuel);
    return km ? {'kmvalide': {value: control.value}} : null ;
}
//validateur définie pour verifier si le kilométrage entré lors du changement du kilométrage actuelle du véhicule est valide
//ce validateur est utilisé dans la boite de dialogue Mise A Jour Consommation


export function kmactuelConsommationValidator(control: AbstractControl): { [key: string]: any } | null {
    const kmactuel = Number(localStorage.getItem('kmactuelV'));
    const capaciteReservoir = Number(localStorage.getItem('capaciteReservoir'));
    const reservoir = Number(localStorage.getItem('reservoir'));
    const consommationNormale = Number(localStorage.getItem('consommationNormale'));
    const carburantDispo = (capaciteReservoir / 100) * reservoir; 
    const kilometragePossible = (carburantDispo / consommationNormale)*100;
    const km = (Number(control.value) > ((kilometragePossible * 2) + kmactuel));
    return km ? {'kmconsovalide': {value: control.value}} : null ;
}
//validateur définie pour verifier si le kilométrage entré lors du changement du kilométrage actuelle du véhicule est valide
//ce validateur est utilisé dans la boite de dialogue Mise A Jour Consommation
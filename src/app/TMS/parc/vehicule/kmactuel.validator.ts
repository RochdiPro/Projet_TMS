import { AbstractControl } from "@angular/forms";

export function kmactuelValidator(control: AbstractControl): { [key: string]: any } | null {
    const kmactuel = localStorage.getItem('kmactuelV');
    const km = (control.value < kmactuel);
    return km ? {'kmvalide': {value: control.value}} : null ;
}
//validateur définie pour verifier si le kilométrage entré lors du changement du kilométrage actuelle du véhicule est valide
//ce validateur est utilisé dans la boite de dialogue Mise A Jour Consommation
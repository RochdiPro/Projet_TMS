import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration-tms',
  templateUrl: './configuration-tms.component.html',
  styleUrls: ['./configuration-tms.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ConfigurationTmsComponent implements OnInit {
  generalEstActive = true;
  positionEstActive = false;
  commandeEstActive = false;
  serveurEstActive = false;
  constructor() {}

  ngOnInit(): void {}

  changerCategorieConfig(categorie: string) {
    switch (categorie) {
      case 'general':
        this.positionEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        setTimeout(() => {
          this.generalEstActive = true;
        }, 550);
        break;

      case 'position':
        this.generalEstActive = false;
        this.commandeEstActive = false;
        this.serveurEstActive = false;
        setTimeout(() => {
          this.positionEstActive = true;
        }, 550);
        break;

      case 'commande':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.serveurEstActive = false;
        setTimeout(() => {
          this.commandeEstActive = true;
        }, 550);
        break;

      case 'serveur':
        this.generalEstActive = false;
        this.positionEstActive = false;
        this.commandeEstActive = false;
        setTimeout(() => {
          this.serveurEstActive = true;
        }, 550);
        break;

      default:
        break;
    }
  }
}

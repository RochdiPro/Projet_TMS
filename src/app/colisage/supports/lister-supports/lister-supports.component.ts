import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupportService } from '../services/support.service';

@Component({
  selector: 'app-lister-supports',
  templateUrl: './lister-supports.component.html',
  styleUrls: ['./lister-supports.component.scss'],
})
export class ListerSupportsComponent implements OnInit {
  listeSupports: any;
  constructor(private serviceSupport: SupportService, public router: Router) {}

  ngOnInit(): void {
    this.chargerListeSupports();
  }

  // get le liste des supports
  async chargerListeSupports() {
    this.listeSupports = await this.serviceSupport.supports().toPromise();
  }

  modifierSupport(support: any) {
    this.serviceSupport.supp = support; //on enregistre le support dans une variable dans le SupportService pour le passer a l'interface de modification
    this.router.navigate(['/Menu/Menu_Colisage/Supports/Modifier_Support']); //navigation vers l'interface modifier support
  }

  async supprimerSupport(support: any) {
    await this.serviceSupport.supprimerSupport(support.id_support).toPromise();
    this.chargerListeSupports(); //actualisation du liste support aprés supprimation
  }
}

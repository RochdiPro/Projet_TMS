import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColisageService } from 'src/app/colisage.service';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-lister-supports',
  templateUrl: './lister-supports.component.html',
  styleUrls: ['./lister-supports.component.scss']
})
export class ListerSupportsComponent implements OnInit {
  listeSupports : any;
  constructor(private service : ColisageService, private data: DataService, public router: Router) { }

  ngOnInit(): void {
    this.chargerListeSupports();
   }

  async chargerListeSupports(){
    this.listeSupports = await this.service.supports().toPromise()
  }

  modifierSupport(support: any){
    this.data.support = support;
    this.router.navigate(['/Menu/Menu_Colisage/Supports/Modifier_Support'])
  }

  async supprimerSupport(support: any){
    await this.service.supprimerSupport((support.id_support)).toPromise();
    this.chargerListeSupports();
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  nom: any;
  acces: any;
  tms: any;
  wms: any;
  constructor(
    private authentocationService: AuthenticationService,
    private router: Router
  ) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
    this.wms = Number(arrayOfDigits[4]);
  }

  ngOnInit(): void {}

  deconnecter() {
    this.authentocationService.logOut();
    this.router.navigate(['Login']);
  }
}

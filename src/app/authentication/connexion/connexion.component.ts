import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent {
  id: any;
  liste: any = [];
  invalidLogin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginservice: AuthenticationService
  ) {}

  ngOnInit(): void {
    if (this.loginservice.isUserLoggedIn()) {
      this.router.navigate(['Menu']);
      this.invalidLogin = false;
    } else this.invalidLogin = true;
  }

  async connecter(username: any, password: any) {
    if (await this.loginservice.authenticate(username, password)) {
      this.router.navigate(['Menu']);
      this.invalidLogin = false;
    } else this.invalidLogin = true;
  }
}

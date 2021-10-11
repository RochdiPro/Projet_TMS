import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ColisageService } from 'src/app/colisage.service';

// ******************************************************************************************
// ************************************* Interface Supports *********************************
// ******************************************************************************************
@Component({
  selector: 'app-supports',
  templateUrl: './supports.component.html',
  styleUrls: ['./supports.component.scss']
})
export class SupportsComponent implements OnInit {
  listerEstActive = false;
  ajouterEstActive = false;
  constructor(public router: Router) { }

  ngOnInit(): void {
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Liste_Support') this.activerLister();
    if (this.router.url === '/Menu/Menu_Colisage/Supports/Ajouter_Support') this.activerAjouter();
  }

  activerLister() {
    this.listerEstActive = true;
    this.ajouterEstActive = false;
  }

  activerAjouter() {
    this.listerEstActive = false;
    this.ajouterEstActive = true;
  }


}





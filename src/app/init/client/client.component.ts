import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  nom: any;
  acces: any;
  tms: any;
  wms: any;
  constructor() {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
    this.wms = Number(arrayOfDigits[4]);
   }
  option1:any=false;
  option2:any=false;
  ngOnInit(): void {
  }
  fnoption1(){
    this.option1=true;
    this.option2=false
 }fnoption2(){
  this.option2=true;
  this.option1=false
}

}

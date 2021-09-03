import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientServiceService } from '../client-service-service.service';

@Component({
  selector: 'app-sub-child',
  templateUrl: './sub-child.component.html',
  styleUrls: ['./sub-child.component.scss']
})
export class SubChildComponent implements OnInit {
  Clients:  any;
  constructor(private http: HttpClient, private serviceClient: ClientServiceService, private router: Router) {     
    this.serviceClient.ListeClients().subscribe(list => {
      this.Clients =  list ;
      console.log(list)      
    });

  }

  ngOnInit(): void {
  }

}

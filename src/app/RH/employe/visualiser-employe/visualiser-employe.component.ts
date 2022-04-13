import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
 
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
 import { VisualiserImageEmploye } from '../modifier-employe/modifier-employe.component';
import { EmployeServiceService } from '../Service/employe-service.service';
  
  @Component({
  selector: 'app-visualiser-employe',
  templateUrl: './visualiser-employe.component.html',
  styleUrls: ['./visualiser-employe.component.scss']
})
export class VisualiserEmployeComponent  {   
 
  employe: any;
  id_emp: number
  constructor(private datePipe: DatePipe,EmployeServiceService:EmployeServiceService, public dialog: MatDialog,  private fb: FormBuilder, private route: ActivatedRoute) {    
      
    this.id_emp = this.route.snapshot.params.id ;  
    EmployeServiceService.Employe(this.id_emp).subscribe((data) =>
    {
             this.employe=data
    } 
    )
  }
   
  afficherImage(id2: any): void {   
    
    const dialogRef = this.dialog.open(VisualiserImageEmploye, {
      data: { Id: id2 }
    });

    dialogRef.afterClosed().subscribe(result => {
    

    });
  }


  

}

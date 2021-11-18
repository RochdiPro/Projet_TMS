import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// ************************************ Boite dialogue affecter chauffeur ********************************
@Component({
    selector: 'affecter-chauffeur',
    templateUrl: 'affecter-chauffeur.html',
    styleUrls: ['affecter-chauffeur.scss']
})

export class AffecterChauffeur implements OnInit {
    vehicules: any;
    chauffeursCompatibles: any;
    selectedValue: any;
    constructor(private dialogRef: MatDialogRef<AffecterChauffeur>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() { }
}
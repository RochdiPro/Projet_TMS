import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Backup } from '../classes/backup';
import { ProduitService } from '../services/produit.service';
const erp = '/ERP/';
@Component({
  selector: 'importer-exporter-produit',
  templateUrl: './importer-exporter-produit.html',
  styleUrls: ['./importer-exporter-produit.scss'],
})
export class ImporterExporterProduitsComponent implements OnInit {
  fileName = '';
  uploadProgress: number;
  uploadSub: Subscription;
  backups: Backup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  constructor(private http: HttpClient, private service: ProduitService) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1004400');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }
  ngOnInit(): void {
    this.getBackup();
  }

  //get les backups enregistrés
  getBackup() {
    this.service.getBackup().subscribe((res) => {
      this.backups = res;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      const formData = new FormData();
      formData.append('file', file);

      const upload$ = this.http
        .post(erp + 'upload-fichier-produit', formData, {
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          finalize(() => {
            this.reset();
            Swal.fire({
              icon: 'success',
              title: 'Liste des produits est bien enregistrée',
              showConfirmButton: false,
              timer: 1500,
            });
            this.service.ajouterBackup(file).subscribe(() => {
              this.getBackup();
            });
          })
        );

      this.uploadSub = upload$.subscribe((event) => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        }
      });
    }
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  restaurerListeProduit(numBackup: string) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'La liste des produits actuelle sera écrasée!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'oui',
      cancelButtonText: 'non',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.restaurerListeProduit(numBackup).subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Liste des produits est restaurée avec succès',
              showConfirmButton: false,
              timer: 1500,
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Echec de restauration!',
            });
          }
        );
      }
    });
  }

  exporterListeProduit() {
    this.service.exporterListeProduit().subscribe((response: any) => {
      let blob: any = new Blob([response], { type: 'text/xml; charset=utf-8' });
      var downloadURL = window.URL.createObjectURL(response);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "liste-produits.xml";
      link.click();
    }),
      (error: any) => console.log('Error downloading the file'),
      () => console.info('File downloaded successfully');
  }
}

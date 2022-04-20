import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ConfigurationTmsService } from '../services/configuration-tms.service';
const erp = '/ERP/';
@Component({
  selector: 'app-importer-exporter',
  templateUrl: './importer-exporter.component.html',
  styleUrls: ['./importer-exporter.component.scss']
})
export class ImporterExporterComponent implements OnInit {
  fileName: any;
  uploadProgress: number;
  uploadSub: Subscription;

  constructor(private service: ConfigurationTmsService, private http: HttpClient) { }

  ngOnInit(): void {
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

    //exporter liste emballage
    exporterListeEmballages() {
      this.service.exporterEmballages().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-emballages.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    //exporter liste supports
    exporterListeSupports() {
      this.service.exporterSupports().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-supports.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    onFileEmballageSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'upload-fichier-emballages', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des emballages est bien importée',
                showConfirmButton: false,
                timer: 1500,
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

    onFileSupportSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-fichier-supports', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des supports est bien importée',
                showConfirmButton: false,
                timer: 1500,
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

    onFileProduitSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-fichier-produits', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des produits est bien importée',
                showConfirmButton: false,
                timer: 1500,
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


}

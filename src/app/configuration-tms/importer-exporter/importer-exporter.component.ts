/**
 Liste des methodes:
 * exporterListeProduit: exporter la liste des produits.
 * exporterListeEmballages: exporter liste emballage.
 * exporterListeSupports: exporter liste supports.
 * exporterListeCommandes: exporter liste commandes.
 * exporterListeVehicules: exporter liste vehicules.
 * exporterListeVehiculesLoues: exporter liste vehicules loués.
 * exporterListeCarburants: exporter liste carburants
 * exporterListeMissions: exporter liste missions
 * onFileEmballageSelected: importer la liste des emballages depuis un fichier xml
 * onFileSupportSelected: importer la liste des supports depuis un fichier xml
 * onFileProduitSelected: importer la liste des produits depuis un fichier xml
 * onFileCommandeSelected: importer la liste des commandes depuis un fichier xml.
 * onFileVehiculesSelected: importer la liste des vehicules depuis un fichier xml.
 * onFileVehiculesLouesSelected: importer la liste des vehicules loués depuis un fichier xml.
 * onFileCarburantSelected: importer la liste des carburants depuis un fichier xml.
 * onFileMissionSelected: importer la liste des missions depuis un fichier xml.
 * cancelUpload: annuler l'importation
 * reset: reinitialise l'etat du chargement du document xml
 */

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
  fileNameEmballage: any;
  fileNameProduit: any;
  fileNameSupport: any;
  fileNameCommande: any;
  fileNameVehicule: any;
  fileNameVehiculeLoue: any;
  fileNameCarburant: any;
  fileNameMission: any;
  uploadProgress: number;
  uploadSub: Subscription;

  constructor(private service: ConfigurationTmsService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  // exporter la liste des produits
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

    //exporter liste commandes
    exporterListeCommandes() {
      this.service.exporterCommandes().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-commandes.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    //exporter liste vehicules
    exporterListeVehicules() {
      this.service.exporterVehicules().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-vehicules.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    //exporter liste vehicules loués
    exporterListeVehiculesLoues() {
      this.service.exporterVehiculesLoues().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-vehicules-loues.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    //exporter liste carburants
    exporterListeCarburants() {
      this.service.exporterCarburants().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-carburanrs.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }

    //exporter liste missions
    exporterListeMissions() {
      this.service.exporterMissions().subscribe((response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "liste-missions.xml";
        link.click();
      }),
        (error: any) => console.log('Error downloading the file'),
        () => console.info('File downloaded successfully');
    }
    // importer la liste des emballages depuis un fichier xml
    onFileEmballageSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameEmballage = file.name;
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
    // importer la liste des supports depuis un fichier xml
    onFileSupportSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameSupport = file.name;
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
    // importer la liste des produits depuis un fichier xml
    onFileProduitSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameProduit = file.name;
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
    // importer la liste des commandes depuis un fichier xml
    onFileCommandeSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameCommande = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-fichier-commandes', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des commandes est bien importée',
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
    // importer la liste des vehicules depuis un fichier xml
    onFileVehiculesSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameVehicule = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-vehicules', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des vehicules est bien importée',
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
    // importer la liste des vehicules loués depuis un fichier xml
    onFileVehiculesLouesSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameVehiculeLoue = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-vehicules-loues', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des vehicules loués est bien importée',
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
    // importer la liste des carburants depuis un fichier xml
    onFileCarburantSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameCarburant = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-carburants', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des carburants est bien importée',
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
    // importer la liste des missions depuis un fichier xml
    onFileMissionSelected(event: any) {
      const file: File = event.target.files[0];
  
      if (file) {
        this.fileNameMission = file.name;
        const formData = new FormData();
        formData.append('file', file);
  
        const upload$ = this.http
          .post(erp + 'importer-fichier-missions', formData, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            finalize(() => {
              this.reset();
              Swal.fire({
                icon: 'success',
                title: 'Liste des missions est bien importée',
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
    // annuler l'importation
    cancelUpload() {
      this.uploadSub.unsubscribe();
      this.reset();
    }
    // reinitialise l'etat du chargement du document xml
    reset() {
      this.uploadProgress = null;
      this.uploadSub = null;
    }


}

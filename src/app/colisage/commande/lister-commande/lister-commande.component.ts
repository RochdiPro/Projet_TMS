import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { InformationCommandeComponent } from '../dialogs/dialogs.component';
import { CommandeService } from '../services/commande.service';

@Component({
  selector: 'app-lister-commande',
  templateUrl: './lister-commande.component.html',
  styleUrls: ['./lister-commande.component.scss'],
})
export class ListerCommandeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    'id',
    'referenceDocument',
    'nomClient',
    'ville',
    'adresse',
    'dateCreation',
    'tracking',
    'etat',
    'actions',
  ];
  dataSource = new MatTableDataSource();

  filtres: FormGroup;

  // variables de droits d'accés
  nom: any;
  acces: any;
  wms: any;
  estManuel = false;
  constructor(
    public serviceCommande: CommandeService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {
    sessionStorage.setItem('Utilisateur', '' + 'tms2');
    sessionStorage.setItem('Acces', '1004400');

    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.wms = Number(arrayOfDigits[4]);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  async ngOnInit() {
    this.createFiltresFormGroup();
    let configurationApplication = await this.serviceCommande
      .configurationApplication()
      .toPromise();
    this.estManuel = configurationApplication.modeManuel;
    await this.getListeCommandes();
  }

  //recuperer la liste des commandes
  async getListeCommandes() {
    this.dataSource.data = await this.serviceCommande
      .getListeCommandes()
      .toPromise();
  }

  // on met le tracking number au format suivante ("xxxxx xxxxx xxxxx") pour faciliter son affichage
  formatTrackingNumber(trackingNumber: any) {
    const trackingNumberStr = trackingNumber.toString();
    return [
      trackingNumberStr.slice(0, 5),
      ' ',
      trackingNumberStr.slice(5, 10),
      ' ',
      trackingNumberStr.slice(11),
    ].join('');
  }

  // fonction a executer avec le bouton info commande
  // ouvrir la boite de dialogue information du commande
  ouvrirBoiteDialogueInformationCommande(commande: any) {
    const dialogRef = this.dialog.open(InformationCommandeComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { commande: commande, modeManuel: this.estManuel },
    });
    // la boite de dialogue info commande contient des boutons pour la modification du position et de la liste de colisage
    // c'est pourquoi apres la fermeture de cette boite de dialogue on rafraichit la liste des commandes pour mettre a jour les champs modifiés
    dialogRef.afterClosed().subscribe(async (result) => {
      await this.getListeCommandes();
    });
  }

  //supprime commande et sa liste colisage quand on appuie sur bouton 'annuler'
  async annulerCommande(commande: any) {
    if (commande.etat != 'En cours de traitement') return;
    Swal.fire({
      title: 'Etes vous sûr?',
      text: 'Voulez-vous vraiment supprimer cette commande?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (this.estManuel) {
          let date = commande.dateCreation.split('T')[0];
          let type;
          commande.type === 'Facture'
            ? (type = 'Facture')
            : (type = 'Bon_Livraison');
          await this.serviceCommande
            .modifierEtatCommandeDansExcel(
              date,
              type,
              commande.nomFichier,
              'valide'
            )
            .toPromise();
        } else {
          if (commande.type === 'Facture') {
            let formData: any = new FormData();
            formData.append('Id', Number(commande.referenceDocument));
            formData.append('Etat', 'En cours de transport');
            this.serviceCommande.modifierEtatFacture(formData);
          } else if (commande.type === 'Bon Livraison') {
            let formData: any = new FormData();
            formData.append('Id', Number(commande.referenceDocument));
            formData.append('Etat', 'En cours de transport');
            this.serviceCommande.modifierEtatBonLivraison(formData);
          }
        }
        await this.serviceCommande.supprimerCommande(commande.id).toPromise();
        await this.serviceCommande
          .deleteColisParIdCommande(commande.id)
          .toPromise();
        Swal.fire({
          icon: 'success',
          title: 'Commande annulée',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getListeCommandes();
      }
    });
  }

  //créer le formGroup des filtres
  createFiltresFormGroup() {
    this.filtres = this.fb.group({
      reference: '',
      client: '',
      ville: '',
      adresse: '',
      trackingNumber: '',
      etat: '',
    });
  }

  // filtrer la liste des commandes
  filtrerCommandes() {
    let etat;
    this.filtres.get('etat').value ? etat = this.filtres.get('etat').value : etat ="";
    this.serviceCommande.filtrerCommandes(
      this.filtres.get('reference').value,
      this.filtres.get('client').value,
      this.filtres.get('ville').value,
      this.filtres.get('adresse').value,
      this.filtres.get('trackingNumber').value,
      etat
    ).subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  viderChamp(champ: string) {
    switch (champ) {
      case "reference":
        this.filtres.get('reference').setValue('');
        break;
      case "client":
        this.filtres.get('client').setValue('');
        break;
      case "ville":
        this.filtres.get('ville').setValue('');
        break;
      case "adresse":
        this.filtres.get('adresse').setValue('');
        break;
      case "trackingNumber":
        this.filtres.get('trackingNumber').setValue('');
        break;
      case "etat":
        this.filtres.get('etat').setValue('');
        break;
    
      default:
        break;
    }
    this.filtrerCommandes();
  }
}

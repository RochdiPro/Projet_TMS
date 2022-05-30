import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2';
import { EditService } from './Services/edit.service';
@Component({
  selector: 'app-donnees',
  templateUrl: './donnees.component.html',
  styleUrls: ['./donnees.component.scss'],
})
export class DonneesComponent implements OnInit {
  liste_categorie: any;
  categorie: any;
  catDonnees: any;
  nom_categorie: any;
  catDonnees2: any;
  nom_categorie2: any;
  catDonnees3: any;
  nom_categorie3: any;
  catDonnees4: any;
  nom_categorie4: any;
  ajoutAction: boolean = false;
  Nom_donnees: any = FormGroup;
  Valeur_donnees: any = FormGroup;
  click: boolean = true;
  select3: any;
  select4: any;
  nom_categorie_choisie: any;
  nom_categorie_choisie2: any;
  modificationAction: boolean = false;
  objetModifier: any;
  nom: any;
  acces: any;
  tms: any;
  wms: any;
  constructor(public donneesService: EditService, private fb: FormBuilder) {
    this.nom = sessionStorage.getItem('Utilisateur');
    this.acces = sessionStorage.getItem('Acces');

    const numToSeparate = this.acces;
    const arrayOfDigits = Array.from(String(numToSeparate), Number);

    this.tms = Number(arrayOfDigits[3]);
    this.wms = Number(arrayOfDigits[4]);

    //recupérer la liste des categories des données
    this.donneesService
      .obtenirListeCategorie()
      .subscribe((response: Response) => {
        this.liste_categorie = response;

        for (let i = 0; i < this.liste_categorie.length; i++) {
          if (this.liste_categorie[i] + '' == 'Categorie_Ngp') {
            this.liste_categorie.splice(i, 1);
          }
        }
      });
    this.Nom_donnees = this.fb.group({
      Nom: ['', [Validators.required]],
    });
    this.Valeur_donnees = this.fb.group({
      Valeur: [0],
    });
  }
  ngOnInit(): void {}
  //Récupérer les données du Catégorie sélectionnée
  CategorieSelectionnee(value: string) {
    var select2 = document.getElementById('lister2');
    this.select3 = document.getElementById('lister3');
    this.select4 = document.getElementById('lister4');
    this.categorie = value;
    this.nom_categorie_choisie = value;
    //récupérer les données d'une catégorie
    if (value == 'Categorie_Type2') {
      select2.style.visibility = 'visible';
      this.select3.style.visibility = 'hidden';
      this.select4.style.visibility = 'hidden';
      this.donneesService
        .obtenirCategorie('Categorie_Type1')
        .subscribe((response: Response) => {
          this.catDonnees2 = response;
          this.nom_categorie2 = this.catDonnees;
        });
    } else if (value == 'Categorie_Famille') {
      select2.style.visibility = 'visible';
      this.select3.style.visibility = 'visible';
      this.select4.style.visibility = 'hidden';
      this.donneesService
        .obtenirCategorie('Categorie_Type1')
        .subscribe((response: Response) => {
          this.catDonnees2 = response;
          this.nom_categorie2 = this.catDonnees;
          this.nom_categorie_choisie = 'Categorie_Type2';
          this.nom_categorie_choisie2 = 'Categorie_Famille';
        });
    } else if (value == 'Categorie_Sous_Famille') {
      select2.style.visibility = 'visible';
      this.select3.style.visibility = 'visible';
      this.select4.style.visibility = 'visible';
      this.donneesService
        .obtenirCategorie('Categorie_Type1')
        .subscribe((response: Response) => {
          this.catDonnees2 = response;
          this.nom_categorie2 = this.catDonnees;
          this.nom_categorie_choisie = 'Categorie_Type2';
          this.nom_categorie_choisie2 = 'Categorie_Famille';
        });
    } else if (value == 'Categorie_Ville') {
      select2.style.visibility = 'visible';
      this.select3.style.visibility = 'hidden';
      this.select4.style.visibility = 'hidden';
      this.donneesService
        .obtenirCategorie('Categorie_Pays')
        .subscribe((response: Response) => {
          this.catDonnees2 = response;
          this.nom_categorie2 = this.catDonnees;
        });
    } else if (value == 'Categorie_Region') {
      select2.style.visibility = 'visible';
      this.select3.style.visibility = 'visible';
      this.select4.style.visibility = 'hidden';
      this.donneesService
        .obtenirCategorie('Categorie_Pays')
        .subscribe((response: Response) => {
          this.catDonnees2 = response;
          this.nom_categorie2 = this.catDonnees;
          this.nom_categorie_choisie = 'Categorie_Ville';
          this.nom_categorie_choisie2 = 'Categorie_Region';
        });
    } else {
      this.Valeur_donnees.controls.Valeur.setValue('');
      this.Valeur_donnees.controls.Valeur.enable();
      select2.style.visibility = 'hidden';
      this.select3.style.visibility = 'hidden';
      this.select4.style.visibility = 'hidden';
      this.donneesService
        .obtenirCategorie(this.categorie)
        .subscribe((response: Response) => {
          this.catDonnees = response;
          this.nom_categorie = this.catDonnees;
        });
    }
    this.click = false;
  }
  //Récupérer les données du catégorie2 séléctionnée
  Categorie2Selectionnee(valeur: any) {
    this.Valeur_donnees.controls.Valeur.setValue(valeur);
    this.Valeur_donnees.controls.Valeur.disable();
    this.donneesService
      .obtenirCategorie2(this.nom_categorie_choisie, valeur)
      .subscribe((response: Response) => {
        this.catDonnees = response;
        this.nom_categorie = this.catDonnees;
        this.catDonnees3 = response;
        this.nom_categorie3 = this.catDonnees;
      });
  }
  //Récupérer les données du catégorie3 séléctionnée
  Categorie3Selectionnee(valeur: any) {
    this.Valeur_donnees.controls.Valeur.setValue(valeur);
    this.donneesService
      .obtenirCategorie2(this.nom_categorie_choisie2, valeur)
      .subscribe((response: Response) => {
        this.catDonnees = response;
        this.nom_categorie = this.catDonnees;
        this.catDonnees4 = response;
        this.nom_categorie4 = this.catDonnees;
      });
  }
  //Récupérer les données du catégorie4 séléctionnée
  Categorie4Selectionnee(valeur: any) {
    this.Valeur_donnees.controls.Valeur.setValue(valeur);
    this.donneesService
      .obtenirCategorie2('Categorie_Sous_Famille', valeur)
      .subscribe((response: Response) => {
        this.catDonnees = response;
        this.nom_categorie = this.catDonnees;
      });
  }
  //activer l'action ajout données
  activerAjout() {
    this.ajoutAction = true;
    this.modificationAction = false;
  }
  //Ajouter données à une catégorie
  ajouterDonneesCategorie() {
    this.ajoutAction = false; //desactiver l'action ajout données
    var formDataDonnees: any = new FormData();
    formDataDonnees.append('Categorie', this.Nom_donnees.get('Nom').value);
    formDataDonnees.append('Valeur', this.Valeur_donnees.get('Valeur').value);
    this.donneesService
      .ajouterDonneesCategorie(formDataDonnees, this.categorie)
      .subscribe(
        () => {
          Swal.fire('Donnée ajoutée avec succès.');
          this.CategorieSelectionnee(this.categorie);
          this.nom_categorie;
          this.Valeur_donnees.controls.Valeur.setValue('');
        },
        (error) => {
          console.log(error);
        }
      );
  }
  //Supprimer données du catégorie
  SupprimerDonneesCategorie(categorie: any) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimez-le',
      cancelButtonText: 'Non, gardez-le',
    }).then((result) => {
      if (result.value) {
        this.donneesService
          .supprimerDonneesCategorie(categorie, this.categorie)
          .subscribe(
            () => {
              this.nom_categorie;
              Swal.fire('Donnée Supprimée avec succès!', '', 'success');
              this.CategorieSelectionnee(this.categorie);
            },
            (error) => {
              console.log(error);
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Annulé', '', 'error');
      }
    });
  }

  //activer l'action modifier données
  activerModifier(categorie: any) {
    this.ajoutAction = false;
    this.modificationAction = true;
    this.objetModifier = categorie;
    this.Nom_donnees.get('Nom').setValue(categorie.nom);
    this.Valeur_donnees.get('Valeur').setValue(categorie.valeur);
  }
  //Modifier données du catégorie
  modifierDonneesCategorie() {
    this.donneesService
      .supprimerDonneesCategorie(this.objetModifier.tag, this.categorie)
      .subscribe(
        () => {
          var formDataDonnees: any = new FormData();
          formDataDonnees.append(
            'Categorie',
            this.Nom_donnees.get('Nom').value
          );
          formDataDonnees.append(
            'Valeur',
            this.Valeur_donnees.get('Valeur').value
          );
          this.donneesService
            .ajouterDonneesCategorie(formDataDonnees, this.categorie)
            .subscribe(
              () => {
                Swal.fire('Donnée modifiée avec succès.');
                this.nom_categorie;
                this.Nom_donnees.get('Nom').setValue('');
                this.Valeur_donnees.controls.Valeur.setValue('');
                this.modificationAction = false;
                this.CategorieSelectionnee(this.categorie);
              },
              (error) => {
                console.log(error);
              }
            );
        },
        (error) => {
          console.log(error);
        }
      );
  }

  //reinitialiser les données
  reinitialiser() {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Les données que vous avez ajouté seront supprimé",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ok',
      cancelButtonText: 'annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Mot de passe',
          input: 'password',
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          confirmButtonText: 'ok',
          showLoaderOnConfirm: true,
          preConfirm: (pass) => {
            if (pass !== 'infonet') {
              Swal.showValidationMessage(`Mot de passe incorrecte`);
            }
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            this.donneesService.initialiserDonnees().subscribe(()=>{
              Swal.fire({
                icon: 'success',
                title: 'Les données ont été reinitialisées avec succés',
                showConfirmButton: false,
                timer: 1500
              })
            });
          }
        });
      }
    })
  }
}

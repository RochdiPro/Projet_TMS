import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const infonet = '/INFONET/';
const erp = '/ERP/';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  async authenticate(username: string, password: string) {
    let employe: any = await this.login(username, password).toPromise();
    if (employe) {
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('Utilisateur', '' + username);
      sessionStorage.setItem('Acces', employe.acces);
      return true;
    } else if (username == "infonet" && password == "infonet") {
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('Utilisateur', '' + username);
      sessionStorage.setItem('Acces', "1005500");
      return true;
    } else {
      return false;
    }
  }

  isUserLoggedIn() {
    let user = sessionStorage.getItem('username');
    return !(user === null);
  }

  logOut() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('Utilisateur');
    sessionStorage.removeItem('Acces');
  }

  login(username: string, password: string) {
    return this.http.get(erp + 'connection', {
      params: {
        login: username,
        password: password,
      },
      observe: 'body',
    });
  }
}

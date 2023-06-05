import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../error/error.service';
import { User } from './user.model';

export interface AuthRequestData{
  email: string,
  password: string,
  returnSecureToken: boolean,
  username: string
}

export interface AuthResponseData{
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  webApiKey: string = environment.webApiKey;
  userSubject = new BehaviorSubject<User>(null);
  tokenExpirationTimer = null;

  constructor(
    private httpClient: HttpClient, 
    private router: Router, 
    private errorService: ErrorService
  ) { }

  handleAuthentication(
    email: string, 
    localId: string, 
    username: string,
    role: string,
    dbId: string,  
    token: string, 
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, localId, username, role, dbId, token, expirationDate);
    this.userSubject.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  signup(authRequestData : AuthRequestData){
    // hit sign up to firebase auth
    return this.httpClient.post<AuthResponseData>
    ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + this.webApiKey,
    {
      email: authRequestData.email,
      password: authRequestData.password,
      returnSecureToken: authRequestData.returnSecureToken
    })
    .pipe(
      catchError(this.errorService.handleError),
      tap( resData => {
        this.handleAuthentication(
          resData.email, 
          resData.localId, 
          authRequestData.username, 
          'user',
          null,
          resData.idToken, 
          +resData.expiresIn
        );
      })
    );
  }

  login(authRequestData: AuthRequestData){
    // hit sign in to firebase auth
    return this.httpClient.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + this.webApiKey,
      {
        email: authRequestData.email,
        password: authRequestData.password,
        returnSecureToken: authRequestData.returnSecureToken
      }
    )
    .pipe(
      catchError(this.errorService.handleError),
      tap( resData => {
        this.handleAuthentication(
          resData.email, 
          resData.localId, 
          null,
          null,
          null,
          resData.idToken, 
          +resData.expiresIn
        )
      })
    );
  }

  autoLogin(){
    const userData: {
      email: string,
      id: string,
      username: string,
      role: string,
      dbId: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));

    if(!userData){
      return;
    }

    const loadedUser = new User(
      userData.email, 
      userData.id, 
      userData.username, 
      userData.role, 
      userData.dbId,
      userData._token, 
      new Date(userData._tokenExpirationDate)
    );
      
    if(loadedUser.token){
      this.userSubject.next(loadedUser);

      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
      // this.autoLogout(5000);
    }
  }

  logout(){
    this.userSubject.next(null);
    this.router.navigate(["/auth"]);
    localStorage.removeItem('userData');
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number){
    this.tokenExpirationTimer = setTimeout(
      () => {
        this.logout();
      }, expirationDuration
    );
  }
}

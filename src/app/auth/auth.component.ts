import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { ErrorService } from '../error/error.service';
import { DbHelperService } from '../shared/db-helper.service';
import { AuthRequestData, AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  authForm! : FormGroup;
  isLoginMode = true;
  isLoading = false;

  constructor(
    private authService : AuthService, 
    private dbHelperService : DbHelperService,
    private errorService: ErrorService, 
    private router: Router
  ){}

  ngOnInit(): void {
    this.authForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }

  onSwitchMode(){
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.errorService.errorHandling.next(null);

    if(this.isLoginMode) {
      this.authForm = new FormGroup({
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(6)])
      });
    }
    else {
      this.authForm = new FormGroup({
        'username': new FormControl(null, Validators.required),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(6)]),
        'rePassword': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      });
    }
  }

  onSubmit(){
    // validations
    if(!this.authForm.valid) {
      this.errorService.errorHandling.next("Please enter the correct inputs");
      return;
    }
    const email = this.authForm.value.email;
    const password = this.authForm.value.password;
    let username = null;

    if(!this.isLoginMode) {
      const rePassword = this.authForm.value.rePassword;
      username = this.authForm.value.username;

      if(password !== rePassword) {
        this.errorService.errorHandling.next("Please confirm your password again");
        return;
      }
    }
    
    // start process to hit firebase auth
    const authReqData : AuthRequestData = {
      email : email,
      password : password,
      returnSecureToken : true,
      username : username
    }

    this.isLoading = true;

    let authObservable: Observable<AuthResponseData>;
    if(this.isLoginMode){
      authObservable = this.authService.login(authReqData);
    } else {
      authObservable = this.authService.signup(authReqData);
    }

    let authResponse: AuthResponseData = null;
    authObservable.subscribe(
      resdata => {
        console.log('auth observable :');
        console.log(resdata);
        this.errorService.errorHandling.next(null);

        authResponse = resdata;
      },
      errorMsg => {
        console.log('auth observable - error :');
        console.log(errorMsg);
        this.errorService.errorHandling.next(errorMsg);

        this.isLoading = false;
      },
      () => {
        // when completed
        // start process to hit DB
        let userObservable: Observable<any>;
        
        if(this.isLoginMode) {
          userObservable = this.dbHelperService.getUserDetailByAuthId(authResponse.localId);
        } 
        else {
          const dbPayload = {
            authId: authResponse.localId,
            username: username
          }

          userObservable = this.dbHelperService.createUserDetail(dbPayload);
        }

        userObservable.subscribe(
          resdata => {
            console.log('user observable :');
            console.log(resdata);
            this.errorService.errorHandling.next(null);

            if(!resdata) {
              this.errorService.errorHandling.next('User not found in DB');
              this.isLoading = false;
              return;
            }

            if(this.isLoginMode) {
              if(resdata.isDeleted) {
                this.authService.logout();
                this.errorService.errorHandling.next('Your account has been disabled by the administrator');
                this.isLoading = false;
                return;
              }

              this.authService.handleAuthentication(
                authResponse.email, 
                authResponse.localId, 
                resdata.username,
                resdata.role,
                resdata.id,
                authResponse.idToken, 
                +authResponse.expiresIn
              )
            }
            else {
              this.authService.handleAuthentication(
                authResponse.email, 
                authResponse.localId, 
                username, 
                'user',
                resdata.name,
                authResponse.idToken, 
                +authResponse.expiresIn
              );
            }

            this.isLoading = false;
            this.router.navigate(['/home']);
          },
          errorMsg => {
            console.log('user observable - error :');
            console.log(errorMsg);
            this.errorService.errorHandling.next(errorMsg);

            this.isLoading = false;
          }
        );
      }
    );

    this.authForm.reset();
  }
}

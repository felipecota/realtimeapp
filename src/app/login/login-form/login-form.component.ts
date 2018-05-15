import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firebase } from '@firebase/app'
import '@firebase/auth'

import { AppService } from '../../app.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  isLoggingIn = true;
  erro: string;  
  email: string; 
  password: string;
  pendingCred: any;
  pendingMail: string;

  constructor(
    private appService: AppService,
    private router: Router
  ) { }

  ngOnInit() { }

  toggleDisplay() {
    this.isLoggingIn = !this.isLoggingIn;
    this.erro = '';
  }  

  loginWithFacebook() {
    this.loginSocial(new firebase.auth.FacebookAuthProvider());
  }

  loginWithGoogle() {
    this.loginSocial(new firebase.auth.GoogleAuthProvider());
  }  

  loginWithGithub() {
    this.loginSocial(new firebase.auth.GithubAuthProvider());
  }     

  loginWithTwitter() {
    this.loginSocial(new firebase.auth.TwitterAuthProvider());
  }     

  loginSocial(provider) {
    this.appService.afAuth.auth.signInWithPopup(provider)
    .then(result => {
      if (this.pendingMail == this.appService.afAuth.auth.currentUser.email)
        this.appService.afAuth.auth.currentUser.linkWithCredential(this.pendingCred);
    })
    .catch(error => {
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.pendingCred = error.credential;
        this.pendingMail = error.email;
        // Get registered providers for this email.
        this.appService.afAuth.auth.fetchProvidersForEmail(this.pendingMail).then(providers => {
          if (providers[0] == "password") {
            this.email = error.email;
            this.erro = this.appService.language.e16;            
          } else
          {        
            this.erro = this.appService.language.e17.replace('$input$',providers[0].replace('.com',''));
          }
        });
      }
    });
  }

  login() {
    if (!this.email || !this.password)  {
      this.erro = this.appService.language.e3;
      navigator.vibrate([500]);    
    } else if (this.isLoggingIn)
      this.appService.afAuth.auth.signInWithEmailAndPassword(
        this.email, this.password)
        .then(user => { 
          if (this.pendingMail == this.email) {
            this.appService.afAuth.auth.currentUser.linkWithCredential(this.pendingCred);
          }
        })
        .catch(error => {
          this.erro = this.appService.language.e4
        });    
    else
      this.appService.afAuth.auth.createUserWithEmailAndPassword(
        this.email, this.password)
        .then(ok => {})
        .catch(error => {
          if (error.code === "auth/email-already-in-use") {
            this.appService.afAuth.auth.fetchProvidersForEmail(this.email).then(providers => {
              this.erro = this.appService.language.e17.replace('$input$',providers[0].replace('.com',''));       
              this.pendingCred = firebase.auth.EmailAuthProvider.credential(this.email, this.password);
              this.pendingMail = this.email;
            });
          }    
          else
            this.erro = this.appService.language.e4; 
        });
  } 

  forgot() {
    if (!this.email)  {
      this.erro = this.appService.language.e3;
      navigator.vibrate([500]);
    } else {
      this.appService.afAuth.auth.sendPasswordResetEmail(this.email).then(() => {
        this.erro = this.appService.language.m3;
      }).catch((err) => {
        this.erro = this.appService.language.e13;
      });
    }
  }

}

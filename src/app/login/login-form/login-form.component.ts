import { Component, OnInit, NgZone } from '@angular/core';
import { AppService } from '../../app.service';
import { auth } from 'firebase/app';

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
    private ngZone: NgZone
  ) { }

  ngOnInit() {
  }

  toggleDisplay() {
    this.isLoggingIn = !this.isLoggingIn;
    this.erro = '';
  }  

  loginWithFacebook() {
    this.loginSocial(new auth.OAuthProvider('facebook.com'));
  }

  loginWithGithub() {
    this.loginSocial(new auth.OAuthProvider('github.com'));
  }   

  loginWithGoogle() {
    this.loginSocial(new auth.OAuthProvider('google.com'));
  }  

  loginWithYahoo() {
    this.loginSocial(new auth.OAuthProvider('yahoo.com'));
  }     

  loginWithMicrosoft() {
    this.loginSocial(new auth.OAuthProvider('microsoft.com'));
  }   

  loginWithTwitter() {
    this.loginSocial(new auth.OAuthProvider('twitter.com'));
  }     

  loginSocial(provider) {
    this.appService.afAuth.auth.signInWithPopup(provider).then(result => {
      if (this.pendingMail == this.appService.afAuth.auth.currentUser.email)
        this.appService.afAuth.auth.currentUser.linkWithCredential(this.pendingCred);
    })
    .catch(error => {      
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.pendingCred = error.credential;
        this.pendingMail = error.email;          
        // Get registered providers for this email.
        this.appService.afAuth.auth.fetchSignInMethodsForEmail(this.pendingMail).then(providers => {
          if (providers[0] == "password" && providers.length == 1) {
            this.ngZone.run(() => {
              this.email = error.email;
              this.erro = this.appService.language.e16;
            });            
          } 
          else
          {      
            this.ngZone.run(() => {
              this.erro = this.appService.language.e17.replace('$input$',providers[0].replace('.com',''));
            });
          }
        });
      } else {
        this.erro = error.code;
      }
    });
  }

  login() {

    if (!this.email || !this.password)  {
      this.erro = this.appService.language.e3;
      navigator.vibrate([500]);    
    } else if (this.isLoggingIn)
      this.appService.afAuth.auth.signInWithEmailAndPassword(
        this.email.trim(), this.password)
        .then(user => { 
          if (this.pendingMail == this.email.trim()) {
            this.appService.afAuth.auth.currentUser.linkWithCredential(this.pendingCred);
          }
          if (!this.appService.isEmailVerified && this.appService.afAuth.auth.currentUser.emailVerified) {
            this.appService.login(this.appService.afAuth.auth.currentUser);
          }
        })
        .catch(error => {
          if (error.code == "auth/user-not-found") {            
            this.toggleDisplay();            
            this.erro = this.appService.language.e21;
          }
          else if (error.code == "auth/wrong-password")
            this.erro = this.appService.language.e4;
          else {
            this.erro = error.code;
          }
        });    
    else {      
      this.appService.afAuth.auth.createUserWithEmailAndPassword(
        this.email.trim(), this.password)
        .then(ok => {
          this.toggleDisplay(); // Send verification e-mail and enable loggin
          this.erro = this.appService.language.e20;
        })
        .catch(error => {
          if (error.code === "auth/email-already-in-use") {
            this.appService.afAuth.auth.fetchSignInMethodsForEmail(this.email).then(providers => {
              this.erro = this.appService.language.e17.replace('$input$',providers[0].replace('.com',''));       
              this.pendingCred = auth.EmailAuthProvider.credential(this.email, this.password);
              this.pendingMail = this.email;
            });
          }    
          else
            this.erro = this.appService.language.e4; 
        });
      }
  } 

  forgot() {
    if (!this.email)  {
      this.erro = this.appService.language.e3;
      navigator.vibrate([500]);
    } else {
      auth().useDeviceLanguage(); 
      this.appService.afAuth.auth.sendPasswordResetEmail(this.email).then(() => {
        this.erro = this.appService.language.m3;
      }).catch((err) => {
        this.erro = this.appService.language.e13;
      });
    }
  }

}

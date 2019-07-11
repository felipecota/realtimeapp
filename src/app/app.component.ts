import { Component } from '@angular/core';
import { AppService } from './app.service'
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {  

  title = 'realtimeapp';
  version = 'v9.0';
  isSignin: Observable<boolean>;
 
  constructor(
    public appService: AppService,
    public afAuth: AngularFireAuth,     
    public router: Router) { }  
  
  ngOnInit() { }

  logout() {
    this.afAuth.auth.signOut();   
  }

  language(i) {
    this.appService.language_set(i);
  }

  menu() {
    this.router.navigate(['/menu']);
  }

}

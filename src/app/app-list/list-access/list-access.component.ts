import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase/app';

import { AppService } from '../../app.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-list-access',
  templateUrl: './list-access.component.html',
  styleUrls: ['./list-access.component.css']
})
export class ListAccessComponent implements OnInit, OnDestroy {

  lists: Observable<any[]>;
  members: any[];
  
  selected: boolean;
  erro: string;
  listname: string;
  listkey: string;
  email: string;

  sub: any;

  title: string = this.appService.language["t5"];
  
  constructor(
    private appService: AppService
  ) { }

  ngOnInit() {

    this.lists = this.appService.afs.collection('lists', ref => ref.where('access.'+this.appService.user.email.replace(/\./g,'´'),'==',true))
    .snapshotChanges()
    .pipe(map(lists => {

        if (localStorage.getItem('lastList')) {
            let result = lists.find(list => list.payload.doc.id == localStorage.getItem('lastList'));
            if (result != undefined) {
                const data = result.payload.doc.data();
                const id = result.payload.doc.id;                
                this.onSelectList({ id, ...data });
            }
        }                

        return lists
        .sort(
            (a,b) => a.payload.doc.data()["listname"].localeCompare(b.payload.doc.data()["listname"]))
        .map(list => {
            const data = list.payload.doc.data();
            const id = list.payload.doc.id;                
            return { id, ...data };                
        })
    })); 

  }

  ngOnDestroy() {
    if (this.sub != undefined)
      this.sub.unsubscribe();
  }  

  onSelectList(l): void {
    this.selected = true;
    this.erro = '';
    this.listname = l.listname;
    this.listkey = l.id;
    this.title = l.listname;
    localStorage.setItem('lastList', l.id);
    
    this.sub = this.appService.afs.collection('lists').doc(this.listkey)
    .snapshotChanges()
    .subscribe(list => {
      let temp = [];
      try {
        for (let key in list.payload.data()["access"]) {
            temp.push({
                email: key.replace(/´/g,'.')
            });
        }
      } catch {}
      this.members = temp;
    });  
      
  }    

  Include() {

    let email = this.email;

    if (this.members && this.members.length >= environment.limit_access)
      this.erro = this.appService.language.e18;
    else if (!navigator.onLine)
      this.erro = this.appService.language.e12;    
    else if (!email || email == '') {
      this.erro = this.appService.language.e8;
      navigator.vibrate([500]);
    } else {  
      this.appService.afs.collection('lists').doc(this.listkey).update({
          ['access.'+email.toLowerCase().replace(/\./g,'´')]: true
      });            
          
      this.erro = '';
      this.email = '';
    }
  }

  onRemove(member): void {

    if (!navigator.onLine)
      this.erro = this.appService.language.e12;
    else if (this.members.length > 1) {
      if (confirm(this.appService.language.m7))
        this.appService.afs.collection('lists').doc(this.listkey).update({
          ['access.'+member.email.replace(/\./g,'´')]: firestore.FieldValue.delete()
        });
    } else {
      this.erro = this.appService.language.e10;      
    }

  }

}

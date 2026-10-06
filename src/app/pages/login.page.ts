import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonSpinner } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, IonSpinner],
  template: `
  <ion-content class="ion-padding">
    <div style="max-width:420px;margin:12vh auto 0">
      <h1 style="color:#00c2ff;margin-bottom:4px">AeroGuard</h1>
      <p style="margin-top:0;color:#64748b">BPSU Fire Safety System</p>
      <ion-input label="Username" labelPlacement="floating" fill="outline" [(ngModel)]="username"></ion-input>
      <ion-input label="Password" labelPlacement="floating" fill="outline" type="password" [(ngModel)]="password" style="margin-top:12px"></ion-input>
      <p class="msg">{{ msg }}</p>
      <ion-button expand="block" (click)="submit()" [disabled]="busy">
        @if (busy) { <ion-spinner name="dots"></ion-spinner> } @else { Log in }
      </ion-button>
      <ion-button expand="block" fill="clear" (click)="router.navigateByUrl('/register')">Create an account</ion-button>
    </div>
  </ion-content>`,
})
export class LoginPage {
  username = ''; password = '';
  msg = ''; busy = false;
  constructor(private api: ApiService, public router: Router) {}

  async submit() {
    this.msg = ''; this.busy = true;
    try {
      const r = await this.api.login(this.username.trim(), this.password);
      if (r.success) { this.api.user = r.user; this.router.navigateByUrl('/users', { replaceUrl: true }); }
      else this.msg = r.message;
    } catch { this.msg = 'Cannot reach the server. Is XAMPP (Apache + MySQL) running?'; }
    this.busy = false;
  }
}

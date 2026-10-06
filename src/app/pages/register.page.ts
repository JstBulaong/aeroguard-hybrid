import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, IonSelect, IonSelectOption],
  template: `
  <ion-content class="ion-padding">
    <div style="max-width:420px;margin:6vh auto 0">
      <h2 style="color:#00c2ff">Create account</h2>
      <ion-input label="Full name" labelPlacement="floating" fill="outline" [(ngModel)]="f.full_name"></ion-input>
      <ion-input label="Username" labelPlacement="floating" fill="outline" [(ngModel)]="f.username" style="margin-top:12px"></ion-input>
      <ion-select label="Role" labelPlacement="floating" fill="outline" [(ngModel)]="f.user_type" style="margin-top:12px">
        @for (r of roles; track r) { <ion-select-option [value]="r">{{ r }}</ion-select-option> }
      </ion-select>
      <ion-input label="Email" labelPlacement="floating" fill="outline" type="email" [(ngModel)]="f.email" style="margin-top:12px"></ion-input>
      <ion-input label="Phone (09XXXXXXXXX)" labelPlacement="floating" fill="outline" inputmode="numeric" [(ngModel)]="f.phone" style="margin-top:12px"></ion-input>
      <ion-input label="Password (8+ characters)" labelPlacement="floating" fill="outline" type="password" [(ngModel)]="f.password" style="margin-top:12px"></ion-input>
      <p class="msg">{{ msg }}</p>
      <ion-button expand="block" (click)="submit()" [disabled]="busy">Register</ion-button>
      <ion-button expand="block" fill="clear" (click)="router.navigateByUrl('/login')">Back to login</ion-button>
    </div>
  </ion-content>`,
})
export class RegisterPage {
  roles = ['Admin', 'Security', 'DRRM', 'Faculty'];
  f: any = { full_name: '', username: '', user_type: 'Security', email: '', phone: '', password: '' };
  msg = ''; busy = false;
  constructor(private api: ApiService, public router: Router) {}

  async submit() {
    this.msg = ''; this.busy = true;
    try {
      const r = await this.api.register(this.f);
      if (r.success) this.router.navigateByUrl('/login', { replaceUrl: true });
      else this.msg = r.message;
    } catch { this.msg = 'Cannot reach the server. Is XAMPP (Apache + MySQL) running?'; }
    this.busy = false;
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardContent,
} from '@ionic/angular';
import { ApiService } from '../services/api.service';

const EMPTY = { user_id: null, full_name: '', username: '', user_type: 'Security', email: '', phone: '', password: '' };

/** Account Maintenance: Create, Read, Update, Delete on the users table. */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem,
    IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardContent],
  template: `
  <ion-header><ion-toolbar>
    <ion-title>Personnel</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="router.navigateByUrl('/incidents')">Incidents</ion-button>
      <ion-button (click)="logout()">Log out</ion-button>
    </ion-buttons>
  </ion-toolbar></ion-header>

  <ion-content class="ion-padding">
    <ion-card><ion-card-content>
      <h3 style="margin-top:0">{{ f.user_id ? 'Edit personnel' : 'Add personnel' }}</h3>
      <ion-input label="Full name" labelPlacement="floating" fill="outline" [(ngModel)]="f.full_name"></ion-input>
      <ion-input label="Username" labelPlacement="floating" fill="outline" [(ngModel)]="f.username" style="margin-top:10px"></ion-input>
      <ion-select label="Role" labelPlacement="floating" fill="outline" [(ngModel)]="f.user_type" style="margin-top:10px">
        @for (r of roles; track r) { <ion-select-option [value]="r">{{ r }}</ion-select-option> }
      </ion-select>
      <ion-input label="Email" labelPlacement="floating" fill="outline" type="email" [(ngModel)]="f.email" style="margin-top:10px"></ion-input>
      <ion-input label="Phone" labelPlacement="floating" fill="outline" inputmode="numeric" [(ngModel)]="f.phone" style="margin-top:10px"></ion-input>
      <ion-input [label]="f.user_id ? 'New password (leave blank to keep)' : 'Password (8+ characters)'" labelPlacement="floating" fill="outline" type="password" [(ngModel)]="f.password" style="margin-top:10px"></ion-input>
      <ion-button (click)="save()" style="margin-top:12px">{{ f.user_id ? 'Save changes' : 'Add personnel' }}</ion-button>
      @if (f.user_id) { <ion-button fill="clear" (click)="reset()">Cancel</ion-button> }
    </ion-card-content></ion-card>

    <ion-list>
      @for (u of users; track u.user_id) {
        <ion-item>
          <ion-label>
            <h2>{{ u.full_name }}</h2>
            <p>{{ u.username }} · {{ u.user_type }}</p>
            <p>{{ u.email }} {{ u.phone }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" (click)="edit(u)">Edit</ion-button>
          <ion-button fill="clear" color="danger" slot="end" (click)="confirmDelete(u)">Delete</ion-button>
        </ion-item>
      } @empty { <p class="msg">No personnel yet. Add the first account above.</p> }
    </ion-list>
  </ion-content>`,
})
export class UsersPage implements OnInit, OnDestroy {
  roles = ['Admin', 'Security', 'DRRM', 'Faculty'];
  users: any[] = [];
  f: any = { ...EMPTY };
  private timer: any;

  constructor(private api: ApiService, public router: Router, private alerts: AlertController, private toasts: ToastController) {}

  ngOnInit() { this.load(); this.timer = setInterval(() => this.load(), 5000); } // auto-refresh = live sync
  ngOnDestroy() { clearInterval(this.timer); }

  async load() { try { const r = await this.api.getUsers(); if (r.success) this.users = r.data; } catch {} }
  reset() { this.f = { ...EMPTY }; }
  edit(u: any) { this.f = { ...u, password: '' }; window.scrollTo(0, 0); }
  logout() { this.api.logout(); this.router.navigateByUrl('/login', { replaceUrl: true }); }
  private async toast(message: string) { (await this.toasts.create({ message, duration: 2500 })).present(); }

  async save() {
    try {
      const r = this.f.user_id ? await this.api.updateUser(this.f)   // UPDATE
                               : await this.api.createUser(this.f);  // CREATE
      this.toast(r.message);
      if (r.success) { this.reset(); this.load(); }
    } catch { this.toast('Cannot reach the server.'); }
  }

  async confirmDelete(u: any) {                                       // DELETE
    const a = await this.alerts.create({
      header: 'Delete account', message: `Delete ${u.full_name}? This cannot be undone.`,
      buttons: ['Cancel', { text: 'Delete', role: 'destructive', handler: async () => {
        const r = await this.api.deleteUser(u.user_id); this.toast(r.message); this.load();
      } }],
    });
    a.present();
  }
}

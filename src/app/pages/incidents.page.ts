import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardContent, IonBadge, IonTextarea,
} from '@ionic/angular';
import { ApiService } from '../services/api.service';

const num = (v: any) => (v === '' || v == null ? null : Number(v));

/** Transaction: log an incident report, then add remarks or resolve it. */
@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem,
    IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardContent, IonBadge, IonTextarea],
  template: `
  <ion-header><ion-toolbar>
    <ion-title>Incident reports</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="router.navigateByUrl('/users')">Personnel</ion-button>
      <ion-button (click)="logout()">Log out</ion-button>
    </ion-buttons>
  </ion-toolbar></ion-header>

  <ion-content class="ion-padding">
    <ion-card><ion-card-content>
      <h3 style="margin-top:0">Log an incident</h3>
      <ion-input label="Device ID" labelPlacement="floating" fill="outline" inputmode="numeric" [(ngModel)]="f.device_id"></ion-input>
      <ion-select label="Threat level" labelPlacement="floating" fill="outline" [(ngModel)]="f.threat_level" style="margin-top:10px">
        @for (t of levels; track t) { <ion-select-option [value]="t">{{ t }}</ion-select-option> }
      </ion-select>
      <ion-input label="Location" labelPlacement="floating" fill="outline" [(ngModel)]="f.location" style="margin-top:10px"></ion-input>
      <ion-input label="PM2.5" labelPlacement="floating" fill="outline" type="number" [(ngModel)]="f.pm25_value" style="margin-top:10px"></ion-input>
      <ion-input label="PM10" labelPlacement="floating" fill="outline" type="number" [(ngModel)]="f.pm10_value" style="margin-top:10px"></ion-input>
      <ion-input label="Temperature (°C)" labelPlacement="floating" fill="outline" type="number" [(ngModel)]="f.temperature" style="margin-top:10px"></ion-input>
      <ion-input label="Humidity (%)" labelPlacement="floating" fill="outline" type="number" [(ngModel)]="f.humidity" style="margin-top:10px"></ion-input>
      <ion-textarea label="Response action" labelPlacement="floating" fill="outline" [(ngModel)]="f.response_action" style="margin-top:10px"></ion-textarea>
      <ion-button (click)="submit()" style="margin-top:12px">Submit report</ion-button>
    </ion-card-content></ion-card>

    <ion-list>
      @for (i of incidents; track i.incident_id) {
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2><ion-badge [class]="'threat-' + i.threat_level">{{ i.threat_level }}</ion-badge>
              Device {{ i.device_id }} {{ i.location ? '· ' + i.location : '' }}</h2>
            <p>PM2.5 {{ i.pm25_value ?? '-' }} · PM10 {{ i.pm10_value ?? '-' }} · {{ i.temperature ?? '-' }}°C · {{ i.humidity ?? '-' }}%</p>
            <p>{{ i.created_at }} · {{ i.resolved ? 'Resolved' : 'Open' }}</p>
            @if (i.response_action) { <p>Action: {{ i.response_action }}</p> }
          </ion-label>
          @if (!i.resolved) { <ion-button slot="end" fill="outline" (click)="resolve(i)">Resolve</ion-button> }
        </ion-item>
      } @empty { <p class="msg">No incidents logged. Submit a report above.</p> }
    </ion-list>
  </ion-content>`,
})
export class IncidentsPage implements OnInit, OnDestroy {
  levels = ['Gray', 'Yellow', 'Orange', 'Red']; // match threat_level values in your database
  incidents: any[] = [];
  f: any = { device_id: '', threat_level: 'Yellow', location: '', pm25_value: '', pm10_value: '', temperature: '', humidity: '', response_action: '' };
  private timer: any;

  constructor(private api: ApiService, public router: Router, private toasts: ToastController) {}

  ngOnInit() { this.load(); this.timer = setInterval(() => this.load(), 5000); } // auto-refresh = live sync
  ngOnDestroy() { clearInterval(this.timer); }

  async load() { try { const r = await this.api.getIncidents(); if (r.success) this.incidents = r.data; } catch {} }
  logout() { this.api.logout(); this.router.navigateByUrl('/login', { replaceUrl: true }); }
  private async toast(message: string) { (await this.toasts.create({ message, duration: 2500 })).present(); }

  async submit() {
    const f = this.f;
    try {
      const r = await this.api.createIncident({
        device_id: f.device_id, threat_level: f.threat_level, location: f.location || null,
        pm25_value: num(f.pm25_value), pm10_value: num(f.pm10_value),
        temperature: num(f.temperature), humidity: num(f.humidity),
        confidence: null, response_action: f.response_action || null,
      });
      this.toast(r.message);
      if (r.success) { this.f = { ...f, device_id: '', location: '', pm25_value: '', pm10_value: '', temperature: '', humidity: '', response_action: '' }; this.load(); }
    } catch { this.toast('Cannot reach the server.'); }
  }

  async resolve(i: any) { const r = await this.api.resolveIncident(i.incident_id); this.toast(r.message); this.load(); }
}

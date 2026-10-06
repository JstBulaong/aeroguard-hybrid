import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

/** All calls to the AeroGuard PHP API (XAMPP). Every endpoint returns { success, message, ... }. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ---- session (kept in localStorage) ----
  get user(): any { const s = localStorage.getItem('ag_user'); return s ? JSON.parse(s) : null; }
  set user(u: any) { u ? localStorage.setItem('ag_user', JSON.stringify(u)) : localStorage.removeItem('ag_user'); }
  logout() { this.user = null; }

  private post(path: string, body: any) { return firstValueFrom(this.http.post<any>(`${this.base}${path}`, body)); }
  private put(path: string, body: any)  { return firstValueFrom(this.http.put<any>(`${this.base}${path}`, body)); }
  private get(path: string)             { return firstValueFrom(this.http.get<any>(`${this.base}${path}`)); }
  private del(path: string, body: any)  { return firstValueFrom(this.http.request<any>('DELETE', `${this.base}${path}`, { body })); }

  // ---- auth ----
  login(username: string, password: string) { return this.post('/login.php', { username, password }); }
  register(u: any) { return this.post('/register.php', u); }

  // ---- users CRUD ----
  getUsers()          { return this.get('/users.php'); }
  createUser(u: any)  { return this.post('/users.php', u); }
  updateUser(u: any)  { return this.put('/users.php', u); }
  deleteUser(user_id: number) { return this.del('/users.php', { user_id }); }

  // ---- incidents (transaction) ----
  getIncidents()            { return this.get('/incidents.php'); }
  createIncident(i: any)    { return this.post('/incidents.php', i); }
  saveRemarks(incident_id: number, response_action: string) { return this.put('/incidents.php', { incident_id, response_action }); }
  resolveIncident(incident_id: number) { return this.put('/incidents.php', { incident_id }); }
}

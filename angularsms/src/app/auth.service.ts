import { routes } from './app.routes';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router =  inject(Router)

  // keep user info & permissions in a BehaviorSubject for reactive UI updates
  private user$ = new BehaviorSubject<any>(null);
  user = this.user$.asObservable();
  private accessToken: string | null = null;

  get currentUser() { return this.user$.value; }
  get token() { return this.accessToken; }

login(email: string, password: string) {
  return this.http.post<{ accessToken: string }>(`${environment.apiBaseUrl}/api/auth/login`, { email, password }, { withCredentials: true })
    .pipe(
      tap(async (res) => {
        this.accessToken = res.accessToken;
        await this.fetchMe();  // await instead of subscribe
      })
    );
}

  async fetchMe() {
    // fetch profile endpoint protected by jwt
    try {
      const me = await this.http.get<any>(`${environment.apiBaseUrl}/api/auth/me`).toPromise();
      this.user$.next(me);
      return me;
    } catch(e) {
      this.logout();
      throw e;
    }
  }

  logout() {
    this.accessToken = null;
    this.user$.next(null);
    this.http.post(`${environment.apiBaseUrl}/api/auth/logout`, {},{ withCredentials: true }).subscribe(({
      next: () => {
        console.log("Logged out, refreshToken cleared server-side")
        this.router.navigate(['/login']);
      },
      error: () => console.warn("Logout failed, but local state cleared")
    }));
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  hasRole(role: string): boolean {
    const u = this.currentUser;
    return !!u && (u.role === role || u.role === 'admin');
  }

  hasPermission(permission: string): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (u.role === 'admin') return true;
    return (u.permissions || []).includes(permission);
  }
}

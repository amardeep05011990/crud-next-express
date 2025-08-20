import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  // sidebar state
  private _sidebarOpen$ = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._sidebarOpen$.asObservable();

  openSidebar()  { this._sidebarOpen$.next(true); }
  closeSidebar() { this._sidebarOpen$.next(false); }
  toggleSidebar(){ this._sidebarOpen$.next(!this._sidebarOpen$.value); }

  // demo notifications
  private _notifications$ = new BehaviorSubject<Array<{id:number;text:string;time:string;read:boolean}>>([
    { id: 1, text: 'Welcome to the dashboard!', time: 'just now', read: false },
    { id: 2, text: 'New user registered', time: '2m', read: false },
    { id: 3, text: 'Backup completed', time: '1h', read: true }
  ]);
  notifications$ = this._notifications$.asObservable();

  markAllRead() {
    const next = this._notifications$.value.map(n => ({...n, read: true}));
    this._notifications$.next(next);
  }
  unreadCount() {
    return this._notifications$.value.filter(n => !n.read).length;
  }
}

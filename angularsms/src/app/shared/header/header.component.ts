import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from '../services/tenant.service';
import { UiService } from '../services/ui.service';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  tenant = this.tenantService.getTenant();
  unreadCount$ = this.ui.notifications$.pipe(map(() => this.ui.unreadCount()));

  constructor(private tenantService: TenantService, public ui: UiService) {}

  toggleSidebar() { this.ui.toggleSidebar(); }
  markAllRead()   { this.ui.markAllRead(); }

  switchTenant(key: 'a'|'b') {
    this.tenantService.switchTenant(key);
    this.tenant = this.tenantService.getTenant();
  }

  logout() { /* wire your auth */ alert('Logged out'); }
}

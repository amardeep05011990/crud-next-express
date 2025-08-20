import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiService } from '../services/ui.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  sidebarOpen$: Observable<boolean> = this.ui.sidebarOpen$;

  links = [
    { label: 'Dashboard', icon: 'bi bi-speedometer2', url: '/dashboard' },
    { label: 'Users',      icon: 'bi bi-people',      url: '/users' },
    { label: 'Settings',   icon: 'bi bi-gear',        url: '/settings' }
  ];

  constructor(private ui: UiService) {}

  // close drawer after navigating on small screens
  @HostListener('window:resize')
  onResize() { /* optional logic */ }

  closeOnClick() { this.ui.closeSidebar(); }
}

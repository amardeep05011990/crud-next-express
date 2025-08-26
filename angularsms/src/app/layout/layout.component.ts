import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BreadcrumbComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  collapsed = false;       // Desktop collapse
  isSidebarOpen = false;   // Mobile drawer
  currentYear = new Date().getFullYear();

  user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin'
  };

  constructor(private router: Router) {}

  // toggleSidebar() {
  //   if (window.innerWidth < 992) {
  //     // Mobile drawer
  //     this.isSidebarOpen = !this.isSidebarOpen;
  //   } else {
  //     // Desktop collapse
  //     this.collapsed = !this.collapsed;
  //   }
  // }

  closeSidebar() {
    this.isSidebarOpen = false; // Always close on overlay or menu click
  }

  // logout() {
  //   console.log('Logging out...');
  //   this.router.navigate(['/login']);
  // }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.collapsed = !this.collapsed && !this.isMobile(); // collapse only desktop
    return  null;
  }

  isMobile(): boolean {
    return window.innerWidth < 992;
  }

  logout() {
    console.log('Logging out...');
  }

  /** Keep menu open if route matches */
  isChildActive(paths: string[]): boolean {
    return paths.some(path => this.router.url.includes(path));
  }
}

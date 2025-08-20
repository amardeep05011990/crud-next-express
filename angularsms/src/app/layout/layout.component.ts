import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BreadcrumbComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  collapsed = false;
  currentYear = new Date().getFullYear();
   // Fake user data - replace with real auth service later
  user = {
    name: 'Admin',
    email: 'admin@example.com',
    role: 'Super Admin'
  };


  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    console.log("Logging out...");
    // implement real logout
  }
}

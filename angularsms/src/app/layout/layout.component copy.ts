import { Component } from '@angular/core';
// import { HeaderComponent } from '../shared/header.component';
// import { SidebarComponent } from '../shared/sidebar.component';
// import { FooterComponent } from '../shared/footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { UiService } from '../services/ui.service';
import { map } from 'rxjs/operators';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { UiService } from '../shared/services/ui.service';
import { BreadcrumbComponent } from "../shared/breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FooterComponent, RouterOutlet, BreadcrumbComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
currentYear: any;
user: any;
logout() {
throw new Error('Method not implemented.');
}
toggleSidebar() {
throw new Error('Method not implemented.');
}
  isOpen$ = this.ui.sidebarOpen$.pipe(map(Boolean));
collapsed: any;
  constructor(public ui: UiService) {}
}

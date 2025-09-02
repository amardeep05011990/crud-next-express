// ========= LIST COMPONENT =========
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { StudentsFormComponent } from './students-form.component';
import { StudentsViewComponent } from './students-view.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, StudentsFormComponent, StudentsViewComponent],
  templateUrl: './students-list.component.html'
})
export class StudentsListComponent implements OnInit {
  items: any[] = [];
  page: number = 1;
  limit: number = 2;
  totalPages: number = 0;
  total: number = 0;
  loading: boolean = false;
  selectedItem: any = null;

  // ✅ Global search + field filters
  searchTerm: string = '';
  filters: any = {
    city: '',
    gender: '',
    title: '',
    asdf123333: ''
  };

  globalMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.loading = true;

    // Build query params
    let params = `?page=${this.page}&limit=${this.limit}`;
    if (this.searchTerm) {
      params += `&search=${this.searchTerm}`;
    }
    for (const key in this.filters) {
      if (this.filters[key]) {
        params += `&${key}=${this.filters[key]}`;
      }
    }

    this.http.get<any>(`${environment.apiBaseUrl}/api/students${params}`)
      .subscribe(res => {
        this.items = res.data || [];
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      }, _err => {
        this.items = [];
        this.loading = false;
      });
  }

  applyFilters() {
    this.page = 1;
    this.fetchItems();
  }

  onSearch() {
    this.page = 1;
    this.fetchItems();
  }

  editItem(item: any) {
    this.selectedItem = { ...item };
  }

  deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    this.http.delete(`${environment.apiBaseUrl}/api/students/${id}`).subscribe(() => {
      this.globalMessage = { type: 'success', text: 'Students deleted successfully!' };
      this.fetchItems();
    });
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.fetchItems();
  }

  onFormSaved() {
    this.selectedItem = null;
    this.fetchItems();
  }

  onMessage(msg: { type: 'success' | 'error', text: string }) {
    this.globalMessage = msg;
    setTimeout(() => this.globalMessage = null, 4000);
  }

  addItem() {
    this.selectedItem = {}; // open empty form
  }

  onFormCancelled() {
    this.selectedItem = null; // back to list
  }
  selectedViewId: string | null = null;

  viewItem(item: any) {
    this.selectedViewId = item._id;
  }
  closeView() {
    this.selectedViewId = null;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { StudentsFormComponent } from './students-form.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, StudentsFormComponent],
  templateUrl: './students-list.component.html'
})
export class StudentsListComponent implements OnInit {
  items: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  limit: number = 2;
  totalPages: number = 0;
  total: number = 0;
  loading: boolean = false;
  selectedItem: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/api/students?page=${this.page}&limit=${this.limit}&search=${this.searchTerm}`)
      .subscribe(res => {
        this.items = res.data;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      });
  }

  editItem(item: any) {
    this.selectedItem = { ...item };
  }

  deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    this.http.delete(`${environment.apiBaseUrl}/api/students/${id}`).subscribe(() => {
      this.fetchItems();
    });
  }

  onSearchChange() {
    this.page = 1;
    this.fetchItems();
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
}
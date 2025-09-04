// ========= LIST COMPONENT =========
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { DemopostFormComponent } from './demopost-form.component';
import { DemopostViewComponent } from './demopost-view.component';

@Component({
  selector: 'app-demopost-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, DemopostFormComponent, DemopostViewComponent],
  templateUrl: './demopost-list.component.html'
})
export class DemopostListComponent implements OnInit, OnDestroy {
  items: any[] = [];
  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  total: number = 0;
  loading: boolean = false;
  selectedItem: any = null;
  selectedViewId: string | null = null;

  // ✅ Global search + field filters
  searchTerm: string = '';
  filters: any = {
    title: ''
  };

  globalMessage: { type: 'success' | 'error', text: string } | null = null;

  // ✅ RxJS subjects for debounced inputs
  private searchSubject = new Subject<void>();
  private filterSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initial load
    this.fetchItems();

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.fetchItems();
    });

    // Debounced filters
    this.filterSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.fetchItems();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

    this.http.get<any>(`${environment.apiBaseUrl}/api/demopost${params}`)
      .pipe(takeUntil(this.destroy$))
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

  // ✅ Triggered on typing in search box
  onSearch() {
    this.searchSubject.next();
  }

  // ✅ Triggered on typing in filter inputs
  applyFilters() {
    this.filterSubject.next();
  }

  editItem(item: any) {
    this.selectedItem = { ...item };
  }

  deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    this.http.delete(`${environment.apiBaseUrl}/api/demopost/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.globalMessage = { type: 'success', text: 'Demopost deleted successfully!' };
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

  viewItem(item: any) {
    this.selectedViewId = item._id;
  }

  closeView() {
    this.selectedViewId = null;
  }
  trackById(index: number, item: any) {
    return item._id;
  }
}
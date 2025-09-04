const fs = require("fs");
const path = require("path");

const schema = require("./schema.json");

const OUTPUT_DIR = path.join(__dirname, "../angularsms/src/app/generator/generated/forms");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

schema.collections.forEach((collection) => {
  const compName = capitalize(collection.name);
  const kebabName = collection.name;
  const apiUrl = `/api/${kebabName}`;

  // ========= FORM COMPONENT =========
  const formDir = path.join(OUTPUT_DIR, `${kebabName}-form`);
  if (!fs.existsSync(formDir)) fs.mkdirSync(formDir, { recursive: true });

const fields = collection.fields.map((field) => {
  const name = field.name;
  const label = capitalize(name);
  const type = field.form?.input || "text";
  const grid = field.form?.grid || 12;
  const options = field.form?.options || [];

  let validationMessages = "";
  if (field.validation?.required?.value) {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['required']">${label} is required.</div>`;
  }
  if (field.validation?.minLength?.value) {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['minlength']">Minimum length is ${field.validation.minLength.value}.</div>`;
  }
  if (field.validation?.maxLength?.value) {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['maxlength']">Maximum length is ${field.validation.maxLength.value}.</div>`;
  }
  if (field.validation?.min?.value !== undefined && field.validation.min.value !== "") {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['min']">Minimum value is ${field.validation.min.value}.</div>`;
  }
  if (field.validation?.max?.value !== undefined && field.validation.max.value !== "") {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['max']">Maximum value is ${field.validation.max.value}.</div>`;
  }
  if (field.validation?.pattern?.value) {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['pattern']">Invalid format.</div>`;
  }
  if (field.validation?.email?.value) {
    validationMessages += `<div *ngIf="form.get('${name}')?.errors?.['email']">Invalid email address.</div>`;
  }

  if (type === "radio") {
    return `
      <div class="col-md-${grid}">
        <label class="form-label">${label}</label>
        <div class="d-flex">
          ${options
            .map(
              (opt) => `
            <div class="form-check me-3">
              <input type="radio" class="form-check-input" formControlName="${name}" value="${opt}">
              <label class="form-check-label">${opt}</label>
            </div>
          `
            )
            .join("")}
        </div>
        <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
          ${validationMessages}
        </div>
      </div>`;
  }

  if (type === "select") {
    return `
      <div class="col-md-${grid}">
        <label for="${name}" class="form-label">${label}</label>
        <select class="form-select" id="${name}" formControlName="${name}">
          <option *ngFor="let opt of ${name}Options" [value]="opt">{{ opt }}</option>
        </select>
        <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
          ${validationMessages}
        </div>
      </div>`;
  }

  return `
    <div class="col-md-${grid}">
      <label for="${name}" class="form-label">${label}</label>
      <input type="${type}" class="form-control" id="${name}" formControlName="${name}">
      <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
        ${validationMessages}
      </div>
    </div>`;
});


  const formTs = `
// ========= FORM COMPONENT =========
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-${kebabName}-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './${kebabName}-form.component.html'
})
export class ${compName}FormComponent implements OnInit {
  @Input() item: any = null;
  @Output() formSaved = new EventEmitter<void>();
  @Output() message = new EventEmitter<{ type: 'success' | 'error', text: string }>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  ${collection.fields
    .filter(f => f.form?.input === "select")
    .map(f => `${f.name}Options = ${JSON.stringify(f.form?.options || [])};`)
    .join("\n  ")}

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
this.form = this.fb.group({
  ${collection.fields
    .map((f) => {
      // Build validators dynamically
      const validators = [];

      if (f.validation?.required?.value) {
        validators.push(`Validators.required`);
      }
      if (f.validation?.minLength?.value) {
        validators.push(`Validators.minLength(${f.validation.minLength.value})`);
      }
      if (f.validation?.maxLength?.value) {
        validators.push(`Validators.maxLength(${f.validation.maxLength.value})`);
      }
      if (f.validation?.min?.value !== undefined && f.validation.min.value !== "") {
        validators.push(`Validators.min(${f.validation.min.value})`);
      }
      if (f.validation?.max?.value !== undefined && f.validation.max.value !== "") {
        validators.push(`Validators.max(${f.validation.max.value})`);
      }
      if (f.validation?.pattern?.value) {
        validators.push(`Validators.pattern('${f.validation.pattern.value}')`);
      }
      if (f.validation?.email?.value) {
        validators.push(`Validators.email`);
      }

      const valString = validators.length ? `[${validators.join(", ")}]` : `[]`;
      return `${f.name}: ['', ${valString}]`;
    })
    .join(",\n      ")}
});

    if (this.item) {
      this.form.patchValue(this.item);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage = "Please fix the errors before submitting.";
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    const data = this.form.value;

    if (this.item?._id) {
      // Update
      this.http.put(\`\${environment.apiBaseUrl}${apiUrl}/\${this.item._id}\`, data).subscribe({
        next: () => {
          this.successMessage = '${compName} updated successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update ${compName}.';
          this.successMessage = '';
          // this.message.emit({ type: 'error', text: this.errorMessage });
          this.isSubmitting = false;
        }
      });
    } else {
      // Create
      this.http.post(\`\${environment.apiBaseUrl}${apiUrl}\`, data).subscribe({
        next: () => {
          this.successMessage = '${compName} added successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add ${compName}.';
          this.successMessage = '';
          this.message.emit({ type: 'error', text: this.errorMessage });
          this.isSubmitting = false;
        }
      });
    }
  }

  resetForm() {
    this.form.reset();
    this.item = null;
    this.isSubmitting = false;
    setTimeout(() => this.successMessage = '', 2000);
  }

  cancel() {
    this.formCancelled.emit();
  }
}
`;

  const formHtml = `
<div class="container mt-4">

  <!-- Success / Error Messages -->
  <div *ngIf="successMessage" class="alert alert-success" role="alert">
    {{ successMessage }}
  </div>
  <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
    {{ errorMessage }}
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3">
    ${fields.join("\n")}
    <div class="col-12">
      <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
        <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
        {{ item?._id ? 'Update' : 'Add' }} ${capitalize(collection.name)}
      </button>
      <button *ngIf="item" type="button" class="btn btn-secondary ms-2" (click)="resetForm()">Reset</button>
      <button type="button" class="btn btn-secondary ms-2" (click)="cancel()">
        Back
      </button>
    </div>
  </form>
</div>
`;

  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.ts`), formTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.html`), formHtml.trim(), "utf-8");


// ========= LIST COMPONENT =========
// ========= LIST COMPONENT =========
const listTs = `
// ========= LIST COMPONENT =========
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { ${compName}FormComponent } from './${kebabName}-form.component';
import { ${compName}ViewComponent } from './${kebabName}-view.component';

@Component({
  selector: 'app-${kebabName}-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ${compName}FormComponent, ${compName}ViewComponent],
  templateUrl: './${kebabName}-list.component.html'
})
export class ${compName}ListComponent implements OnInit, OnDestroy {
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
    ${collection.fields.map((f) => `${f.name}: ''`).join(",\n    ")}
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
    let params = \`?page=\${this.page}&limit=\${this.limit}\`;
    if (this.searchTerm) {
      params += \`&search=\${this.searchTerm}\`;
    }
    for (const key in this.filters) {
      if (this.filters[key]) {
        params += \`&\${key}=\${this.filters[key]}\`;
      }
    }

    this.http.get<any>(\`\${environment.apiBaseUrl}${apiUrl}\${params}\`)
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
    this.http.delete(\`\${environment.apiBaseUrl}${apiUrl}/\${id}\`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.globalMessage = { type: 'success', text: '${compName} deleted successfully!' };
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
`;






const listHtml = `
<div class="container mt-4">
  <!-- Global Success/Error Messages -->
  <div *ngIf="globalMessage" 
       class="alert" 
       [ngClass]="{'alert-success': globalMessage.type==='success', 'alert-danger': globalMessage.type==='error'}" 
       role="alert">
    {{ globalMessage.text }}
  </div>

  <!-- Show Form when editing or adding -->
  <app-${kebabName}-form 
    *ngIf="selectedItem" 
    [item]="selectedItem" 
    (formSaved)="onFormSaved()" 
    (message)="onMessage($event)"
    (formCancelled)="onFormCancelled()">
  </app-${kebabName}-form>

  <!-- Show View Details -->
  <app-${kebabName}-view
    *ngIf="selectedViewId"
    [id]="selectedViewId"
    (closed)="closeView()">
  </app-${kebabName}-view>

  <!-- Show List when not editing or viewing -->
  <div *ngIf="!selectedItem && !selectedViewId">
    <div class="d-flex justify-content-between mb-3">
      <!-- Search -->
      <input type="text" class="form-control w-50" placeholder="Search..." 
             [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
      <!-- Add Button -->
      <button class="btn btn-primary" (click)="addItem()">+ Add New</button>
    </div>

    <div *ngIf="loading" class="text-center my-3">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <table class="table table-striped mt-3">
      <thead>
        <tr>
          ${collection.fields.map((f) => `<th>${capitalize(f.name)}</th>`).join("\n")}
          <th>Actions</th>
        </tr>
        <!-- Filters row (always visible, even if no results) -->
        <tr>
          ${collection.fields
            .map(
              (f) => `<th><input type="text" class="form-control form-control-sm" 
              [(ngModel)]="filters.${f.name}" 
              (ngModelChange)="applyFilters()" 
              placeholder="Filter..." /></th>`
            )
            .join("\n")}
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items; trackBy: trackById">
          ${collection.fields.map((f) => `<td>{{ item.${f.name} }}</td>`).join("\n")}
          <td>
            <button class="btn btn-sm btn-info me-2" (click)="editItem(item)">Edit</button>
            <button class="btn btn-sm btn-secondary me-2" (click)="viewItem(item)">View</button>
            <button class="btn btn-sm btn-danger" (click)="deleteItem(item._id)">Delete</button>
          </td>
        </tr>
        <tr *ngIf="!loading && items.length === 0">
          <td colspan="${collection.fields.length + 1}" class="text-center text-muted">
            No results found.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <app-pagination
      [page]="page"
      [totalPages]="totalPages"
      [total]="total"
      [mode]="'google'"
      (pageChange)="changePage($event)">
    </app-pagination>
  </div>
</div>
`;





  fs.writeFileSync(path.join(formDir, `${kebabName}-list.component.ts`), listTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-list.component.html`), listHtml.trim(), "utf-8");

const viewTs = `
// ========= VIEW COMPONENT =========
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-${kebabName}-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './${kebabName}-view.component.html'
})
export class ${compName}ViewComponent implements OnInit {
  @Input() id: string | null = null;
  @Output() closed = new EventEmitter<void>();   // ✅ add this
  item: any = null;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.id) {
      this.fetchItem();
    }
  }

  fetchItem() {
    this.loading = true;
    this.http.get<any>(\`\${environment.apiBaseUrl}${apiUrl}/\${this.id}\`).subscribe(res => {
      this.item = res;
      this.loading = false;
    }, _err => {
      this.item = null;
      this.loading = false;
    });
  }

  closeView() {
    this.closed.emit();   // ✅ now it notifies parent
  }
}

`;


const viewHtml = `
<div class="container mt-4">
  <h3>${compName} Details</h3>

  <button class="btn btn-secondary mb-3" (click)="closeView()">Back</button> <!-- 👈 -->

  <div *ngIf="loading" class="text-center my-3">
    <div class="spinner-border" role="status"></div>
  </div>

  <div *ngIf="!loading && item">
    <table class="table table-bordered">
      <tbody>
        ${collection.fields
          .map(
            (f) => `
        <tr>
          <th style="width:200px">${capitalize(f.name)}</th>
          <td>{{ item.${f.name} }}</td>
        </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
  </div>

  <div *ngIf="!loading && !item" class="alert alert-warning">
    Record not found.
  </div>
</div>

`;

  fs.writeFileSync(path.join(formDir, `${kebabName}-view.component.ts`), viewTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-view.component.html`), viewHtml.trim(), "utf-8");
});

console.log("✅ CRUD-ready Angular Form & List components generated with Edit + Delete + Pagination!");

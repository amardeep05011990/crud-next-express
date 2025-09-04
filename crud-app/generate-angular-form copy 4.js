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
        </div>`;
    }

    if (type === "select") {
      return `
      <div class="col-md-${grid}">
        <label for="${name}" class="form-label">${label}</label>
        <select class="form-select" id="${name}" formControlName="${name}">
          <option *ngFor="let opt of ${name}Options" [value]="opt">{{ opt }}</option>
        </select>
      </div>`;
    }

    return `
      <div class="col-md-${grid}">
        <label for="${name}" class="form-label">${label}</label>
        <input type="${type}" class="form-control" id="${name}" formControlName="${name}">
        <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
          ${label} is required
        </div>
      </div>`;
  });

  const formTs = `
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
        .map((f) => `${f.name}: ['', ${f.validation?.required?.value ? "Validators.required" : ""}]`)
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
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update ${compName}.';
          this.successMessage = '';
          this.isSubmitting = false;
        }
      });
    } else {
      // Create
      this.http.post(\`\${environment.apiBaseUrl}${apiUrl}\`, data).subscribe({
        next: () => {
          this.successMessage = '${compName} added successfully!';
          this.errorMessage = '';
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add ${compName}.';
          this.successMessage = '';
          this.isSubmitting = false;
        }
      });
    }
  }

  resetForm() {
    this.form.reset();
    this.item = null;
    this.isSubmitting = false;
    setTimeout(() => this.successMessage = '', 3000);
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
      <button *ngIf="item" type="button" class="btn btn-secondary ms-2" (click)="resetForm()">Cancel</button>
    </div>
  </form>
</div>
`;

  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.ts`), formTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.html`), formHtml.trim(), "utf-8");

  // ========= LIST COMPONENT =========
  const listTs = `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../pagination/pagination.component';
import { ${compName}FormComponent } from './${kebabName}-form.component';

@Component({
  selector: 'app-${kebabName}-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ${compName}FormComponent],
  templateUrl: './${kebabName}-list.component.html'
})
export class ${compName}ListComponent implements OnInit {
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
    this.http.get<any>(\`\${environment.apiBaseUrl}${apiUrl}?page=\${this.page}&limit=\${this.limit}&search=\${this.searchTerm}\`)
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
    this.http.delete(\`\${environment.apiBaseUrl}${apiUrl}/\${id}\`).subscribe(() => {
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
  addItem() {
    this.selectedItem = {}; // open empty form for new entry
  }
}
`;

  const listHtml = `
<div class="container mt-4">

  <!-- Show Form when editing or adding -->
  <app-${kebabName}-form *ngIf="selectedItem" [item]="selectedItem" (formSaved)="onFormSaved()"></app-${kebabName}-form>

  <div *ngIf="!selectedItem">
    <div class="d-flex justify-content-between mb-3">
      <input type="text" class="form-control w-25" placeholder="Search..." [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()">

      <!-- Add Button -->
      <button class="btn btn-primary" (click)="addItem()">+ Add New</button>
    </div>

    <div *ngIf="loading" class="text-center my-3">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <table class="table table-striped mt-3" *ngIf="items.length && !loading">
      <thead>
        <tr>
          ${collection.fields.map((f) => `<th>${capitalize(f.name)}</th>`).join("\n")}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items">
          ${collection.fields.map((f) => `<td>{{ item.${f.name} }}</td>`).join("\n")}
          <td>
            <button class="btn btn-sm btn-info me-2" (click)="editItem(item)">Edit</button>
            <button class="btn btn-sm btn-danger" (click)="deleteItem(item._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="!items.length && !loading" class="text-muted">No results found.</p>

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
});

console.log("✅ CRUD-ready Angular Form & List components generated with Edit + Delete + Pagination!");

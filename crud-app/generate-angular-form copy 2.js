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
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-${kebabName}-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './${kebabName}-form.component.html'
})
export class ${compName}FormComponent implements OnInit {
  @Input() item: any = null;
  form!: FormGroup;

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
    if (this.form.invalid) return;

    const data = this.form.value;
    if (this.item?._id) {
      // Update
      this.http.put(\`\${environment.apiBaseUrl}${apiUrl}/\${this.item._id}\`, data).subscribe(() => {
        alert('${compName} updated!');
      });
    } else {
      // Create
      this.http.post(\`\${environment.apiBaseUrl}${apiUrl}\`, data).subscribe(() => {
        alert('${compName} added!');
      });
    }

    this.form.reset();
  }
}
`;

  const formHtml = `
<div class="container mt-4">
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3">
    ${fields.join("\n")}
    <div class="col-12">
      <button type="submit" class="btn btn-primary">
        {{ item?._id ? 'Update' : 'Add' }} ${capitalize(collection.name)}
      </button>
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
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-${kebabName}-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './${kebabName}-list.component.html'
})
export class ${compName}ListComponent implements OnInit {
  items: any[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.http.get<any[]>(\`\${environment.apiBaseUrl}${apiUrl}\`).subscribe(res => this.items = res);
  }

  deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    this.http.delete(\`\${environment.apiBaseUrl}${apiUrl}/\${id}\`).subscribe(() => {
      this.items = this.items.filter(i => i._id !== id);
    });
  }

  get filteredItems() {
    return this.items.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }
}
`;

  const listHtml = `
<div class="container mt-4">
  <div class="d-flex justify-content-between mb-3">
    <input type="text" class="form-control w-25" placeholder="Search..." [(ngModel)]="searchTerm">
  </div>

  <table class="table table-striped mt-3" *ngIf="filteredItems.length">
    <thead>
      <tr>
        ${collection.fields.map((f) => `<th>${capitalize(f.name)}</th>`).join("\n")}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of filteredItems">
        ${collection.fields.map((f) => `<td>{{ item.${f.name} }}</td>`).join("\n")}
        <td>
          <button class="btn btn-sm btn-danger" (click)="deleteItem(item._id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
  <p *ngIf="!filteredItems.length" class="text-muted">No results found.</p>
</div>
`;

  fs.writeFileSync(path.join(formDir, `${kebabName}-list.component.ts`), listTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-list.component.html`), listHtml.trim(), "utf-8");
});

console.log("✅ API-connected Angular Form & List components generated!");

const fs = require("fs");
const path = require("path");

const schema = require("./schema.json");

// const OUTPUT_DIR = path.join(__dirname, "generated", "forms");
const OUTPUT_DIR = path.join(__dirname, "generated", "forms");

console.log("OUTPUT_DIR", OUTPUT_DIR)
console.log("__dirname", __dirname)

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

schema.collections.forEach((collection) => {
  const compName = `${capitalize(collection.name)}Form`;
  const kebabName = `${collection.name}-form`;
  const filename = path.join(OUTPUT_DIR, `${kebabName}.component.ts`);

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

    return `
      <div class="col-md-${grid}">
        <label for="${name}" class="form-label">${label}</label>
        <input type="${type}" class="form-control" id="${name}" formControlName="${name}">
        <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
          ${label} is required
        </div>
      </div>`;
  });

  const componentCode = `
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-${kebabName}',
  templateUrl: './${kebabName}.component.html'
})
export class ${compName}Component implements OnInit {
  form!: FormGroup;
  items: any[] = [];
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      ${collection.fields
        .map((f) => `${f.name}: ['', ${f.validation?.required?.value ? "Validators.required" : ""}]`)
        .join(",\n      ")}
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (this.editingIndex !== null) {
      this.items[this.editingIndex] = this.form.value;
      this.editingIndex = null;
    } else {
      this.items.push(this.form.value);
    }
    this.form.reset();
  }

  editItem(i: number) {
    this.form.patchValue(this.items[i]);
    this.editingIndex = i;
  }

  deleteItem(i: number) {
    this.items.splice(i, 1);
  }
}
`;

  const htmlCode = `
<div class="container mt-4">
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3">
    ${fields.join("\n")}
    <div class="col-12">
      <button type="submit" class="btn btn-primary me-2">
        {{ editingIndex !== null ? 'Update' : 'Add' }} ${capitalize(collection.name)}
      </button>
      <button type="button" class="btn btn-secondary" (click)="form.reset(); editingIndex=null">Reset</button>
    </div>
  </form>

  <hr>

  <table class="table table-striped mt-3" *ngIf="items.length">
    <thead>
      <tr>
        ${collection.fields.map((f) => `<th>${capitalize(f.name)}</th>`).join("\n")}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of items; let i = index">
        ${collection.fields.map((f) => `<td>{{ item.${f.name} }}</td>`).join("\n")}
        <td>
          <button class="btn btn-sm btn-warning me-2" (click)="editItem(i)">Edit</button>
          <button class="btn btn-sm btn-danger" (click)="deleteItem(i)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;

  fs.writeFileSync(filename, componentCode.trim(), "utf-8");
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${kebabName}.component.html`),
    htmlCode.trim(),
    "utf-8"
  );
});

console.log("✅ Angular CRUD form components generated in /generated/forms");

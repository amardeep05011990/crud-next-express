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

    // ==== CUSTOM TYPES ====
    if (type === "textarea") {
      return `
        <div class="col-md-${grid}">
          <label for="${name}" class="form-label">${label}</label>
          <textarea class="form-control" id="${name}" formControlName="${name}"></textarea>
          <div *ngIf="form.get('${name}')?.invalid && form.get('${name}')?.touched" class="text-danger">
            ${validationMessages}
          </div>
        </div>`;
    }

    if (type === "checkbox") {
      return `
        <div class="col-md-${grid} form-check mt-4">
          <input type="checkbox" class="form-check-input" id="${name}" formControlName="${name}">
          <label class="form-check-label" for="${name}">${label}</label>
        </div>`;
    }
if (type === "checkbox-group") {
  return `
    <div class="col-md-${grid}">
      <label class="form-label">${label}</label>
      <div class="d-flex flex-wrap">
        ${options
          .map(
            (opt) => `
          <div class="form-check me-3">
            <input 
              type="checkbox" 
              class="form-check-input" 
              (change)="onCheckboxGroupChange('${name}', $event, '${opt}')"
              [checked]="form.get('${name}')?.value?.includes('${opt}')"> <!-- ✅ Preselect -->
            <label class="form-check-label">${opt}</label>
          </div>`
          )
          .join("")}
      </div>
    </div>`;
}


    if (type === "file") {
      return `
        <div class="col-md-${grid}">
          <label for="${name}" class="form-label">${label}</label>
          <input type="file" class="form-control" id="${name}" (change)="onFileSelected($event, '${name}')">
        </div>`;
    }

    if (type === "date" || type === "datetime") {
      return `
        <div class="col-md-${grid}">
          <label for="${name}" class="form-label">${label}</label>
          <input type="${type === "datetime" ? "datetime-local" : "date"}" class="form-control" id="${name}" formControlName="${name}">
        </div>`;
    }

    if (type === "password") {
      return `
        <div class="col-md-${grid}">
          <label for="${name}" class="form-label">${label}</label>
          <input type="password" class="form-control" id="${name}" formControlName="${name}">
        </div>`;
    }

    // if (type === "lookup") {
    //   return `
    //     <div class="col-md-${grid}">
    //       <label for="${name}" class="form-label">${label}</label>
    //       <select class="form-select" id="${name}" formControlName="${name}">
    //         <option *ngFor="let opt of ${name}Options" [ngValue]="opt">{{ opt.label || opt }}</option>
    //       </select>
    //     </div>`;
    // }

if (type === "lookup") {
  return `
    <div class="col-md-${grid}">
      <label for="${name}" class="form-label">${label}</label>
      <select class="form-select" id="${name}" formControlName="${name}">
        <option *ngFor="let opt of ${name}Options" [ngValue]="opt.value">{{ opt.label }}</option>
      </select>
    </div>`;
}


    // ==== EXISTING TYPES ====
    if (type === "radio") {
      return `
        <div class="col-md-${grid}">
          <label class="form-label">${label}</label>
          <div class="d-flex">
            ${options.map(opt => `
              <div class="form-check me-3">
                <input type="radio" class="form-check-input" formControlName="${name}" value="${opt}">
                <label class="form-check-label">${opt}</label>
              </div>`).join("")}
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

    if (type === "multiselect") {
      return `
        <div class="col-md-${grid}">
          <label for="${name}" class="form-label">${label}</label>
          <select class="form-select" id="${name}" formControlName="${name}" multiple>
            <option *ngFor="let opt of ${name}Options" [value]="opt">{{ opt }}</option>
          </select>
        </div>`;
    }

    // default input
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
  .filter(f => ["select", "lookup", "multiselect", "radio", "checkbox-group"].includes(f.form?.input))
  .map(f => `${f.name}Options: any = ${JSON.stringify(f.form?.options || [])};`)
  
  .join("\n  ")}



  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {

        ${collection.fields
      .filter(f => f.form?.input === "lookup")
      .map(f => {
        const lookupCollection = f.form?.collection;
        const labelField = f.form?.labelField || "label";
        const valueField = f.form?.valueField || "_id";
        return `
        // Fetch lookup options for ${f.name}
        this.http.get<any>(\`\${environment.apiBaseUrl}/api/${lookupCollection}\`).subscribe(res => {
          const items = Array.isArray(res) ? res : res.data || [];
          this.${f.name}Options = items.map((item: any) => ({
            label: item["${labelField}"],
            value: item["${valueField}"]
          }));
        });`;
      })
      .join("\n")}

    this.form = this.fb.group({
      ${collection.fields
        .map((f) => {
          const validators = [];

          if (f.validation?.required?.value) validators.push(`Validators.required`);
          if (f.validation?.minLength?.value) validators.push(`Validators.minLength(${f.validation.minLength.value})`);
          if (f.validation?.maxLength?.value) validators.push(`Validators.maxLength(${f.validation.maxLength.value})`);
          if (f.validation?.min?.value !== undefined && f.validation.min.value !== "") validators.push(`Validators.min(${f.validation.min.value})`);
          if (f.validation?.max?.value !== undefined && f.validation.max.value !== "") validators.push(`Validators.max(${f.validation.max.value})`);
          if (f.validation?.pattern?.value) validators.push(`Validators.pattern('${f.validation.pattern.value}')`);
          if (f.validation?.email?.value) validators.push(`Validators.email`);

          const valString = validators.length ? `[${validators.join(", ")}]` : `[]`;

          // checkbox-group = array, checkbox = boolean
          if (f.form?.input === "multiselect" || f.form?.input === "checkbox-group") {
            return `${f.name}: [[], ${valString}]`;   // array by default
          } else if (f.form?.input === "checkbox") {
            return `${f.name}: [false, ${valString}]`; // boolean default
          } else {
            return `${f.name}: ['', ${valString}]`;    // string default
}
        })
        .join(",\n      ")}
    });

    if (this.item) {
      this.form.patchValue(this.item);
    }
  }

  // File upload handler
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.patchValue({ [controlName]: input.files[0] });
    }
  }

  // Checkbox group handler
  // onCheckboxGroupChange(controlName: string, event: any, value: string) {
  //   const arr: string[] = this.form.get(controlName)?.value || [];
  //   if (event.target.checked) {
  //     arr.push(value);
  //   } else {
  //     const idx = arr.indexOf(value);
  //     if (idx >= 0) arr.splice(idx, 1);
  //   }
  //   this.form.get(controlName)?.setValue(arr);
  // }

onCheckboxGroupChange(controlName: string, event: any, value: string) {
  const arr: string[] = this.form.get(controlName)?.value || [];

  if (event.target.checked) {
    // ✅ Add only if not already present
    if (!arr.includes(value)) {
      arr.push(value);
    }
  } else {
    // ✅ Remove when unchecked
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
  }

  this.form.get(controlName)?.setValue(arr);
}


  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage = "Please fix the errors before submitting.";
      this.successMessage = '';
      return;
    }
    if (this.form.valid) {
      console.log("this.form.value", this.form.value);
    }

    this.isSubmitting = true;
    const data = this.form.value;

    if (this.item?._id) {
      this.http.put(\`\${environment.apiBaseUrl}${apiUrl}/\${this.item._id}\`, data).subscribe({
        next: () => {
          this.successMessage = '${compName} updated successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update ${compName}.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.http.post(\`\${environment.apiBaseUrl}${apiUrl}\`, data).subscribe({
        next: () => {
          this.successMessage = '${compName} added successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add ${compName}.';
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
  <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
  <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="row g-3">
    ${fields.join("\n")}
    <div class="col-12">
      <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
        <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
        {{ item?._id ? 'Update' : 'Add' }} ${capitalize(collection.name)}
      </button>
      <button *ngIf="item" type="button" class="btn btn-secondary ms-2" (click)="resetForm()">Reset</button>
      <button type="button" class="btn btn-secondary ms-2" (click)="cancel()">Back</button>
    </div>
  </form>
</div>
`;

  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.ts`), formTs.trim(), "utf-8");
  fs.writeFileSync(path.join(formDir, `${kebabName}-form.component.html`), formHtml.trim(), "utf-8");
});

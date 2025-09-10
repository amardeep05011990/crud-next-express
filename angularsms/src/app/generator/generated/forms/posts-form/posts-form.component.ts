// ========= FORM COMPONENT =========
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-posts-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './posts-form.component.html'
})
export class PostsFormComponent implements OnInit {
  @Input() item: any = null;
  @Output() formSaved = new EventEmitter<void>();
  @Output() message = new EventEmitter<{ type: 'success' | 'error', text: string }>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  searchTexts: { [key: string]: string } = {};

 categoryOptions: any[] = ["Tech","Life","Business"];
  tagsOptions: any[] = ["Angular","Node.js","MongoDB","Express","Angular2","Node.js2","MongoDB2","Express2","Angular1","Node.js1","MongoDB1","Express1","Angular3","Node.js3","MongoDB3","Express3","Angular4","Node.js4","MongoDB4","Express4"];
  hobbiesOptions: any[] = ["Reading","Traveling","Cooking","Sports","Reading2","Traveling2","Cooking2","Sports2","Reading1","Traveling1","Cooking1","Sports1","Reading3","Traveling3","Cooking3","Sports3","Reading4","Traveling4","Cooking4","Sports4"];
  authorOptions: any[] = [];
  assignmentOptions: any[] = [];
  statusOptions: any[] = ["draft","published"];

  [key: string]: any; // for dynamic lookup arrays

  constructor(private fb: FormBuilder, private http: HttpClient) {}


  // Normal dropdown lookup
  loadAuthorOptions() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/users`).subscribe(res => {
      const items = Array.isArray(res) ? res : res.data || [];
      this.authorOptions = items.map((item: any) => ({
        label: item["name"],
        value: item["_id"]
      }));
    });
  }

    assignmentSearchTimeout: any;

  // Generic lookup search
  onLookupSearch(controlName: string, query: string) {
    this.searchTexts[controlName] = query;

    if (!query) {
      this[controlName + "Options"] = [];
      return;
    }

    clearTimeout(this[controlName + "SearchTimeout"]);
    this[controlName + "SearchTimeout"] = setTimeout(() => {
      this.http
        .get<any>(`${environment.apiBaseUrl}/api/${controlName}s?title=${query}&limit=10`)
        .subscribe(res => {
          const items = Array.isArray(res) ? res : res.data || [];
          this[controlName + "Options"] = items?.map((item: any) => ({
            label: item["title"],
            value: item["_id"]
          }));
        });
    }, 300);
  }

  // Select from dropdown
  selectLookupOption(controlName: string, option: any) {
    this.form.get(controlName)?.setValue(option.value);
    this[controlName + "Options"] = [option];
    this.searchTexts[controlName] = option.label; // keep label in input
  }

  // Get label for current value (dual state)
  getSelectedLabel(controlName: string): string {
    if (this.searchTexts[controlName] !== undefined) {
      return this.searchTexts[controlName];
    }
    const value = this.form.get(controlName)?.value;
    const option = this[controlName + "Options"]?.find((o: any) => o.value === value);
    return option ? option.label : "";
  }

  ngOnInit() {

    this.loadAuthorOptions();

    this.form = this.fb.group({
      title: ['', [Validators.required]],
      descriptions: ['', []],
      category: ['', []],
      tags: [[], []],
      hobbies: [[], [Validators.required]],
      author: ['', []],
      assignment: ['', []],
      status: ['', []],
      isFeatured: [false, []],
      coverImage: ['', []],
      views: ['', []],
      publishedDate: ['', []]
    });

    if (this.item) {
      this.form.patchValue(this.item);

      // preload lookup values on edit
      
      if (this.item?.author) {
        this.http.get<any>(`${environment.apiBaseUrl}/api/users/${this.item.author}`)
          .subscribe(res => {
            if (res) {
              this.authorOptions = [{
                label: res["name"],
                value: res["_id"]
              }];
              this.form.get("author")?.setValue(res["_id"]);
            }
          });
      }

      if (this.item?.assignment) {
        this.http.get<any>(`${environment.apiBaseUrl}/api/assignments/${this.item.assignment}`)
          .subscribe(res => {
            if (res) {
              this.assignmentOptions = [{
                label: res["title"],
                value: res["_id"]
              }];
              this.form.get("assignment")?.setValue(res["_id"]);
            }
          });
      }
    }
  }

  // File upload handler
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.patchValue({ [controlName]: input.files[0] });
    }
  }

  onCheckboxGroupChange(controlName: string, event: any, value: string) {
    const arr: string[] = this.form.get(controlName)?.value || [];
    if (event.target.checked) {
      if (!arr.includes(value)) arr.push(value);
    } else {
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

    this.isSubmitting = true;
    const data = this.form.value;

    if (this.item?._id) {
      this.http.put(`${environment.apiBaseUrl}/api/posts/${this.item._id}`, data).subscribe({
        next: () => {
          this.successMessage = 'Posts updated successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update Posts.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.http.post(`${environment.apiBaseUrl}/api/posts`, data).subscribe({
        next: () => {
          this.successMessage = 'Posts added successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add Posts.';
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
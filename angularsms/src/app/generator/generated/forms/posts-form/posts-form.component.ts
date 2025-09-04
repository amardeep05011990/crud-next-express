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

  

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
this.form = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descriptions: ['', []]
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
      this.http.put(`${environment.apiBaseUrl}/api/posts/${this.item._id}`, data).subscribe({
        next: () => {
          this.successMessage = 'Posts updated successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update Posts.';
          this.successMessage = '';
          // this.message.emit({ type: 'error', text: this.errorMessage });
          this.isSubmitting = false;
        }
      });
    } else {
      // Create
      this.http.post(`${environment.apiBaseUrl}/api/posts`, data).subscribe({
        next: () => {
          this.successMessage = 'Posts added successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add Posts.';
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
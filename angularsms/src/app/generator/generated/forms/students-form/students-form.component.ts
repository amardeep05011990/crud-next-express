// ========= FORM COMPONENT =========
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './students-form.component.html'
})
export class StudentsFormComponent implements OnInit {
  @Input() item: any = null;
  @Output() formSaved = new EventEmitter<void>();
  @Output() message = new EventEmitter<{ type: 'success' | 'error', text: string }>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  cityOptions = ["jaipur","patna","banglore"];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.form = this.fb.group({
      city: ['', ],
      gender: ['', ],
      title: ['', Validators.required],
      asdf123333: ['', ]
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
      this.http.put(`${environment.apiBaseUrl}/api/students/${this.item._id}`, data).subscribe({
        next: () => {
          this.successMessage = 'Students updated successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update Students.';
          this.successMessage = '';
          // this.message.emit({ type: 'error', text: this.errorMessage });
          this.isSubmitting = false;
        }
      });
    } else {
      // Create
      this.http.post(`${environment.apiBaseUrl}/api/students`, data).subscribe({
        next: () => {
          this.successMessage = 'Students added successfully!';
          this.errorMessage = '';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add Students.';
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
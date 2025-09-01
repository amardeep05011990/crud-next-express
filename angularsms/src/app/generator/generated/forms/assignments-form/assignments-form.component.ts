import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-assignments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignments-form.component.html'
})
export class AssignmentsFormComponent implements OnInit {
  @Input() item: any = null;
  @Output() formSaved = new EventEmitter<void>();
  form!: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required]
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
      this.http.put(`${environment.apiBaseUrl}/api/assignments/${this.item._id}`, data).subscribe({
        next: () => {
          this.successMessage = 'Assignments updated successfully!';
          this.errorMessage = '';
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update Assignments.';
          this.successMessage = '';
          this.isSubmitting = false;
        }
      });
    } else {
      // Create
      this.http.post(`${environment.apiBaseUrl}/api/assignments`, data).subscribe({
        next: () => {
          this.successMessage = 'Assignments added successfully!';
          this.errorMessage = '';
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add Assignments.';
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
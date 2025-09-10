// ========= FORM COMPONENT =========
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
  @Output() message = new EventEmitter<{ type: 'success' | 'error', text: string }>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  searchTexts: { [key: string]: string } = {};

 titleOptions: any[] = ["asdf1","asdf2","asdf3","asdf4","asdf5"];

  [key: string]: any; // for dynamic lookup arrays

  constructor(private fb: FormBuilder, private http: HttpClient) {}



  ngOnInit() {

    

    this.form = this.fb.group({
      title: [[], [Validators.required]]
    });

    if (this.item) {
      this.form.patchValue(this.item);

      // preload lookup values on edit
      
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
      this.http.put(`${environment.apiBaseUrl}/api/assignments/${this.item._id}`, data).subscribe({
        next: () => {
          this.successMessage = 'Assignments updated successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to update Assignments.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.http.post(`${environment.apiBaseUrl}/api/assignments`, data).subscribe({
        next: () => {
          this.successMessage = 'Assignments added successfully!';
          this.message.emit({ type: 'success', text: this.successMessage });
          this.formSaved.emit();
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to add Assignments.';
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
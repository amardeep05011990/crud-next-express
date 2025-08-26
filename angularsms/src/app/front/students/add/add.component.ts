import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddStudentComponent {
  studentForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
    dob: ['', Validators.required],
    gender: ['', Validators.required],
    course: ['', Validators.required],
    address: ['']
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.studentForm.valid) {
      console.log('Student Data:', this.studentForm.value);
      alert('🎉 Student added successfully!');
      this.studentForm.reset();
    } else {
      this.studentForm.markAllAsTouched();
    }
  }

  get f() {
    return this.studentForm.controls;
  }
}

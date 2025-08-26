import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form-group',
  templateUrl: './dynamic-form-group.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class DynamicFormGroupComponent {
  userForm: FormGroup;
  isEdit = false;
  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],

      skills: this.fb.array([]),
      addresses: this.fb.array([])
    });
  }

  // ---------- Skills ----------
  get skills(): FormArray {
    return this.userForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control('', [Validators.required, Validators.minLength(2)]));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // ---------- Addresses ----------
  get addresses(): FormArray {
    return this.userForm.get('addresses') as FormArray;
  }

  addAddress() {
    const addressGroup = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]] // ✅ must be 6 digits
    });
    this.addresses.push(addressGroup);
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  // ---------- Submit ----------
  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // ✅ highlight all errors
      return;
    }
    console.log(this.userForm.value);
  }
}

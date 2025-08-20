import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEdit = false;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      skills: this.fb.array([]),
      addresses: this.fb.array([])
    });

    // check if we're editing
    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      this.isEdit = true;
      this.userService.getUser(this.userId).subscribe((data) => {
        this.loadUser(data);
      });
    } else {
      // initialize empty form
      this.addSkill();
      this.addAddress();
    }
  }

  // ------------------ Skills ------------------
  get skills(): FormArray {
    return this.userForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control('', [Validators.required, Validators.minLength(2)]));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // ------------------ Addresses ------------------
  get addresses(): FormArray {
    return this.userForm.get('addresses') as FormArray;
  }

  addAddress() {
    const addressGroup = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
    this.addresses.push(addressGroup);
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  // ------------------ Load User for Edit ------------------
  loadUser(data: any) {
    this.userForm.patchValue({ name: data.name });

    this.skills.clear();
    data.skills.forEach((skill: string) => {
      this.skills.push(this.fb.control(skill, [Validators.required, Validators.minLength(2)]));
    });

    this.addresses.clear();
    data.addresses.forEach((addr: any) => {
      this.addresses.push(
        this.fb.group({
          street: [addr.street, [Validators.required, Validators.minLength(3)]],
          city: [addr.city, Validators.required],
          pincode: [addr.pincode, [Validators.required, Validators.pattern('^[0-9]{6}$')]]
        })
      );
    });
  }

  // ------------------ Submit ------------------
  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.isEdit) {
      this.userService.updateUser(this.userId, this.userForm.value).subscribe(() => {
        alert('User updated successfully!');
        this.router.navigate(['/users']);
      });
    } else {
      this.userService.addUser(this.userForm.value).subscribe(() => {
        alert('User added successfully!');
        this.router.navigate(['/users']);
      });
    }
  }
}

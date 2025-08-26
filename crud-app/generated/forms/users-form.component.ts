import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html'
})
export class UsersFormComponent implements OnInit {
  form!: FormGroup;
  items: any[] = [];
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      gage: ['', ]
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
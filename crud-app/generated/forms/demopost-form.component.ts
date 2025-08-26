import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-demopost-form',
  templateUrl: './demopost-form.component.html'
})
export class DemopostFormComponent implements OnInit {
  form!: FormGroup;
  items: any[] = [];
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', ]
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
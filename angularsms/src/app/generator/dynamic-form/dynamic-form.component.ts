import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Collection, Field, Schema } from './../schema'

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnChanges {
  @Input() schema!: Schema;
  @Input() collectionName!: string;
  @Input() initialValue: Record<string, any> | null = null;

  form!: FormGroup;
  collection!: Collection | undefined;
  submitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['schema'] || changes['collectionName']) && this.schema && this.collectionName) {
      this.collection = this.schema.collections.find(c => c.name === this.collectionName);
      this.buildForm();
    }
    if (changes['initialValue'] && this.form && this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};
    this.collection?.fields.forEach(field => {
      const input = field.form?.input ?? this.defaultInputFor(field);
      const defaultValue = this.defaultValueFor(input);
      controls[field.name] = new FormControl(defaultValue, this.mapValidators(field));
    });
    this.form = this.fb.group(controls);
  }

  private defaultInputFor(field: Field): string {
    switch (field.type) {
      case 'Number': return 'number';
      case 'Boolean': return 'checkbox';
      default: return 'text';
    }
  }

  private defaultValueFor(input: string) {
    if (input === 'checkbox') return false;
    if (input === 'multiselect') return [];
    return '';
  }

  private mapValidators(field: Field) {
    const v = field.validation || {};
    const validators = [];

    if (v.required?.value) validators.push(Validators.required);
    if (v.min?.value !== undefined) validators.push(Validators.min(v.min.value));
    if (v.max?.value !== undefined) validators.push(Validators.max(v.max.value));
    if (v.minLength?.value !== undefined) validators.push(Validators.minLength(v.minLength.value));
    if (v.maxLength?.value !== undefined) validators.push(Validators.maxLength(v.maxLength.value));
    if (v.pattern?.value) validators.push(Validators.pattern(v.pattern.value));

    return validators;
  }

  // Helpers
  gridClass(field: Field): string {
    const grid = field.form?.grid ?? 12;
    return `col-12 col-md-${Math.min(Math.max(grid, 1), 12)}`;
  }

  labelOf(field: Field): string {
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
  }

  inputOf(field: Field): string {
    return field.form?.input ?? this.defaultInputFor(field);
  }

  optionsOf(field: Field): string[] {
    return field.form?.options ?? [];
  }

  // Submit
  submit() {
    this.submitting = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Emit or call API – here we just log
    console.log('✅ Dynamic form submit:', this.form.value);
  }

  // Accessor
  ctrl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }
}

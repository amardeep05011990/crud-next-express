import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchemaService } from '../schema.service';
import { Schema } from './../schema';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';


@Component({
  selector: 'app-dynamic-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFormComponent],
  templateUrl: './dynamic-form-page.component.html'
})
export class DynamicFormPageComponent {
  schema: Schema = this.schemaService.getSchema();
  collections = this.schema.collections.map(c => c.name);
  selected = this.collections[0]; // default: first collection

  constructor(private schemaService: SchemaService) {}
}

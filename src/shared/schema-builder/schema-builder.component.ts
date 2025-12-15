import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SchemaField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'multiselect';
  required?: boolean;
  options?: { label: string; value: any }[]; // for multiselect
}

@Component({
  selector: 'app-schema-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schema-builder.component.html',
  styleUrls: ['./schema-builder.component.scss']
})
export class SchemaBuilderComponent {

  @Input() fields: SchemaField[] = [];
  @Output() fieldsChange = new EventEmitter<SchemaField[]>();

  // Model for new field
  newField: SchemaField = {
    key: '',
    label: '',
    type: 'text',
    required: false
  };

  addField(): void {
    if (!this.newField.key || !this.newField.label) {
      alert('Key and Label are required');
      return;
    }

    // Prevent duplicate keys
    if (this.fields.some(f => f.key === this.newField.key)) {
      alert('Field key must be unique');
      return;
    }

    const fieldToAdd: SchemaField = {
      key: this.newField.key.trim(),
      label: this.newField.label.trim(),
      type: this.newField.type,
      required: this.newField.required
    };

    // ✅ Multiselect default options
    if (this.newField.type === 'multiselect') {
      fieldToAdd.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ];
    }

    this.fields = [...this.fields, fieldToAdd];
    this.fieldsChange.emit(this.fields);

    // Reset form
    this.newField = {
      key: '',
      label: '',
      type: 'text',
      required: false
    };
  }

  removeField(index: number): void {
    this.fields.splice(index, 1);
    this.fields = [...this.fields];
    this.fieldsChange.emit(this.fields);
  }
}

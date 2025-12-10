import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schema-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schema-builder.component.html',
  styleUrls: ['./schema-builder.component.scss']
})
export class SchemaBuilderComponent {

  @Input() fields: any[] = [];
  @Output() schemaChange = new EventEmitter<any[]>();

  newField = {
    key: '',
    label: '',
    type: 'text',
    required: false
  };

  /** ADD FIELD */
  addField() {
    if (!this.newField.key.trim() || !this.newField.label.trim()) {
      alert("Key and Label are required");
      return;
    }

    this.fields.push({ ...this.newField });

    this.schemaChange.emit(this.fields);

    this.newField = {
      key: '',
      label: '',
      type: 'text',
      required: false
    };
  }

  /** REMOVE FIELD */
  removeField(i: number) {
    this.fields.splice(i, 1);
    this.schemaChange.emit(this.fields);
  }
}

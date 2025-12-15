import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {

  @Input() schema!: { fields: any[] };
  @Input() formValues: Record<string, any> = {};
  @Input() errors: Record<string, string> = {};

  @Output() formValuesChange = new EventEmitter<any>();

  updateValue(key: string, value: any) {
    this.formValues[key] = value;
    this.formValuesChange.emit({ ...this.formValues });
  }

  updateMultiSelect(key: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const values = Array.from(select.selectedOptions).map(
      option => option.value
    );

    this.formValues[key] = values;
    this.formValuesChange.emit({ ...this.formValues });
  }


  toggleCheckbox(key: string, checked: boolean) {
    this.updateValue(key, checked);
  }
}

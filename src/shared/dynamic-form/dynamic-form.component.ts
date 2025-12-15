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

  // Schema coming from parent (Template Editor)
  @Input() schema!: { fields: any[] };
  @Input() formValues: any = {};
  @Output() formValuesChange = new EventEmitter<any>();


  onValueChange() {
    this.formValuesChange.emit(this.formValues);
  }
}

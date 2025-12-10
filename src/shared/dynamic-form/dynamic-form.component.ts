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

  @Input() schema: any = { fields: [] };
  @Input() value: any = {};

  @Output() valueChange = new EventEmitter<any>();

  openDateKey: string | null = null;

  onValueChange() {
    this.valueChange.emit(this.value);
  }

  openCalendar(key: string) {
    this.openDateKey = key;
  }

  closeCalendar() {
    this.openDateKey = null;
  }

  selectDate(key: string, event: any) {
    this.value[key] = event.target.value;
    this.closeCalendar();
    this.onValueChange();
  }
}

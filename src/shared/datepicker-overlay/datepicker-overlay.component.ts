import { Component, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-datepicker-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datepicker-overlay.component.html',
  styleUrls: ['./datepicker-overlay.component.scss']
})
export class DatepickerOverlayComponent implements AfterViewInit {
  @ViewChild('root') root!: ElementRef<HTMLElement>;
  @Output() pick = new EventEmitter<string>();
  value = '';

  ngAfterViewInit() {
    // append-to-body logic if needed:
    const el = this.root.nativeElement;
    document.body.appendChild(el);
  }

  choose() {
    this.pick.emit(this.value);
  }
}

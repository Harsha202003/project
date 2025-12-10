import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements AfterViewInit {
  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    if (this.content) {
      this.editor.nativeElement.innerHTML = this.content;
    }
  }

  /** FORMAT USING execCommand */
  exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    this.emitContent();
  }

  emitContent() {
    const value = this.editor.nativeElement.innerHTML;
    this.contentChange.emit(value);
  }

  clear() {
    this.editor.nativeElement.innerHTML = '';
    this.emitContent();
  }
}

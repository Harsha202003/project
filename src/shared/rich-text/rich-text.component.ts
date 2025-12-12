import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
})
export class RichTextComponent implements AfterViewInit {
  @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLDivElement>;

  @Input() content: string = '';
  @Output() contentChange = new EventEmitter<string>();

  showMoreMenu = false;
  showTableGrid = false;

  gridRows = Array(8).fill(0);
  gridCols = Array(8).fill(0);

  hoverRows = 0;
  hoverCols = 0;

  ngAfterViewInit() {
    this.editor.nativeElement.innerHTML = this.content;
  }

  emit() {
    this.contentChange.emit(this.editor.nativeElement.innerHTML);
  }

  onInput() {
    this.emit();
  }

  exec(cmd: string, value: any = null) {
    document.execCommand(cmd, false, value);
    this.emit();
  }

  clear() {
    this.editor.nativeElement.innerHTML = '';
    this.emit();
  }

  undo() {
    document.execCommand('undo');
    this.emit();
  }

  redo() {
    document.execCommand('redo');
    this.emit();
  }

  setSmall() {
    document.execCommand('fontSize', false, '2');
    this.emit();
  }

  setLarge() {
    document.execCommand('fontSize', false, '5');
    this.emit();
  }

  insertQuote() {
    document.execCommand('formatBlock', false, 'blockquote');
    this.emit();
  }

  insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.emit();
    }
  }

  // toggleMoreMenu() {
  //   this.showMoreMenu = !this.showMoreMenu;
  // }

  // clearFormatting() {
  //   document.execCommand('removeFormat', false);
  //   this.emit();
  // }

  // insertHorizontalRule() {
  //   document.execCommand('insertHorizontalRule');
  //   this.emit();
  // }

  // insertCodeBlock() {
  //   const pre = document.createElement('pre');
  //   pre.textContent = '/* code */';
  //   pre.style.background = '#f4f4f4';
  //   pre.style.padding = '10px';
  //   pre.style.borderRadius = '6px';
  //   this.insertNode(pre);
  // }

  // toggleTableGrid() {
  //   this.showTableGrid = !this.showTableGrid;
  // }

  // onHover(r: number, c: number) {
  //   this.hoverRows = r;
  //   this.hoverCols = c;
  // }

  // insertTable(rows: number, cols: number) {
  //   let html = `<table class="rt-table">`;
  //   for (let r = 0; r < rows; r++) {
  //     html += '<tr>';
  //     for (let c = 0; c < cols; c++) {
  //       html += `<td>&nbsp;</td>`;
  //     }
  //     html += '</tr>';
  //   }
  //   html += '</table><br/>';

  //   document.execCommand('insertHTML', false, html);
  //   this.showTableGrid = false;
  //   this.emit();
  // }
setColor(event: any) {
  const color = event.target.value;
  document.execCommand('foreColor', false, color);
  this.emit();
}

  insertNode(node: HTMLElement) {
    const sel = window.getSelection();
    if (!sel?.rangeCount) {
      this.editor.nativeElement.appendChild(node);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    this.emit();
  }
}

import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-rich-text',
  imports: [CommonModule],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements AfterViewInit {
  @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLDivElement>;

  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  showMoreMenu = false;
  showTablePrompt = false;
  tableRows = 2;
  tableCols = 2;

  ngAfterViewInit() {
    if (this.content) {
      this.editor.nativeElement.innerHTML = this.content;
    }
  }

  // Emit content when editor input changes
  onInput() {
    this.emitContent();
  }

  emitContent() {
    this.contentChange.emit(this.editor.nativeElement.innerHTML);
  }

  // Generic exec wrapper for common commands
  exec(cmd: string, value: any = null) {
    try {
      // Using execCommand for broad browser support (good enough for this editor)
      document.execCommand(cmd, false, value);
      this.emitContent();
    } catch (err) {
      console.warn('exec failed', cmd, err);
    }
  }

  // Toggle more menu
  toggleMoreMenu() {
    this.showMoreMenu = !this.showMoreMenu;
  }
  closeMore() {
    this.showMoreMenu = false;
  }

  // Clear all inline formatting from selection
  clearFormatting() {
    // removeFormat only clears basic inline style on selection
    document.execCommand('removeFormat', false, undefined);
    // also attempt to normalize block formatting:
    this.exec('formatBlock', '<p>');
    this.emitContent();
  }

  // Insert a code block (pre element)
  insertCodeBlock() {
    const pre = document.createElement('pre');
    pre.className = 'rt-code';
    pre.textContent = '/* code */';
    this.insertNodeAtCursor(pre);
    this.emitContent();
  }

  // Insert a horizontal rule
  insertHorizontalRule() {
    const hr = document.createElement('hr');
    this.insertNodeAtCursor(hr);
    this.emitContent();
  }

  // Insert table with given rows & cols
  insertTable(rows = 2, cols = 2) {
    rows = Math.max(1, Math.min(10, Math.floor(rows)));
    cols = Math.max(1, Math.min(10, Math.floor(cols)));

    const table = document.createElement('table');
    table.className = 'rt-table';
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    for (let r = 0; r < rows; r++) {
      const tr = table.insertRow();
      for (let c = 0; c < cols; c++) {
        const td = tr.insertCell();
        td.innerHTML = '&nbsp;';
        td.style.border = '1px solid #ddd';
        td.style.padding = '6px';
      }
    }

    this.insertNodeAtCursor(table);
    this.emitContent();
  }

  // opens small prompt (you can replace with grid UI if you want)
  openTablePrompt() {
    this.showTablePrompt = true;
    this.showMoreMenu = false;
  }
  closeTablePrompt() {
    this.showTablePrompt = false;
  }

  // undo/redo wrappers
  undo() {
    document.execCommand('undo');
    this.emitContent();
  }
  redo() {
    document.execCommand('redo');
    this.emitContent();
  }

  // Utility: insert an element/node at current cursor position
  insertNodeAtCursor(node: Node) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      // fallback: append to editor
      this.editor.nativeElement.appendChild(node);
      return;
    }

    const range = sel.getRangeAt(0);
    // Delete any selection content
    range.deleteContents();

    // Insert node
    range.insertNode(node);

    // Move caret after inserted node
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Basic keyboard handling (optional)
  onKeyUp(evt: KeyboardEvent) {
    // if user pressed Ctrl+Z/Ctrl+Y — we already have undo/redo bound in toolbar,
    // but keep a small handler to emit content after such keys so parent stays in sync.
    if ((evt.ctrlKey || evt.metaKey) && (evt.key === 'z' || evt.key === 'y')) {
      // small timeout to allow action to happen
      setTimeout(() => this.emitContent(), 50);
    }
  }
}

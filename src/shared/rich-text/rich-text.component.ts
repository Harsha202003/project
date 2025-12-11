import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface MentionUser {
  name: string;
  email?: string;
  avatar?: string;
}

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements AfterViewInit {
  @ViewChild('editor', { static: true }) editor!: ElementRef<HTMLDivElement>;
  @ViewChild('mentionBox', { static: true }) mentionBox!: ElementRef<HTMLDivElement>;

  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  // toolbar / menu
  showMoreMenu = false;

  // mention data (manual)
  users: MentionUser[] = [
    { name: 'Harsha Vardhan', email: 'harsha@company.com', avatar: 'https://i.pravatar.cc/40?img=15' },
    { name: 'Keerthana', email: 'keerthana@company.com', avatar: 'https://i.pravatar.cc/40?img=12' },
    { name: 'Govind', email: 'govind@company.com', avatar: 'https://i.pravatar.cc/40?img=14' }
  ];

  filteredUsers: MentionUser[] = [];
  mentionOpen = false;
  popupX = 0;
  popupY = 0;
  selectedIndex = 0;
  mentionQuery = '';

  ngAfterViewInit(): void {
    // set initial content
    if (this.content) this.editor.nativeElement.innerHTML = this.content;
  }

  // ---------- Toolbar actions ----------
  exec(cmd: string, value: any = null) {
    document.execCommand(cmd, false, value);
    this.emitContent();
  }

  insertCodeBlock() {
    const pre = document.createElement('pre');
    pre.className = 'code-block';
    pre.textContent = '/* code */';
    this.insertNodeAtCursor(pre);
    this.emitContent();
  }

  insertHorizontalRule() {
    const hr = document.createElement('hr');
    this.insertNodeAtCursor(hr);
    this.emitContent();
  }

  insertTable() {
    const table = document.createElement('table');
    table.className = 'rt-table';
    const tr = table.insertRow();
    tr.insertCell().textContent = 'col1';
    tr.insertCell().textContent = 'col2';
    this.insertNodeAtCursor(table);
    this.emitContent();
  }

  clear() {
    this.editor.nativeElement.innerHTML = '';
    this.emitContent();
  }

  toggleMoreMenu() {
    this.showMoreMenu = !this.showMoreMenu;
  }

  // helper to insert an element where the caret is
  insertNodeAtCursor(node: HTMLElement) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      this.editor.nativeElement.appendChild(node);
      return;
    }
    const range = sel.getRangeAt(0);
    range.collapse(false);
    range.insertNode(node);
    // put caret after node
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ---------- Editor events & content emit ----------
  onInput(_: Event) {
    this.emitContent();
    this.checkForMention();
  }

  emitContent() {
    this.content = this.editor.nativeElement.innerHTML;
    this.contentChange.emit(this.content);
  }

  // ---------- Mention logic ----------
  // Called on keyup as well to allow arrow/enter handling
  onKeyUp(ev: KeyboardEvent) {
    // navigation within popup
    if (this.mentionOpen) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredUsers.length - 1);
        this.scrollActiveIntoView();
        return;
      }
      if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.scrollActiveIntoView();
        return;
      }
      if (ev.key === 'Enter') {
        if (this.mentionOpen && this.filteredUsers.length) {
          ev.preventDefault();
          this.insertMention(this.filteredUsers[this.selectedIndex]);
        }
      }
      if (ev.key === 'Escape') {
        this.closeMention();
      }
    } else {
      // still check for mentions on normal keys
      this.checkForMention();
    }
  }

  checkForMention() {
    const caretText = this.getTextBeforeCursor();
    const match = /@([a-zA-Z0-9_]{0,50})$/.exec(caretText);
    if (!match) {
      this.closeMention();
      return;
    }

    const query = match[1];
    if (query === '') {
      // show all or hide — here we require at least 1 char
      this.closeMention();
      return;
    }

    this.mentionQuery = query.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(this.mentionQuery));
    if (this.filteredUsers.length === 0) {
      this.closeMention();
      return;
    }
    this.selectedIndex = 0;
    this.openMentionAtCaret();
  }

  openMentionAtCaret() {
    const rect = this.getCaretRect();
    if (!rect) { this.closeMention(); return; }
    // position slightly below caret
    this.popupX = rect.left + window.scrollX;
    this.popupY = rect.bottom + window.scrollY + 6;
    this.mentionOpen = true;
    // small delay to ensure element is rendered
    setTimeout(() => this.scrollActiveIntoView(), 0);
  }

  insertMention(user: MentionUser) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    // replace the '@abcd' token immediately preceding caret
    const range = sel.getRangeAt(0);
    // move range start backward to token start
    const tokenRange = this.getRangeForMentionToken(range);
    if (!tokenRange) return;

    tokenRange.deleteContents();

    // create mention chip
    const span = document.createElement('span');
    span.className = 'mention-chip';
    span.setAttribute('contenteditable', 'false');
    span.textContent = '@' + user.name;

    // add a trailing space and place caret after it
    const space = document.createTextNode('\u00A0');

    tokenRange.insertNode(space);
    tokenRange.insertNode(span);
    // move caret to after space
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    this.closeMention();
    this.emitContent();
  }

  // compute the Range of the '@token' right before current caret
  getRangeForMentionToken(currRange: Range): Range | null {
    try {
      // clone and walk backwards until we hit '@' or element boundary / space
      const r = currRange.cloneRange();
      const node = r.endContainer;
      let offset = r.endOffset;

      // if inside a text node, examine its text
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const upToCursor = text.slice(0, offset);
        const atIndex = upToCursor.lastIndexOf('@');
        if (atIndex !== -1) {
          const tokenRange = document.createRange();
          tokenRange.setStart(node, atIndex);
          tokenRange.setEnd(node, offset);
          return tokenRange;
        }
      }

      // fallback: walk previous sibling text nodes
      let walkerNode: Node | null = node;
      while (walkerNode) {
        // step to previous sibling or up to parent
        if (walkerNode.previousSibling) {
          walkerNode = walkerNode.previousSibling;
          if (walkerNode.nodeType === Node.TEXT_NODE) {
            const t = walkerNode.textContent || '';
            const atIndex = t.lastIndexOf('@');
            if (atIndex !== -1) {
              const tokenRange = document.createRange();
              tokenRange.setStart(walkerNode, atIndex);
              tokenRange.setEnd(currRange.endContainer, currRange.endOffset);
              return tokenRange;
            }
          }
        } else {
          walkerNode = walkerNode.parentNode;
          if (!walkerNode || walkerNode === this.editor.nativeElement) break;
        }
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  closeMention() {
    this.mentionOpen = false;
    this.filteredUsers = [];
    this.mentionQuery = '';
    this.selectedIndex = 0;
  }

  // helper to keep active suggestion visible
  scrollActiveIntoView() {
    const el = this.mentionBox?.nativeElement;
    if (!el) return;
    const active = el.querySelector('.item.active') as HTMLElement | null;
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  // get the caret rectangle (client coords)
  getCaretRect(): DOMRect | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rects = range.getClientRects();
    if (rects.length > 0) return rects[0];
    // fallback to editor bounding rect
    return this.editor.nativeElement.getBoundingClientRect();
  }

  // get plain text before cursor inside editor
  getTextBeforeCursor(): string {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return '';
    const r = sel.getRangeAt(0).cloneRange();
    r.collapse(true);
    r.setStart(this.editor.nativeElement, 0);
    return r.toString();
  }

  // global escape to close mention on outside clicks/esc
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const t = ev.target as HTMLElement;
    if (!this.mentionBox) return;
    if (this.mentionOpen && !this.mentionBox.nativeElement.contains(t) && !this.editor.nativeElement.contains(t)) {
      this.closeMention();
    }
  }
}

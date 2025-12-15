import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent
  implements OnChanges, AfterViewInit {

  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  private isInternalChange = false;
  private viewInitialized = false;

  // 🔹 RUNS AFTER DOM IS READY (THIS WAS MISSING)
  ngAfterViewInit() {
    this.viewInitialized = true;
    this.setEditorContent(this.content);
  }

  // 🔹 RUNS WHEN INPUT CHANGES (API / ROUTE CHANGE)
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['content'] &&
      this.viewInitialized &&
      !this.isInternalChange
    ) {
      this.setEditorContent(changes['content'].currentValue);
    }
  }

  // 🔹 SINGLE SAFE DOM WRITE METHOD
  private setEditorContent(html: string) {
    const value = html || '';

    if (this.editor.nativeElement.innerHTML !== value) {
      this.editor.nativeElement.innerHTML = value;
    }
  }

  // =============================
  // USER INPUT
  // =============================
  onInput() {
    this.isInternalChange = true;

    const html = this.editor.nativeElement.innerHTML;
    this.contentChange.emit(html);

    this.isInternalChange = false;
  }

  // =============================
  // MENTION SYSTEM
  // =============================
  allUsers = [
    'nithish', 'nikitha', 'keerthana',
    'govind', 'ajay', 'mahi',
    'nuthan', 'panidhar'
  ];

  filteredUsers: string[] = [];
  showMention = false;
  typed = '';
  mentionX = 0;
  mentionY = 0;
  activeIndex = 0;

  onKeyUp(event: KeyboardEvent) {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;

    const text = sel.anchorNode.textContent || '';
    const match = text.match(/@([a-zA-Z0-9]*)$/);

    if (match) {
      this.typed = match[1];
      this.filteredUsers = this.allUsers.filter(u =>
        u.toLowerCase().startsWith(this.typed.toLowerCase())
      );
      this.showMention = this.filteredUsers.length > 0;
      if (this.showMention) this.positionMentionDropdown();
    } else {
      this.showMention = false;
    }

    if (event.key === 'Enter' && this.showMention) {
      event.preventDefault();
      this.selectMention(this.filteredUsers[this.activeIndex]);
    }
  }

  positionMentionDropdown() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    this.mentionX = rect.left;
    this.mentionY = rect.bottom + window.scrollY + 8;
  }

  selectMention(name: string) {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;

    const node = sel.anchorNode;
    node.textContent = (node.textContent || '')
      .replace(/@([a-zA-Z0-9]*)$/, `@${name} `);

    this.showMention = false;
    this.onInput();
  }

  // =============================
  // TOOLBAR
  // =============================
  exec(cmd: string) {
    document.execCommand(cmd, false);
    this.onInput();
  }

  setSmall() {
    document.execCommand('fontSize', false, '2');
    this.onInput();
  }

  setLarge() {
    document.execCommand('fontSize', false, '5');
    this.onInput();
  }

  insertLink() {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
    this.onInput();
  }

  setColor(event: any) {
    document.execCommand('foreColor', false, event.target.value);
    this.onInput();
  }

  undo() {
    document.execCommand('undo');
    this.onInput();
  }

  redo() {
    document.execCommand('redo');
    this.onInput();
  }

  clear() {
    this.setEditorContent('');
    this.onInput();
  }

  // =============================
  // CLOSE DROPDOWN
  // =============================
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    if (!this.editor.nativeElement.contains(event.target as HTMLElement)) {
      this.showMention = false;
    }
  }
}
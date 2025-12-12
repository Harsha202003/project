import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent {

  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  // -----------------------------
  // MENTION SYSTEM
  // -----------------------------
  allUsers = ["nithish", "nikitha", "keerthana", "govind", "ajay"];
  filteredUsers: string[] = [];

  showMention = false;
  typed = "";
  mentionX = 0;
  mentionY = 0;
  activeIndex = 0;

  // -----------------------------
  // BASE EDITOR INPUT
  // -----------------------------
  onInput() {
    this.content = this.editor.nativeElement.innerHTML;
    this.contentChange.emit(this.content);
  }

  // -----------------------------
  // KEY LISTENING FOR @
  // -----------------------------
  onKeyUp(event: KeyboardEvent) {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;

    const text = sel.anchorNode.textContent || "";

    // Detect @mentions
    const match = text.match(/@([a-zA-Z0-9]*)$/);

    if (match) {
      this.typed = match[1];

      // Filter list
      this.filteredUsers = this.allUsers.filter(u =>
        u.toLowerCase().startsWith(this.typed.toLowerCase())
      );

      if (this.filteredUsers.length > 0) {
        this.showMention = true;
        this.positionMentionDropdown();
      } else {
        this.showMention = false;
      }
    } else {
      this.showMention = false;
    }

    // ENTER → Choose active mention
    if (event.key === "Enter" && this.showMention) {
      event.preventDefault();
      this.selectMention(this.filteredUsers[this.activeIndex]);
    }
  }

  // -----------------------------
  // POSITION DROPDOWN
  // -----------------------------
  positionMentionDropdown() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rect = range.getBoundingClientRect();

    if (rect) {
      this.mentionX = rect.left;
      this.mentionY = rect.bottom + window.scrollY + 8;
    }
  }

  // -----------------------------
  // INSERT MENTION
  // -----------------------------
  selectMention(name: string) {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;

    const node = sel.anchorNode;
    const text = node.textContent || "";

    // Replace @typed with @name
    node.textContent = text.replace(/@([a-zA-Z0-9]*)$/, `@${name} `);

    this.showMention = false;

    this.content = this.editor.nativeElement.innerHTML;
    this.contentChange.emit(this.content);
  }

  // -----------------------------
  // TOOLBAR COMMANDS
  // -----------------------------
  exec(cmd: string) {
    document.execCommand(cmd, false);
    this.onInput();
  }

  setSmall() {
    document.execCommand("fontSize", false, "2");
    this.onInput();
  }

  setLarge() {
    document.execCommand("fontSize", false, "5");
    this.onInput();
  }

  insertLink() {
    const url = prompt("Enter URL:");
    if (url) document.execCommand("createLink", false, url);
    this.onInput();
  }

  setColor(event: any) {
    document.execCommand("foreColor", false, event.target.value);
    this.onInput();
  }

  undo() {
    document.execCommand("undo");
    this.onInput();
  }

  redo() {
    document.execCommand("redo");
    this.onInput();
  }

  clear() {
    this.editor.nativeElement.innerHTML = "";
    this.onInput();
  }

  // -----------------------------
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // -----------------------------
  @HostListener("document:click", ["$event"])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!this.editor.nativeElement.contains(target)) {
      this.showMention = false;
    }
  }
}

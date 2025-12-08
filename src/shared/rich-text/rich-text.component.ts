// src/app/shared/rich-text/rich-text.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
// we'll integrate mention manually using quill-mention if available; fallback to simple list
// if you want quill-mention add the package and import it.

@Component({
  selector: 'app-rich-text',
  standalone: true,
  template: `<div #editor style="min-height:220px; background:white;"></div>`,
  styles: [``]
})
export class RichText implements AfterViewInit {
  @ViewChild('editor') editorEl!: ElementRef<HTMLDivElement>;
  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  quill!: Quill;

  ngAfterViewInit(): void {
    const modules: any = {
      toolbar: [['bold', 'italic'], [{ color: [] }], ['link', 'image']],
      // mention plugin may be added if installed
    };

    this.quill = new Quill(this.editorEl.nativeElement, { theme: 'snow', modules });
    this.quill.root.innerHTML = this.content || '';
    this.quill.on('text-change', () => this.contentChange.emit(this.quill.root.innerHTML));
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent {

  // Template object coming from Editor (already populated from API)
  @Input() template!: {
    name: string;
    body: string;
    schema?: { fields: any[] };
    formValues?: Record<string, any>;
    attachments?: string[];
  };

  /**
   * Extracts readable file name from URL
   */
  getFileName(url: string): string {
    try {
      return decodeURIComponent(url.split('/').pop() || url);
    } catch {
      return url;
    }
  }
}

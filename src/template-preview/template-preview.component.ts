import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TemplateService, TemplateModel } from '../services/template.service';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent implements OnInit {

  template!: TemplateModel;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ts: TemplateService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    console.log('🔥 PREVIEW ID:', id);

    if (!id) {
      console.error('❌ ID not found in route');
      this.loading = false;
      return;
    }

    this.ts.getOne(id).subscribe({
      next: data => {
        console.log('✅ PREVIEW DATA:', data);
        this.template = data;
        this.loading = false;
      },
      error: err => {
        console.error('❌ API ERROR', err);
        this.loading = false;
      }
    });
  }

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

// src/app/template-preview/template-preview.component.ts
import { Component, OnInit } from '@angular/core';
import { TemplateService } from '../services/template.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  template: `<div><h3>Preview</h3><div [innerHTML]="html"></div></div>`
})
export class TemplatePreview implements OnInit {
  html: SafeHtml = '';
  constructor(private route: ActivatedRoute, private ts: TemplateService, private s: DomSanitizer) { }
  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.ts.get(id).subscribe(t => {
      const rendered = this.renderHtml(t.body || '', t.schema);
      this.html = this.s.bypassSecurityTrustHtml(rendered);
    });
  }
  renderHtml(body: string, schema: any) {
    let out = body || '';
    (schema?.fields || []).forEach((f: any) => out = out.replace(new RegExp(`{{\\s*${f.key}\\s*}}`, 'g'), f.sample ?? f.default ?? `Sample ${f.label || f.key}`));
    return out;
  }
}

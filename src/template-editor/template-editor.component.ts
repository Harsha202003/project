import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TemplateService, TemplateModel } from '../services/template.service';
import { Subject, debounceTime, switchMap, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { RichText } from '../shared/rich-text/rich-text.component';
import { DynamicForm } from '../shared/dynamic-form/dynamic-form.component';
import { FileUpload } from '../shared/file-upload/file-upload.component';


@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [RichText, DynamicForm, FileUpload],
  template: `
  <div *ngIf="loading">Loading…</div>
  <div *ngIf="!loading">
    <h2>{{ template?.name }}</h2>

    <div class="editor-grid">
      <div class="left">
        <rich-text
          [content]="editorContent"
          (contentChange)="onEditorChange($event)">
        </rich-text>
      </div>

      <aside class="right">
        <dynamic-form
          [schema]="template?.schema"
          [value]="formValues"
          (valueChange)="onFormValues($event)">
        </dynamic-form>

        <file-upload (uploaded)="onUploaded($event)"></file-upload>

        <div style="margin-top:1rem">
          <button (click)="publish()">Publish</button>
        </div>
      </aside>
    </div>

    <div style="margin-top:1rem">
      <button (click)="openPreview()">Preview</button>
    </div>
  </div>
  `,
  styles: [
    `.editor-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1rem; }`
  ]
})
export class TemplateEditor implements OnInit, OnDestroy {

  templateId!: number;
  template!: TemplateModel;
  loading = true;
  editorContent = '';
  formValues: any = {};

  private destroy$ = new Subject<void>();
  private autosave$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private ts: TemplateService,
    private fb: FormBuilder
  ) {
    this.autosave$
      .pipe(
        debounceTime(1500),
        switchMap(() => this.ts.update(this.templateId, this.snapshot())),
        takeUntil(this.destroy$)
      ).subscribe();
  }

  ngOnInit(): void {
    this.templateId = +this.route.snapshot.paramMap.get('id')!;
    this.ts.get(this.templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => {
        this.template = t;
        this.editorContent = t.body || '';
        this.formValues = this.schemaValuesMap(t.schema, {});
        this.loading = false;
      });
  }

  snapshot() {
    return {
      name: this.template.name,
      body: this.template.body,
      schema: this.template.schema
    };
  }

  onEditorChange(html: string) {
    this.template.body = html;
    this.autosave$.next();
  }

  onFormValues(v: any) {
    this.formValues = v;
    this.autosave$.next();
  }

  onUploaded(url: string) {
    console.log('Uploaded URL:', url);
  }

  publish() {
    this.ts.update(this.templateId, { ...this.snapshot(), published: true })
      .subscribe(() => alert('Published!'));
  }

  openPreview() {
    window.open(`/templates/${this.templateId}/preview`, '_blank');
  }

  schemaValuesMap(schema: any, existing: any) {
    const out: any = {};
    (schema?.fields || []).forEach((f: any) => {
      out[f.key] = existing[f.key] ?? f.default ?? '';
    });
    return out;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

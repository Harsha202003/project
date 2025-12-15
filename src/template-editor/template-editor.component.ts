import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TemplateService, TemplateModel } from '../services/template.service';
import { RichTextComponent } from '../shared/rich-text/rich-text.component';
import { DynamicFormComponent } from '../shared/dynamic-form/dynamic-form.component';
import { FileUploadComponent } from '../shared/file-upload/file-upload.component';
import { SchemaBuilderComponent } from '../shared/schema-builder/schema-builder.component';
import { TemplatePreviewComponent } from '../template-preview/template-preview.component';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RichTextComponent,
    DynamicFormComponent,
    FileUploadComponent,
    SchemaBuilderComponent,
    TemplatePreviewComponent
  ]
})
export class TemplateEditorComponent implements OnInit {

  template!: TemplateModel;

  editorContent = '';
  formValues: any = {};
  showPreview = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ts: TemplateService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.ts.getOne(id).subscribe(template => {
      this.template = template;

      // 🔥 CRITICAL: load body into editor
      this.editorContent = template.body || '';

      // IMPORTANT: DO NOT recreate formValues
      this.template.formValues = template.formValues || {};

      // Ensure schema exists
      this.template.schema ||= { fields: [] };

      // Ensure attachments
      this.template.attachments ||= [];
    });
  }


  /* ================= HEADER ================= */

  goBack(): void {
    window.history.back();
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  /* ================= EDITOR ================= */

  onEditorChange(html: string): void {
    this.editorContent = html;
    this.template.body = html;
  }

  /* ================= FORM ================= */

  onFormValuesChange(values: any): void {
    this.formValues = values;
    this.template.formValues = values;
  }

  /* ================= SCHEMA ================= */

  onSchemaChange(fields: any[]): void {
    this.template.schema.fields = [...fields];
    this.cleanFormValues();
  }

  private cleanFormValues(): void {
    const allowedKeys = this.template.schema.fields.map(f => f.key);

    Object.keys(this.formValues).forEach(key => {
      if (!allowedKeys.includes(key)) {
        delete this.formValues[key];
      }
    });

    this.template.formValues = this.formValues;
  }

  /* ================= ATTACHMENTS ================= */

  onUploaded(url: string): void {
    this.template.attachments.push(url);

    this.ts.updateTemplate(this.template.id, {
      attachments: this.template.attachments
    }).subscribe();
  }

  removeAttachment(url: string): void {
    this.template.attachments =
      this.template.attachments.filter((a: string) => a !== url);

    this.ts.updateTemplate(this.template.id, {
      attachments: this.template.attachments
    }).subscribe();
  }

  /* ================= SAVE ================= */

  publish(): void {
    this.cleanFormValues();

    const updated: TemplateModel = {
      ...this.template,
      body: this.editorContent,
      formValues: this.formValues,
      attachments: this.template.attachments
    };

    this.ts.updateTemplate(this.template.id, updated).subscribe(() => {
      alert('Template updated successfully!');
    });
  }
}

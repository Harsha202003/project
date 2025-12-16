import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TemplateService, TemplateModel } from '../services/template.service';
import { ValidationService } from '../services/validation.service';

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

  editingName = false;
  tempName = '';

  startRename(): void {
    this.tempName = this.template.name; // backup
    this.editingName = true;
  }

  cancelRename(): void {
    this.editingName = false;
    this.tempName = '';
  }

  saveRename(): void {
    if (!this.tempName.trim()) return;

    this.template.name = this.tempName.trim();
    this.editingName = false;

    // Optional: persist immediately
    this.ts.updateTemplate(this.template.id, {
      name: this.template.name
    }).subscribe();
  }



  // ✅ VALIDATION STATE
  errors: Record<string, string> = {};

  showPreview = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ts: TemplateService,
    private validation: ValidationService   // ✅ injected correctly
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.ts.getOne(id).subscribe(template => {
      this.template = template;

      // Load body into editor
      this.editorContent = template.body || '';

      // Preserve saved form values
      this.formValues = { ...(template.formValues || {}) };
      this.template.formValues = this.formValues;

      // Ensure schema & attachments exist
      this.template.schema ||= { fields: [] };
      this.template.attachments ||= [];

      this.template.schema.fields.forEach(field => {
        if (field.type === 'multiselect') {
          this.formValues[field.key] ??= [];
        }
      });


      // ✅ INITIAL VALIDATION (important for edit mode)
      this.errors = this.validation.validate(
        this.template.schema.fields,
        this.formValues
      );

      this.loading = false;
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

    // 🔥 REVALIDATE ON EVERY CHANGE
    this.errors = this.validation.validate(
      this.template.schema.fields,
      this.formValues
    );
  }

  /* ================= SCHEMA ================= */

  onSchemaChange(fields: any[]): void {
    this.template.schema.fields = [...fields];
    this.cleanFormValues();

    // Re-validate after schema change
    this.errors = this.validation.validate(
      this.template.schema.fields,
      this.formValues
    );
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
    // 🔒 FINAL VALIDATION CHECK
    this.errors = this.validation.validate(
      this.template.schema.fields,
      this.formValues
    );

    if (Object.keys(this.errors).length > 0) {
      alert('Please fix validation errors before publishing.');
      return;
    }

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

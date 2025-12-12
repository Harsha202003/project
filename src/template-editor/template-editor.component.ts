import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TemplateService, TemplateModel } from '../services/template.service';
import { FileUploadComponent } from '../shared/file-upload/file-upload.component';
import { SchemaBuilderComponent } from '../shared/schema-builder/schema-builder.component';
import { DynamicFormComponent } from "../shared/dynamic-form/dynamic-form.component";
import { RichTextComponent } from '../shared/rich-text/rich-text.component';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RichTextComponent,
    FileUploadComponent,
    SchemaBuilderComponent,
    DynamicFormComponent
  ],
})
export class TemplateEditorComponent implements OnInit {

  template!: TemplateModel;
  editorContent = '';
  formValues: any = {};
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ts: TemplateService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;

    this.ts.getOne(id).subscribe(t => {
      this.template = t;

      // Load body
      this.editorContent = t.body || '';

      // Load form values
      this.formValues = { ...t.formValues };

      // Ensure required structure exists
      this.template.schema ||= { fields: [] };
      this.template.attachments ||= [];

      // Clean old formValues based on current fields
      this.cleanFormValues();

      this.loading = false;
    });
  }

  // When editor updates text
  onEditorChange(html: string) {
    this.editorContent = html;
    this.template.body = html;
  }

  // Save template
  publish() {
    // Clean form values BEFORE saving
    this.cleanFormValues();

    const updated = {
      ...this.template,
      body: this.editorContent,
      formValues: this.formValues,
      attachments: this.template.attachments
    };

    this.ts.updateTemplate(this.template.id, updated).subscribe(() => {
      alert("Template updated successfully!");
    });
  }

  // Open preview
  preview() {
    this.router.navigate(
      ['/templates', this.template.id, 'preview'],
      { state: { template: this.template } }
    );
  }

  // File upload
  onUploaded(url: string) {
    this.template.attachments.push(url);

    this.ts.updateTemplate(this.template.id, {
      attachments: this.template.attachments
    }).subscribe();
  }

  // Remove file
  removeAttachment(url: string) {
    this.template.attachments = this.template.attachments.filter((a: string) => a !== url);

    this.ts.updateTemplate(this.template.id, {
      attachments: this.template.attachments
    }).subscribe();
  }

  // Called when schema builder updates fields
  onSchemaChange(fields: any[]) {
    this.template.schema.fields = [...fields];

    // Remove values of deleted fields
    this.cleanFormValues();
  }

  // IMPORTANT — removes old values that no longer exist in schema
  cleanFormValues() {
    if (!this.template?.schema?.fields) return;

    const allowedKeys = this.template.schema.fields.map(f => f.key);

    Object.keys(this.formValues).forEach(key => {
      if (!allowedKeys.includes(key)) {
        delete this.formValues[key];
      }
    });
  }
}

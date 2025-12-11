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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ts: TemplateService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;

    this.ts.getOne(id).subscribe(t => {
      this.template = t;
      this.editorContent = t.body || '';
      this.formValues = t.formValues || {};
    });
  }

  // Rich text content update
  onEditorChange(html: string) {
    this.editorContent = html;
    this.template.body = html;
  }

  // Save Template to JSON
  publish() {
    this.ts.updateTemplate(this.template.id, {
      ...this.template,
      body: this.editorContent,
      formValues: this.formValues
    }).subscribe(() => {
      alert("Template Saved Successfully!");
    });
  }

  // Open Preview Page
  preview() {
    this.router.navigate(
      ['/templates', this.template.id, 'preview'],
      { state: { template: this.template } }
    );
  }

  // File Upload Handler (FINAL CORRECT VERSION)
  onUploaded(url: string) {
    if (!this.template.attachments) {
      this.template.attachments = [];
    }

    this.template.attachments.push(url);

    // Save instantly to JSON
    this.ts.updateTemplate(this.template.id, {
      attachments: this.template.attachments
    }).subscribe(() => {
      console.log("Attachment saved to JSON:", url);
    });
  }

  // Schema Update
  onSchemaChange(fields: any[]) {
    this.template.schema.fields = fields;
  }

}

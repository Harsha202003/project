import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../shared/dynamic-form/dynamic-form.component';
import { TemplateModel } from '../services/template.service';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent {
  @Input() template!: TemplateModel;
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateService, TemplateModel } from '../services/template.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit, OnDestroy {

  templates: TemplateModel[] = [];

  newTemplateName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private ts: TemplateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ts.list$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => (this.templates = list));

    this.ts.loadList().subscribe();
  }

  // CREATE TEMPLATE
  createNewTemplate() {
    if (!this.newTemplateName.trim()) {
      alert("Please enter a template name.");
      return;
    }

    const payload = {
      name: this.newTemplateName,
      body: "",
      schema: { fields: [] }
    };

    this.ts.create(payload).subscribe((t) => {
      this.newTemplateName = "";
      this.router.navigate(['/templates', t.id, 'edit']);
    });
  }

  // Clear input
  cancelCreate() {
    this.newTemplateName = "";
  }

  // Open editor
  open(t: TemplateModel) {
    this.router.navigate(['/templates', t.id, 'edit']);
  }

  // Delete template
  delete(t: TemplateModel) {
    if (confirm(`Delete template "${t.name}"?`)) {
      this.ts.delete(t.id!).subscribe();
    }
  }


  // Cleanup
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

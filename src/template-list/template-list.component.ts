import { Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateService, TemplateModel } from '../services/template.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateList implements OnInit, OnDestroy {
  templates: TemplateModel[] = [];
  editingId: number | null = null;
  editingName = '';

  private destroy$ = new Subject<void>();

  constructor(private ts: TemplateService, private router: Router) { }

  ngOnInit() {
    this.ts.list$.pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.templates = list;
    });

    this.ts.loadList().subscribe();
  }

  creating = false;
  newTemplateName = '';
  newTemplateContent = '';

  createNewTemplate() {
    if (this.newTemplateName.trim()) {
      this.ts.create({ name: this.newTemplateName, body: '', schema: { fields: [] } })
        .subscribe(newT => {
          console.log("Created:", newT);
          this.router.navigate(['/templates', newT.id, 'edit']);
        });
      this.creating = false;
      this.newTemplateName = '';
      this.newTemplateContent = '';
    }
  }

  cancelCreate() {
    this.creating = false;
    this.newTemplateName = '';
    this.newTemplateContent = '';
  }


  rename(t: TemplateModel) {
    this.editingId = t.id!;
    this.editingName = t.name;
  }

  saveRename(t: TemplateModel) {
    this.ts.update(t.id!, { name: this.editingName })
      .subscribe(() => (this.editingId = null));
  }

  delete(t: TemplateModel) {
    if (confirm('Delete template?')) {
      this.ts.delete(t.id!).subscribe();
    }
  }

  open(t: TemplateModel) {
    this.router.navigate(['/templates', t.id, 'edit']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

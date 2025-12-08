// src/app/shared/dynamic-form/dynamic-form.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../services/template.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <form [formGroup]="fg" (ngSubmit)="onSubmit()">
    <ng-container *ngFor="let f of schema?.fields">
      <div class="field">
        <label>{{f.label}}</label>

        <input *ngIf="f.type==='text'" [formControlName]="f.key" />

        <textarea *ngIf="f.type==='textarea'" [formControlName]="f.key"></textarea>

        <select *ngIf="f.type==='select'" [formControlName]="f.key">
          <option *ngFor="let o of f.optionsLoaded" [value]="o.id">{{o.label}}</option>
        </select>

        <select multiple *ngIf="f.type==='multiselect'" [formControlName]="f.key">
          <option *ngFor="let o of f.optionsLoaded" [value]="o.id">{{o.label}}</option>
        </select>

        <input *ngIf="f.type==='date'" type="date" [formControlName]="f.key" />

        <input *ngIf="f.type==='checkbox'" type="checkbox" [formControlName]="f.key" />

        <div class="error" *ngIf="fg.get(f.key)?.invalid && fg.get(f.key)?.touched">
          <small *ngIf="fg.get(f.key)?.errors?.required">Required</small>
          <small *ngIf="fg.get(f.key)?.errors?.minDate">Too early</small>
        </div>
      </div>
    </ng-container>
  </form>
  `,
  styles: ['.field{margin-bottom:1rem}']
})
export class DynamicForm implements OnChanges {
  @Input() schema: any;
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();
  fg = new FormGroup({});
  private search$ = new Subject<{ field: any, q: string }>();

  constructor(private ts: TemplateService) {
    this.search$.pipe(
      debounceTime(300),
      switchMap(({ field, q }) => this.ts.getOptions(field.optionsEndpoint || field.key, q))
    ).subscribe((opts: any[]) => {
      // dynamic assign; callers must set schema reference so UI updates
      this.schema.fields.forEach((f: any) => { if (f.optionsEndpoint) f.optionsLoaded = f.optionsLoaded || []; });
      // assume last requested field
      const last = this.schema._lastSearchField;
      if (last) last.optionsLoaded = opts;
    });
  }

  ngOnChanges(): void {
    this.build();
  }

  build() {
    const g: any = {};
    (this.schema?.fields || []).forEach((f: any) => {
      const validators = [];
      if (f.required) validators.push(Validators.required);
      if (f.type === 'date' && f.min) validators.push((control: { value: string | number | Date; }) => control.value && new Date(control.value) < new Date(f.min) ? { minDate: true } : null);
      g[f.key] = new FormControl(this.value?.[f.key] ?? f.default ?? (f.type === 'checkbox' ? false : ''), validators);
    });
    this.fg = new FormGroup(g);
    this.fg.valueChanges.pipe(debounceTime(300)).subscribe(v => this.valueChange.emit(v));
  }

  search(field: any, q: string) {
    this.schema._lastSearchField = field;
    this.search$.next({ field, q });
  }

  onSubmit() { /* not used */ }
}



// src/app/shared/file-upload/file-upload.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { TemplateService } from '../../services/template.service';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    template: `
    <div class="upload">
      <input type="file" (change)="onFile($event)" />
      <div *ngIf="uploading">
        <progress [value]="progress" max="100"></progress> {{progress | number:'1.0-0'}}%
      </div>
      <div *ngIf="url">Uploaded: <a [href]="url" target="_blank">{{url}}</a></div>
    </div>
  `,
    styles: ['.upload{display:flex;flex-direction:column;gap:.5rem}']
})
export class FileUpload {
    @Output() uploaded = new EventEmitter<string>();
    uploading = false;
    progress = 0;
    url: string | null = null;

    constructor(private ts: TemplateService) { }

    onFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const fd = new FormData(); fd.append('file', file);
        this.uploading = true; this.progress = 0;
        const interval = setInterval(() => { this.progress = Math.min(95, this.progress + Math.random() * 20); }, 200);
        this.ts.upload(fd).subscribe(res => {
            clearInterval(interval);
            this.progress = 100; this.uploading = false; this.url = res.url;
            this.uploaded.emit(this.url);
        }, () => { clearInterval(interval); this.uploading = false; });
    }
}

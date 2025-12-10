import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  @Output() uploaded = new EventEmitter<string>(); // emits file URL or file name

  progress = 0;
  uploading = false;
  filename = '';

  /**
   * Triggered when the user selects a file
   */
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.filename = file.name;
    this.simulateUpload();  // fake upload animation
  }

  /**
   * Simulated upload progress animation
   */
  simulateUpload() {
    this.uploading = true;
    this.progress = 0;

    const interval = setInterval(() => {
      this.progress += Math.random() * 18;  // random speed

      if (this.progress >= 100) {
        clearInterval(interval);

        this.progress = 100;
        this.uploading = false;

        // Simulated file URL (replace later with real upload API)
        const fileUrl = `https://storage.example.com/${encodeURIComponent(this.filename)}`;

        // Emit the final uploaded file URL or filename
        this.uploaded.emit(fileUrl);
      }
    }, 180);
  }
}

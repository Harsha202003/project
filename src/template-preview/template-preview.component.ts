import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../services/template.service';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent implements OnInit {

  @Input() template: any;          // used in EDIT preview
  @Input() showBackButton = false; // 🔥 control button visibility

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ts: TemplateService
  ) { }

  ngOnInit(): void {
    // 🔥 ONLY load from API when used as ROUTE preview
    if (!this.template) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.ts.getOne(id).subscribe(data => this.template = data);
        this.showBackButton = true; // route preview
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }

  getFileName(url: string): string {
    return decodeURIComponent(url.split('/').pop() || url);
  }
}

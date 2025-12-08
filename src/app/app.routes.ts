import { Routes } from '@angular/router';
import { TemplateList } from '../template-list/template-list.component';
import { TemplateEditor } from '../template-editor/template-editor.component';
import { TemplatePreview } from '../template-preview/template-preview.component';

export const routes: Routes = [
    { path: '', redirectTo: 'templates', pathMatch: 'full' },

    { path: 'templates', component: TemplateList },
    { path: 'templates/:id/edit', component: TemplateEditor },
    { path: 'templates/:id/preview', component: TemplatePreview },

    { path: '**', redirectTo: 'templates' }
];

import { Routes } from '@angular/router';
import { TemplateListComponent } from '../template-list/template-list.component';
import { TemplateEditorComponent } from '../template-editor/template-editor.component';
import { TemplatePreviewComponent } from '../template-preview/template-preview.component';

export const routes: Routes = [
    { path: '', redirectTo: 'templates', pathMatch: 'full' },

    { path: 'templates', component: TemplateListComponent },
    {
        path: 'templates/new/edit',
        loadComponent: () => TemplateEditorComponent
    },
    {
        path: 'templates/:id/edit',
        loadComponent: () => TemplateEditorComponent
    },
    {
        path: 'templates/:id/preview',
        component: TemplatePreviewComponent
    },

    { path: '**', redirectTo: 'templates' }
];

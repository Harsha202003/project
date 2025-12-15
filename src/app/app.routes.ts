import { Routes } from '@angular/router';
import { TemplateListComponent } from '../template-list/template-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'templates', pathMatch: 'full' },

    {
        path: 'templates',
        component: TemplateListComponent
    },

    {
        path: 'templates/new/edit',
        loadComponent: () =>
            import('../template-editor/template-editor.component')
                .then(m => m.TemplateEditorComponent)
    },

    {
        path: 'templates/:id/edit',
        loadComponent: () =>
            import('../template-editor/template-editor.component')
                .then(m => m.TemplateEditorComponent)
    },

    {
        path: 'templates/:id/preview',
        loadComponent: () =>
            import('../template-preview/template-preview.component')
                .then(m => m.TemplatePreviewComponent)
    },

    { path: '**', redirectTo: 'templates' }
];

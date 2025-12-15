import { Routes } from '@angular/router';
import { TemplateListComponent } from '../template-list/template-list.component';
import { TemplatePreviewComponent } from '../template-preview/template-preview.component';

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

    // ✅ PREVIEW ROUTE (READ-ONLY PAGE)
    {
        path: 'templates/:id/preview',
        component: TemplatePreviewComponent
    },

    { path: '**', redirectTo: 'templates' }
];

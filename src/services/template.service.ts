import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TemplateModel {
    id: string;                // FIXED: JSON server uses string IDs
    name: string;
    body: string;
    schema: { fields: any[] };
    formValues?: any;
    attachments?: any;
    published?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TemplateService {

    private base = 'http://localhost:3000';

    private _list$ = new BehaviorSubject<TemplateModel[]>([]);
    list$ = this._list$.asObservable();

    constructor(private http: HttpClient) { }

    /** GET ALL */
    loadList(): Observable<TemplateModel[]> {
        return this.http
            .get<TemplateModel[]>(`${this.base}/templates`)
            .pipe(tap(list => this._list$.next(list)));
    }

    /** GET ONE TEMPLATE */
    getOne(id: string): Observable<TemplateModel> {
        return this.http.get<TemplateModel>(`${this.base}/templates/${id}`);
    }

    /** CREATE TEMPLATE */
    create(template: Partial<TemplateModel>) {
        return this.http.post<TemplateModel>(`${this.base}/templates`, template);
    }

    /** UPDATE TEMPLATE */
    updateTemplate(id: string, data: any) {
        return this.http.patch(`${this.base}/templates/${id}`, data);
    }

    /** DELETE TEMPLATE */
    delete(id: string) {
        // 1. Update UI instantly
        const updated = this._list$.value.filter(t => t.id !== id);
        this._list$.next(updated);

        // 2. Send DELETE request to JSON server
        return this.http.delete(`${this.base}/templates/${id}`);
    }


    /** FILE UPLOAD */
    upload(formData: FormData) {
        return this.http.post<{ url: string }>(`${this.base}/upload`, formData);
    }
}

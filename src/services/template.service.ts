import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TemplateModel {
    id?: number;
    name: string;
    body: string;
    schema: any;
    published?: boolean;
    updatedAt?: number;
}

@Injectable({ providedIn: 'root' })
export class TemplateService {
    private base = 'http://localhost:3333';
    private _list$ = new BehaviorSubject<TemplateModel[]>([]);
    list$ = this._list$.asObservable();

    constructor(private http: HttpClient) { }

    loadList(): Observable<TemplateModel[]> {
        return this.http
            .get<TemplateModel[]>(`${this.base}/templates`)
            .pipe(tap(list => this._list$.next(list)));
    }

    create(template: Partial<TemplateModel>) {
        const body = {
            name: template.name || "Untitled",
            body: template.body || "",
            schema: template.schema || { fields: [] }
        };

        return this.http.post<TemplateModel>(`${this.base}/templates`, body)
            .pipe(tap(() => this.loadList().subscribe()));
    }

    get(id: number) {
        return this.http.get<TemplateModel>(`${this.base}/templates/${id}`);
    }

    update(id: number, template: Partial<TemplateModel>) {
        return this.http
            .put<TemplateModel>(`${this.base}/templates/${id}`, template)
            .pipe(tap(() => this.loadList().subscribe()));
    }

    delete(id: number) {
        return this.http
            .delete(`${this.base}/templates/${id}`)
            .pipe(tap(() => this.loadList().subscribe()));
    }

    getOptions(name: string, q: string = '') {
        const params = new HttpParams().set('q', q);
        return this.http.get<any[]>(`${this.base}/options/${name}`, { params });
    }

    upload(formData: FormData) {
        return this.http.post<{ url: string }>(`${this.base}/upload`, formData);
    }
}

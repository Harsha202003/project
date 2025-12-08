// src/app/services/template.service.spec.ts (Jest or Karma)
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
    let service: TemplateService; let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [TemplateService] });
        service = TestBed.inject(TemplateService);
        http = TestBed.inject(HttpTestingController);
    });
    it('loadList calls GET /templates', done => {
        service.loadList().subscribe(list => { expect(list).toBeDefined(); done(); });
        const req = http.expectOne('http://localhost:3333/templates'); expect(req.request.method).toBe('GET');
        req.flush([]);
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaBuilderComponent } from './schema-builder.component';

describe('SchemaBuilderComponent', () => {
  let component: SchemaBuilderComponent;
  let fixture: ComponentFixture<SchemaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaBuilderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchemaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

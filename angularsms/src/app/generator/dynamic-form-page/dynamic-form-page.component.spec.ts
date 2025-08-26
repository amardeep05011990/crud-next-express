import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormPageComponent } from './dynamic-form-page.component';

describe('DynamicFormPageComponent', () => {
  let component: DynamicFormPageComponent;
  let fixture: ComponentFixture<DynamicFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

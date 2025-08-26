import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormGroupComponent } from './dynamic-form-group.component';

describe('DynamicFormComponent', () => {
  let component: DynamicFormGroupComponent;
  let fixture: ComponentFixture<DynamicFormGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

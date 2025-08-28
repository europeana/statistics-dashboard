import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '.';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CheckboxComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    expect(component.registerOnChange).toBeTruthy();
    expect(component.registerOnTouched).toBeTruthy();
    expect(component.writeValue).toBeTruthy();
    component.writeValue();
    component.registerOnTouched();
    component.registerOnChange(() => {
      console.log('unimplemented');
    });
  });

  it('should handle the field change', () => {
    const spyEmit = jest.spyOn(component.valueChanged, 'emit');
    component.onChange();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should handle the space key', () => {
    const spyEmit = jest.spyOn(component.keySelectionMade, 'emit');
    component.onSpaceKey();
    expect(spyEmit).toHaveBeenCalled();
  });
});

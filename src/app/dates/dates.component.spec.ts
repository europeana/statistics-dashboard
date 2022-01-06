import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { validateDateGeneric } from '../_helpers';
import { DatesComponent } from '.';

describe('DatesComponent', () => {
  let component: DatesComponent;
  let fixture: ComponentFixture<DatesComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DatesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatesComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group({
      dateFrom: [
        '',
        (control): { [key: string]: boolean } | null => {
          return validateDateGeneric(control, 'dateFrom');
        }
      ],
      dateTo: [
        '',
        (control): { [key: string]: boolean } | null => {
          return validateDateGeneric(control, 'dateTo');
        }
      ]
    });

    fixture.detectChanges();

    component.rangePicker = {
      open: () => {
        console.log('open mock range picker');
      }
    } as unknown as ElementRef;
  });

  it('should handle the to-date change', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(component.dateFrom.nativeElement.getAttribute('max')).not.toEqual(
      component.today
    );

    component.form.value.dateTo = yesterday.toISOString();
    component.dateChange();
    expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
      yesterday.toISOString().split('T')[0]
    );

    component.form.value.dateTo = null;
    component.dateChange();
    expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
      component.today
    );
  });

  it('should set the min-max attributes', () => {
    expect(component.dateTo.nativeElement.getAttribute('min')).toBeFalsy();

    component.form.value.dateFrom = component.today;
    component.dateChange();
    expect(component.dateTo.nativeElement.getAttribute('min')).toBeTruthy();
    expect(component.dateTo.nativeElement.getAttribute('min')).not.toEqual(
      component.yearZero
    );

    component.form.value.dateFrom = null;
    component.dateChange();
    expect(component.dateTo.nativeElement.getAttribute('min')).toEqual(
      component.yearZero
    );
  });

  it('should clear validation errors for the corresponding field', () => {
    const tomorrow = new Date(component.today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // set dateTo to something invalid
    component.form.controls.dateTo.setValue(tomorrow.toISOString());

    expect(component.form.controls.dateTo.errors).toBeTruthy();

    spyOn(component.form.controls.dateTo, 'updateValueAndValidity');
    component.dateChange();

    expect(
      component.form.controls.dateTo.updateValueAndValidity
    ).toHaveBeenCalled();

    component.form.reset();

    // set dateFrom to something invalid
    component.form.controls.dateFrom.setValue(tomorrow.toISOString());

    expect(component.form.controls.dateFrom.errors).toBeTruthy();

    spyOn(component.form.controls.dateFrom, 'updateValueAndValidity');
    component.dateChange();
    expect(
      component.form.controls.dateFrom.updateValueAndValidity
    ).toHaveBeenCalled();
  });

  it('should validate dates', () => {
    component.form.value.dateFrom = null;
    component.form.value.dateTo = null;

    const dateFrom = component.form.controls.dateFrom as FormControl;
    const dateTo = component.form.controls.dateTo as FormControl;

    let resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom).toBeFalsy();

    let resTo = validateDateGeneric(dateTo, 'dateTo');

    expect(resTo).toBeFalsy();

    const yesterYear = new Date(component.yearZero);
    const yesterday = new Date();
    const today = new Date(component.today);
    const tomorrow = new Date(component.today);

    yesterday.setDate(yesterday.getDate() - 1);
    yesterYear.setDate(yesterYear.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() + 1);

    dateFrom.setValue(yesterYear.toISOString());

    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom.isTooEarly).toBeTruthy();
    expect(resFrom.isTooLate).toBeFalsy();

    dateFrom.setValue('');

    resTo = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resTo).toBeFalsy();

    dateFrom.setValue(tomorrow.toISOString());
    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom.isTooLate).toBeTruthy();

    dateFrom.setValue('');
    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom).toBeFalsy();

    // comparison

    dateFrom.setValue(today.toISOString());
    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom).toBeFalsy();

    dateTo.setValue(yesterday.toISOString());

    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    resTo = validateDateGeneric(dateFrom, 'dateFrom');

    expect(resFrom.isTooLate).toBeTruthy();
    expect(resTo.isTooLate).toBeTruthy();

    dateTo.setValue(today.toISOString());

    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    resTo = validateDateGeneric(dateFrom, 'dateFrom');

    expect(resFrom).toBeFalsy();
    expect(resTo).toBeFalsy();

    dateFrom.setValue(tomorrow.toISOString());

    resFrom = validateDateGeneric(dateFrom, 'dateFrom');
    expect(resFrom.isTooEarly).toBeFalsy();
    expect(resFrom.isTooLate).toBeTruthy();
  });

  it('should handle the to-date change', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(null);

    component.form.value.dateTo = yesterday.toISOString();
    component.dateChange();
    expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
      yesterday.toISOString().split('T')[0]
    );

    component.form.value.dateTo = null;
    component.dateChange();
    expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
      component.today
    );
  });
});

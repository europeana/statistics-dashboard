import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  ValidationErrors
} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AppDateAdapter, validateDateGeneric } from '../_helpers';
import { DatesComponent } from '.';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('DatesComponent', () => {
  let component: DatesComponent;
  let fixture: ComponentFixture<DatesComponent>;
  let mockForm: any;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DatesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        {
          provide: MAT_DATE_FORMATS,
          useValue: {
            parse: { dateInput: AppDateAdapter.preferredFormat },
            dateInput: AppDateAdapter.preferredFormat,
            display: {
              dateInput: AppDateAdapter.preferredFormat,
              monthYearLabel: 'MM YYYY',
              dateA11yLabel: 'MM',
              monthYearA11yLabel: 'MMMM YYYY'
            }
          }
        },
        provideNoopAnimations(),
        MatDatepickerModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(DatesComponent);
    component = fixture.componentInstance;

    // Create the untyped form instance
    mockForm = new UntypedFormBuilder().group({
      dateFrom: [
        '',
        (control): ValidationErrors | null => {
          return validateDateGeneric(control, 'dateFrom');
        }
      ],
      dateTo: [
        '',
        (control): ValidationErrors | null => {
          return validateDateGeneric(control, 'dateTo');
        }
      ]
    });

    fixture.componentRef.setInput('form', mockForm);
    fixture.detectChanges();
    flush();
  }));

  it('should handle the to-date change', fakeAsync(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(component.dateFrom().nativeElement.getAttribute('max')).toEqual(
      component.today
    );

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const localYesterdayString = `${year}-${month}-${day}`;

    mockForm.patchValue({ dateTo: localYesterdayString });
    fixture.detectChanges();
    flush();

    expect(component.dateFrom().nativeElement.getAttribute('max')).toEqual(
      localYesterdayString
    );

    mockForm.patchValue({ dateTo: null });
    fixture.detectChanges();
    flush();

    expect(component.dateFrom().nativeElement.getAttribute('max')).toEqual(
      component.today
    );
  }));

  it('should set the min-max attributes', fakeAsync(() => {
    expect(component.dateTo().nativeElement.getAttribute('min')).toEqual(
      component.yearZero
    );

    mockForm.patchValue({ dateFrom: component.today });
    fixture.detectChanges();
    flush();

    expect(component.dateTo().nativeElement.getAttribute('min')).toBeTruthy();
    expect(component.dateTo().nativeElement.getAttribute('min')).not.toEqual(
      component.yearZero
    );

    mockForm.patchValue({ dateFrom: null });
    fixture.detectChanges();
    flush();

    expect(component.dateTo().nativeElement.getAttribute('min')).toEqual(
      component.yearZero
    );
  }));

  it('should clear validation errors for the corresponding field', fakeAsync(() => {
    const tomorrow = new Date(component.today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const spyUpdateDateTo = jest.spyOn(
      mockForm.controls.dateTo,
      'updateValueAndValidity'
    );

    // Set dateTo to something invalid
    mockForm.controls.dateTo.setValue(tomorrow.toISOString());
    expect(mockForm.controls.dateTo.errors).toBeTruthy();

    fixture.detectChanges();
    flush();

    expect(spyUpdateDateTo).toHaveBeenCalled();

    mockForm.reset();

    const spyUpdateDateFrom = jest.spyOn(
      mockForm.controls.dateFrom,
      'updateValueAndValidity'
    );

    // Set dateFrom to something invalid
    mockForm.controls.dateFrom.setValue(tomorrow.toISOString());
    expect(mockForm.controls.dateFrom.errors).toBeTruthy();

    fixture.detectChanges();
    flush();

    expect(spyUpdateDateFrom).toHaveBeenCalled();
  }));

  it('should validate dates', () => {
    mockForm.patchValue({ dateFrom: null, dateTo: null });

    const dateFrom = mockForm.controls.dateFrom as UntypedFormControl;
    const dateTo = mockForm.controls.dateTo as UntypedFormControl;

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
});

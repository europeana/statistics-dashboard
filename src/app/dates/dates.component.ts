import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap } from 'rxjs';
import {
  MatDatepickerModule,
  MatDateRangePicker
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getDateAsISOString, today, yearZero } from '../_helpers';

@Component({
  selector: 'app-dates',
  templateUrl: './dates.component.html',
  styleUrls: ['./dates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule]
})
export class DatesComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  public today = today;
  public yearZero = yearZero;

  readonly form = input.required<UntypedFormGroup>();
  readonly valueChanged = output<boolean>();

  readonly dateFrom = viewChild<ElementRef<HTMLInputElement>>('dateFrom');
  readonly dateTo = viewChild<ElementRef<HTMLInputElement>>('dateTo');
  readonly rangePicker = viewChild<MatDateRangePicker<unknown>>('rangePicker');

  private readonly formValues = toSignal(
    toObservable(this.form).pipe(
      switchMap((formInstance: UntypedFormGroup) =>
        formInstance.valueChanges.pipe(
          startWith(
            formInstance.value as {
              dateFrom: Date | string | null;
              dateTo: Date | string | null;
            }
          )
        )
      )
    )
  );

  constructor() {
    afterNextRender(() => {
      const picker = this.rangePicker();
      if (picker && !picker.opened && picker.datepickerInput) {
        picker.open();
      }
    });

    effect(() => {
      const values = this.formValues();
      const currentForm = this.form();
      const inputFrom = this.dateFrom();
      const inputTo = this.dateTo();

      if (!values || !currentForm || !inputFrom || !inputTo) {
        return;
      }

      const valFrom = values.dateFrom;
      const valTo = values.dateTo;

      inputTo.nativeElement.setAttribute(
        'min',
        getDateAsISOString(valFrom ? new Date(valFrom) : new Date(yearZero))
      );
      inputFrom.nativeElement.setAttribute(
        'max',
        getDateAsISOString(valTo ? new Date(valTo) : new Date(today))
      );

      currentForm.controls['dateTo'].updateValueAndValidity({
        emitEvent: false
      });
      currentForm.controls['dateFrom'].updateValueAndValidity({
        emitEvent: false
      });

      this.cdr.markForCheck();
    });
  }

  onPickerClosed(): void {
    const currentForm = this.form();
    const inputFrom = this.dateFrom();
    const inputTo = this.dateTo();

    if (!currentForm || !inputFrom || !inputTo) {
      return;
    }

    const valFrom = currentForm.value.dateFrom;
    const valTo = currentForm.value.dateTo;

    const controlsValid =
      !currentForm.controls['dateFrom'].errors &&
      !currentForm.controls['dateTo'].errors;
    const domValid =
      inputFrom.nativeElement.validity.valid &&
      inputTo.nativeElement.validity.valid;

    if (
      controlsValid &&
      domValid &&
      ((valFrom && valTo) || (!valFrom && !valTo))
    ) {
      this.valueChanged.emit(true);
    }
  }
}

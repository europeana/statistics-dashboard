import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';
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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule
  ]
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
          startWith(formInstance.value as { dateFrom: string; dateTo: string })
        )
      )
    )
  );

  constructor() {
    effect(() => {
      const values = this.formValues();
      const currentForm = this.form();
      const inputFrom = this.dateFrom();
      const inputTo = this.dateTo();
      const picker = this.rangePicker();

      if (!values || !currentForm || !inputFrom || !inputTo) {
        return;
      }

      const valFrom = values.dateFrom;
      const valTo = values.dateTo;

      inputTo.nativeElement.setAttribute(
        'min',
        getDateAsISOString(new Date(valFrom || yearZero))
      );
      inputFrom.nativeElement.setAttribute(
        'max',
        getDateAsISOString(new Date(valTo || today))
      );

      currentForm.controls['dateTo'].updateValueAndValidity({
        emitEvent: false
      });
      currentForm.controls['dateFrom'].updateValueAndValidity({
        emitEvent: false
      });

      const controlsValid =
        !currentForm.controls['dateFrom'].errors &&
        !currentForm.controls['dateTo'].errors;
      const domValid =
        inputFrom.nativeElement.validity.valid &&
        inputTo.nativeElement.validity.valid;

      if (controlsValid && domValid) {
        if ((valFrom && valTo) || (!valFrom && !valTo)) {
          this.valueChanged.emit(true);
        }
      }

      // Explicitly tell the zoneless framework that form validity controls updated layout states
      this.cdr.markForCheck();

      if (picker && typeof picker.open === 'function') {
        const hasInput = !!picker.datepickerInput;
        if (hasInput && !picker.opened) {
          queueMicrotask(() => {
            picker.open();
          });
        }
      }
    });
  }
}

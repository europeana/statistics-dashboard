import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { getDateAsISOString, today, yearZero } from '../_helpers';
import { NgIf } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dates',
  templateUrl: './dates.component.html',
  styleUrls: ['./dates.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgIf
  ]
})
export class DatesComponent {
  // Make imports available to template
  public today = today;
  public yearZero = yearZero;

  @Input() form: UntypedFormGroup;
  @Output() valueChanged: EventEmitter<true> = new EventEmitter();

  @ViewChild('dateFrom') dateFrom: ElementRef;
  @ViewChild('dateTo') dateTo: ElementRef;
  @ViewChild('rangePicker') rangePicker: ElementRef;

  /** dateChange
    /* Template utility:
    /*   corrects @min / @max on the sibling element
    /*   clears form errors / revalidates
    /*   sets a default value of the sibling field if unset
    /*   calls 'updatePageUrl' if valid
    */
  dateChange(): void {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    this.dateTo.nativeElement.setAttribute(
      'min',
      getDateAsISOString(new Date(valFrom || yearZero))
    );
    this.dateFrom.nativeElement.setAttribute(
      'max',
      getDateAsISOString(new Date(valTo || today))
    );

    this.form.controls.dateTo.updateValueAndValidity();
    this.form.controls.dateFrom.updateValueAndValidity();

    if (
      !this.form.controls.dateFrom.errors &&
      !this.form.controls.dateTo.errors &&
      this.dateFrom.nativeElement.validity.valid &&
      this.dateTo.nativeElement.validity.valid
    ) {
      if ((valFrom && valTo) || (!valFrom && !valTo)) {
        this.changed();
      }
    }

    (this.rangePicker as unknown as { open: () => void }).open();
  }

  changed(): void {
    this.valueChanged.emit(true);
  }
}

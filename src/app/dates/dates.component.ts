import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { today, yearZero } from '../_helpers';

@Component({
  selector: 'app-dates',
  templateUrl: './dates.component.html',
  styleUrls: ['./dates.component.scss']
})
export class DatesComponent {
  // Make imports available to template
  public today = today;
  public yearZero = yearZero;

  @Input() form: FormGroup;
  @Output() valueChanged: EventEmitter<true> = new EventEmitter();

  @ViewChild('dateFrom') dateFrom: ElementRef;
  @ViewChild('dateTo') dateTo: ElementRef;

  /** dateChange
    /* Template utility: corrects @min / @max on the element and calls 'updatePageUrl' if valid
    /* @param {boolean} isDateFrom - flag if dateFrom is the caller
    */
  dateChange(isDateFrom: boolean): void {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;
    if (isDateFrom) {
      this.dateTo.nativeElement.setAttribute(
        'min',
        valFrom ? valFrom : yearZero
      );

      // if the other is already in error, try to fix it
      if (this.form.controls.dateTo.errors) {
        this.form.controls.dateTo.updateValueAndValidity();
      }
    } else {
      this.dateFrom.nativeElement.setAttribute('max', valTo ? valTo : today);
      // if the other is already in error, try to fix it
      if (this.form.controls.dateFrom.errors) {
        this.form.controls.dateFrom.updateValueAndValidity();
      }
    }
    if (
      !this.form.controls.dateFrom.errors &&
      !this.form.controls.dateTo.errors &&
      this.dateFrom.nativeElement.validity.valid &&
      this.dateTo.nativeElement.validity.valid
    ) {
      this.changed();
    }
  }

  changed(): void {
    this.valueChanged.emit(true);
  }
}

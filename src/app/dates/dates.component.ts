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
    /* Template utility:
    /*   corrects @min / @max on the sibling element
    /*   clears form errors / revalidates
    /*   sets a default value of the sibling field if unset
    /*   calls 'updatePageUrl' if valid
    /* @param {boolean} isDateFrom - flag if dateFrom is the caller
    */
  dateChange(isDateFrom: boolean): void {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;
    if (isDateFrom) {
      // update the 'min' of the dateTo element
      this.dateTo.nativeElement.setAttribute(
        'min',
        valFrom ? valFrom : yearZero
      );

      const ctrlDateTo = this.form.controls.dateTo;

      // if the dateTo is empty (and if there is a from value) then set it to today
      if (valFrom && !ctrlDateTo.value) {
        ctrlDateTo.setValue(new Date().toISOString().split('T')[0]);
      }

      // if the dateTo is already in error, try to fix it
      if (ctrlDateTo.errors) {
        this.form.controls.dateTo.updateValueAndValidity();
      }
    } else {
      // update the 'max' of the dateFrom element
      this.dateFrom.nativeElement.setAttribute('max', valTo ? valTo : today);

      const ctrlDateFrom = this.form.controls.dateFrom;

      // if the ctrlDateFrom is empty, set it to yearZero
      if (valTo && !ctrlDateFrom.value) {
        ctrlDateFrom.setValue(yearZero);
      }

      // if the dateFrom is already in error, try to fix it
      if (ctrlDateFrom.errors) {
        ctrlDateFrom.updateValueAndValidity();
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

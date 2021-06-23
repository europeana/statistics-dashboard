import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input() group: string;
  @Input() options: Array<string>;

  @Input() form: FormGroup;
  @Input() disabled: boolean;

  @Output() valueChanged: EventEmitter<true> = new EventEmitter();

  //menuStates: { [key: string]: MenuState } = {};
  open = false;

  constructor() {}

  changed(): void {
    this.valueChanged.emit(true);
  }

  toggle(): void {
    this.open = !this.open;
  }

  /** toInputSafeName
  /* @param {string} s - the target string
  /* - replaces the dot character in a string with 5 underscores
  */
  toInputSafeName(s: string): string {
    return s.replace(/\./g, '_____');
  }

  selectOptionEnabled(group: string, val: string): boolean {
    console.log('form = ' + this.form);

    return val === '0' && group === 'contentTier'
      ? this.form.value.contentTierZero
      : true;
  }
}

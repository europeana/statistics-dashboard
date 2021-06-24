import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FilterState, NameLabel } from '../_models';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input() form: FormGroup;
  @Input() group: string;
  @Input() options: Array<NameLabel>;
  @Input() state: FilterState;

  @Output() valueChanged: EventEmitter<true> = new EventEmitter();

  changed(): void {
    this.valueChanged.emit(true);
  }

  toggle(): void {
    this.state.visible = !this.state.visible;
  }

  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === 'contentTier'
      ? this.form.value.contentTierZero
      : true;
  }
}

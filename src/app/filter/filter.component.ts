import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { getFormValueList } from '../_helpers';
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
  @Output() visibilityChanged: EventEmitter<string> = new EventEmitter();

  changed(): void {
    this.valueChanged.emit(true);
  }

  getSetCheckboxValues(filterName: string): string {
    return getFormValueList(this.form, filterName)
      .map((s: string) => {
        let prefix = '';
        if (['contentTier', 'metadataTier'].includes(this.group)) {
          prefix = 'Tier ';
        }
        return prefix + s;
      })
      .join(', ');
  }

  hide(): void {
    this.state.visible = false;
  }

  toggle(): void {
    this.state.visible = !this.state.visible;
    this.visibilityChanged.emit(this.group);
  }

  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === 'contentTier'
      ? this.form.value.contentTierZero
      : true;
  }
}

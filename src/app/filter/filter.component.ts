import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getFormValueList, rightsUrlMatch } from '../_helpers';
import { DimensionName, FilterInfo, FilterState, NameLabel } from '../_models';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input() form: FormGroup;
  @Input() group: DimensionName;

  filteredOptions?: Array<NameLabel>;
  _options?: Array<NameLabel>;
  @Input() set options(ops: Array<NameLabel>) {
    this._options = ops;
    this.filteredOptions = ops;
  }
  @Input() state: FilterState;
  @Output() filterTermChanged: EventEmitter<FilterInfo> = new EventEmitter();
  @Output() valueChanged: EventEmitter<true> = new EventEmitter();
  @Output() visibilityChanged: EventEmitter<string> = new EventEmitter();

  @ViewChild('filterTerm') filterTerm: ElementRef;

  changed(): void {
    this.valueChanged.emit(true);
  }

  filterOptions(evt: { target: { value: string } }): void {
    if (!this._options) {
      return;
    }
    const term = evt.target.value;
    this.filterTermChanged.emit({ term: term, dimension: this.group });
  }

  getSetCheckboxValues(filterName: DimensionName): string {
    return getFormValueList(this.form, filterName)
      .map((s: string) => {
        let prefix = '';
        if (
          [DimensionName.contentTier, DimensionName.metadataTier].includes(
            this.group
          )
        ) {
          prefix = 'Tier ';
        } else if (this.group === DimensionName.rights) {
          const swapped = rightsUrlMatch(s);
          s = swapped ? swapped : s;
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

    if (this.state.visible) {
      const fn = (): void => {
        const ft = this.filterTerm;
        if (ft) {
          ft.nativeElement.focus();
        }
      };
      setTimeout(fn, 1);
    }
  }

  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === DimensionName.contentTier
      ? this.form.value.contentTierZero
      : true;
  }
}

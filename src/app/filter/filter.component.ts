import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { isoCountryCodesReversed } from '../_data';
import { getFormValueList } from '../_helpers';
import {
  DimensionName,
  FilterInfo,
  FilterOptionSet,
  FilterState
} from '../_models';
import { RenameApiFacetPipe } from '../_translate/rename-facet.pipe';
import { HighlightMatchPipe } from '../_translate/highlight-match.pipe';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DatesComponent } from '../dates/dates.component';
import { ClickAwareDirective } from '../_directives/click-aware/click-aware.directive';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [
    NgIf,
    ClickAwareDirective,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatesComponent,
    NgFor,
    CheckboxComponent,
    HighlightMatchPipe,
    RenameApiFacetPipe
  ]
})
export class FilterComponent {
  @Input() emptyDataset: boolean;
  @Input() form: FormGroup;
  @Input() group: DimensionName;
  @Input() totalAvailable: number;

  _optionSet?: FilterOptionSet;
  empty = true;
  emptyData = true;
  term = '';
  pagesVisible = 1;

  get optionSet(): FilterOptionSet {
    return this._optionSet;
  }
  @Input() set optionSet(optionSet: FilterOptionSet) {
    if (optionSet && optionSet.options.length > 0) {
      // if there's data (with no filter) then capture that fact.
      if (!this.term || this.term.length === 0) {
        this.emptyData = false;
      }
      this.empty = false;
    } else {
      this.empty = true;
    }
    this._optionSet = optionSet;
  }
  @Input() state: FilterState;
  @Input() tierPrefix: string;
  @Output() filterTermChanged: EventEmitter<FilterInfo> = new EventEmitter();
  @Output() valueChanged: EventEmitter<true> = new EventEmitter();
  @Output() visibilityChanged: EventEmitter<string> = new EventEmitter();

  @ViewChild('filterTerm') filterTerm: ElementRef;

  changed(): void {
    this.valueChanged.emit(true);
  }

  filterOptions(evt: { key: string; target: { value: string } }): void {
    if (!this.optionSet) {
      return;
    }
    if (evt.key === 'Escape') {
      this.hide();
    }
    this.term = evt.target.value;
    this.filterTermChanged.emit({
      term: this.term,
      dimension: this.group
    });
  }

  /** isDisabled
  /* disabling is conditional for dates
  */
  isDisabled(): boolean {
    if ((this.group as string) === 'dates') {
      if (this.form.value.dateFrom && this.form.value.dateTo) {
        return false;
      } else {
        return this.emptyDataset;
      }
    } else {
      // consider there to be data (and allow the user to open) if the term is blocking
      if (
        this.empty &&
        !this.emptyData &&
        this.term.length > 0 &&
        !this.state.visible
      ) {
        return false;
      }
      return this.empty;
    }
  }

  /** getSetCheckboxValues
  /* Template utility for selection string
  /* @param {DimensionName} filterName - the form value key
  */
  getSetCheckboxValues(filterName: DimensionName): string {
    let result = getFormValueList(this.form, filterName);

    if (filterName === 'country') {
      result = result.map((s: string) => {
        return isoCountryCodesReversed[s];
      });
    }
    return result
      .map((s: string) => {
        let prefix = '';
        if (
          [DimensionName.contentTier, DimensionName.metadataTier].includes(
            this.group
          )
        ) {
          prefix = this.tierPrefix;
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

  /** selectOptionEnabled
   * @param { string  } group - the formGroup
   * @param { string  } val - the form value
   * @returns boolean
   */
  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === DimensionName.contentTier
      ? this.form.value.contentTierZero
      : true;
  }

  /** loadMore
   *  function invoked by clicking on the "load more" link.
   * @param { string : filterName } - the filter data to check
   * @returns number
   */
  loadMore(): void {
    this.pagesVisible++;
    this.filterTermChanged.emit({
      term: this.term,
      dimension: this.group,
      upToPage: this.pagesVisible
    });
  }
}

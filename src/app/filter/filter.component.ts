import { NgClass, NgIf } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  Injector,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DimensionName, isoCountryCodesReversed } from '../_data';
import { OpenerFocusDirective } from '../_directives';
import { getFormValueList } from '../_helpers';
import {
  FilterInfo,
  FilterOptionSet,
  FilterState,
  InputDescription
} from '../_models';
import { RenameApiFacetPipe } from '../_translate/rename-facet.pipe';
import { HighlightMatchPipe } from '../_translate/highlight-match.pipe';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DatesComponent } from '../dates/dates.component';
import { ClickAwareDirective } from '../_directives/click-aware/click-aware.directive';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Highly recommended for zoneless
  imports: [
    NgIf,
    ClickAwareDirective,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatesComponent,
    CheckboxComponent,
    HighlightMatchPipe,
    RenameApiFacetPipe,
    OpenerFocusDirective
  ]
})
export class FilterComponent {
  emptyDataset = input<boolean>(false);

  form = input.required<FormGroup>();
  group = input.required<DimensionName>();
  tierPrefix = input<string>('');
  totalAvailable = input.required<number>();
  optionSet = input<FilterOptionSet | undefined>(undefined);

  term = signal<string>('');
  pagesVisible = signal<number>(1);
  inputToFocus = signal<InputDescription | undefined>(undefined);
  state = model.required<FilterState>();

  empty = computed(() => {
    const currentOptionSet = this.optionSet();
    return !(
      currentOptionSet &&
      currentOptionSet.options &&
      currentOptionSet.options.length > 0
    );
  });

  emptyData = computed(() => {
    if (!this.empty()) {
      if (!this.term() || this.term().length === 0) {
        return false;
      }
    }
    return true;
  });

  filterTermChanged = output<FilterInfo>();
  valueChanged = output<true>();
  visibilityChanged = output<string>();

  filterTerm = viewChild<ElementRef<HTMLInputElement>>('filterTerm');
  opener = viewChild<ElementRef<HTMLElement>>('opener');
  checkboxes = viewChildren(CheckboxComponent);

  constructor(private injector: Injector) {
    effect(() => {
      const isVisible = this.state()?.visible;
      const targetInput = this.inputToFocus();

      if (targetInput || isVisible) {
        // handle asynchronous DOM steps safely without setTimeout
        afterNextRender(
          () => {
            if (targetInput) {
              const focusItem = this.checkboxes().find(
                (cb: CheckboxComponent) => {
                  return (
                    cb.group() === targetInput.group &&
                    cb.controlName() === targetInput.controlName
                  );
                }
              );

              if (focusItem) {
                focusItem.baseInput()?.nativeElement.focus();
              } else {
                this.filterTerm()?.nativeElement.focus();
              }
              // safe signal update inside the correct lifecycle loop
              this.inputToFocus.set(undefined);
            } else if (isVisible) {
              this.filterTerm()?.nativeElement.focus();
            }
          },
          { injector: this.injector }
        );
      }
    });
  }

  changed(): void {
    this.valueChanged.emit(true);
  }

  /** onKeySelectionMade
   *
   * receives notification from a checkbox that a keyboard selection was made
   * @param { InputDescription } keyData
   **/
  onKeySelectionMade(keyData: InputDescription): void {
    this.inputToFocus.set(keyData);
  }

  filterOptions(evt: { key: string; target: { value: string } }): void {
    if (!this.optionSet()) {
      return;
    }
    if (evt.key === 'Escape') {
      this.hide();
      this.opener()?.nativeElement?.focus();
    }
    this.term.set(evt.target.value);
    this.filterTermChanged.emit({
      term: this.term(),
      dimension: this.group()
    });
  }

  /** isDisabled
  /* disabling is conditional for dates
  */
  isDisabled(): boolean {
    if ((this.group() as string) === 'dates') {
      if (this.form().value.dateFrom && this.form().value.dateTo) {
        return false;
      } else {
        return this.emptyDataset();
      }
    } else {
      // consider there to be data (and allow the user to open) if the term is blocking
      if (
        this.empty() &&
        !this.emptyData() &&
        this.term().length > 0 &&
        !this.state().visible
      ) {
        return false;
      }
      return this.empty();
    }
  }

  /** getSetCheckboxValues
  /* Template utility for selection string
  /* @param {DimensionName} filterName - the form value key
  */
  getSetCheckboxValues(filterName: DimensionName): string {
    let result = getFormValueList(this.form(), filterName);

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
            this.group()
          )
        ) {
          prefix = this.tierPrefix();
        }
        return prefix + s;
      })
      .join(', ');
  }

  hide = (): void => {
    this.state.update((current) => ({
      ...current,
      visible: false
    }));
  };

  toggle(): void {
    this.state.update((current) => ({
      ...current,
      visible: !current.visible
    }));

    this.visibilityChanged.emit(this.group());
  }

  /** selectOptionEnabled
   * @param { string  } group - the formGroup
   * @param { string  } val - the form value
   * @returns boolean
   */
  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === DimensionName.contentTier
      ? this.form().value.contentTierZero
      : true;
  }

  /** loadMore
   *  function invoked by clicking on the "load more" link.
   * @param { string : filterName } - the filter data to check
   * @returns number
   */
  loadMore(): void {
    this.pagesVisible.update((p) => p + 1);
    this.filterTermChanged.emit({
      term: this.term(),
      dimension: this.group(),
      upToPage: this.pagesVisible()
    });
  }
}

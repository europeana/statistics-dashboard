import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { Router, RouterLink } from '@angular/router';

import { OpenerFocusDirective } from '../_directives';
import { sortByDecodedCountryName } from '../_helpers';
import { isoCountryCodes, isoCountryCodesReversed } from '../_data';
import { ClickAwareDirective } from '../_directives/click-aware/click-aware.directive';
import { IHash } from '../_models';
import { FilterStateService } from '../_services';
import { RenameCountryPipe } from '../_translate';

interface CountryPair {
  key: string;
  value: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClickAwareDirective,
    CTZeroControlComponent,
    NgClass,
    OpenerFocusDirective,
    RenameCountryPipe,
    RouterLink
  ]
})
export class HeaderComponent {
  public readonly classReference = HeaderComponent;
  public static readonly PAGE_TITLE_HIDDEN = 0;
  public static readonly PAGE_TITLE_MINIFIED = 1;
  public static readonly PAGE_TITLE_SHOWING = 2;

  private readonly filterStateService = inject(FilterStateService);
  public router = inject(Router);

  form = input<FormGroup>();
  showPageTitle = model<number>(HeaderComponent.PAGE_TITLE_HIDDEN);

  readonly includeCTZero = this.filterStateService.includeCTZero;
  readonly pageTitleInViewport = this.filterStateService.pageTitleInViewport;
  readonly pageTitleDynamic = this.filterStateService.pageTitleDynamic;
  readonly activeCountry = this.filterStateService.activeCountry;
  readonly countryTotalMap = this.filterStateService.countryTotalMap;

  menuIsOpen = signal<boolean>(false);
  menuOpener = viewChild('menuOpener', { read: ElementRef });

  readonly countryList = computed<CountryPair[]>(() => {
    const rawMap = this.countryTotalMap() || {};
    return Object.keys(rawMap).map((key) => ({
      key,
      value: rawMap[key]
    }));
  });

  readonly countryFirstOfLetter = computed<IHash<string | undefined>>(() => {
    const rawMap = this.countryTotalMap() || {};
    const firstLetterMap: IHash<string | undefined> = {};
    let lastLetter = '';

    Object.keys(rawMap)
      .sort(sortByDecodedCountryName)
      .forEach((key) => {
        const decoded = isoCountryCodesReversed[key] ?? key;
        const firstLetter = decoded[0];
        const match = firstLetter === lastLetter;
        firstLetterMap[key] = match ? undefined : firstLetter;
        if (!match) {
          lastLetter = firstLetter;
        }
      });
    return firstLetterMap;
  });

  public readonly isoCountryCodes = isoCountryCodes;

  constructor() {
    effect(() => {
      this.activeCountry();
      this.menuIsOpen.set(false);
    });
  }

  keyNavHome(event: KeyboardEvent): void {
    event.stopPropagation();
    this.router.navigate([`/`]);
  }

  keyNavToCountry(event: KeyboardEvent, country: string): void {
    event.stopPropagation();
    this.menuIsOpen.set(false);
    this.menuOpener()?.nativeElement.focus();

    this.router.navigate(
      [`country`, country],
      this.includeCTZero()
        ? { queryParams: { 'content-tier-zero': 'true' } }
        : undefined
    );
  }

  toggleMenu = (event: Event, isKeyboardEvent = false): void => {
    if (!(event.target as HTMLElement).getAttribute('disabled')) {
      this.menuIsOpen.update((open) => !open);
      event.stopPropagation();
    }
    if (isKeyboardEvent) {
      this.menuOpener()?.nativeElement.focus();
    }
  };
}

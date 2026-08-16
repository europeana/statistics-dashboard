import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
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
  imports: [
    ClickAwareDirective,
    CTZeroControlComponent,
    NgClass,
    NgIf,
    OpenerFocusDirective,
    RenameCountryPipe,
    RouterLink
  ]
})
export class HeaderComponent {
  public classReference = HeaderComponent;
  public static readonly PAGE_TITLE_HIDDEN = 0;
  public static readonly PAGE_TITLE_MINIFIED = 1;
  public static readonly PAGE_TITLE_SHOWING = 2;

  private filterStateService = inject(FilterStateService);

  form = input<FormGroup>();
  showPageTitle = model<number>(HeaderComponent.PAGE_TITLE_HIDDEN);

  readonly includeCTZero = this.filterStateService.includeCTZero;
  readonly pageTitleInViewport = this.filterStateService.pageTitleInViewport;
  readonly pageTitleDynamic = this.filterStateService.pageTitleDynamic;
  readonly activeCountry = this.filterStateService.activeCountry;
  readonly countryTotalMap = this.filterStateService.countryTotalMap;

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

  menuIsOpen = false;
  @ViewChild('menuOpener') menuOpener: ElementRef;

  public isoCountryCodes = isoCountryCodes;
  public router = inject(Router);

  constructor() {
    effect(() => {
      this.activeCountry();
      this.menuIsOpen = false;
    });
  }

  keyNavHome(event: KeyboardEvent): void {
    event.stopPropagation();
    this.router.navigate([`/`]);
  }

  keyNavToCountry(event: KeyboardEvent, country: string): void {
    event.stopPropagation();
    this.menuIsOpen = false;
    this.menuOpener.nativeElement.focus();

    this.router.navigate(
      [`country`, country],
      this.includeCTZero()
        ? { queryParams: { 'content-tier-zero': 'true' } }
        : undefined
    );
  }

  toggleMenu(event: MouseEvent, isKeyboardEvent = false): void {
    if (!(event.target as HTMLElement).getAttribute('disabled')) {
      this.menuIsOpen = !this.menuIsOpen;
      event.stopPropagation();
    }
    if (isKeyboardEvent) {
      this.menuOpener.nativeElement.focus();
    }
  }
}

import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { Router, RouterLink } from '@angular/router';

import { OpenerFocusDirective } from '../_directives';

import { isoCountryCodes, isoCountryCodesReversed } from '../_data';
import { ClickAwareDirective } from '../_directives/click-aware/click-aware.directive';
import { IHash } from '../_models';
import { RenameCountryPipe } from '../_translate';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    ClickAwareDirective,
    CTZeroControlComponent,
    KeyValuePipe,
    NgClass,
    NgIf,
    NgFor,
    OpenerFocusDirective,
    RenameCountryPipe,
    RouterLink
  ]
})
export class HeaderComponent {
  // class ref needed to access static variables in the template
  public classReference = HeaderComponent;
  public static PAGE_TITLE_HIDDEN = 0;
  public static PAGE_TITLE_MINIFIED = 1;
  public static PAGE_TITLE_SHOWING = 2;

  @Input() form?: FormGroup;
  @Input() includeCTZero: boolean;
  @Input() showPageTitle = HeaderComponent.PAGE_TITLE_HIDDEN;

  @Input() pageTitleInViewport = false;
  @Input() pageTitleDynamic = false;

  @ViewChild('menuOpener') menuOpener: ElementRef;

  public isoCountryCodes = isoCountryCodes;
  public router = inject(Router);

  _countryTotalMap: IHash<number>;
  countryFirstOfLetter: IHash<string | undefined> = {};

  /**
   * countryTotalMap setter
   * assigns to countryFirstOfLetter
   **/
  @Input() set countryTotalMap(countryTotalMap: IHash<number>) {
    const newMap = Object.keys(countryTotalMap)
      .sort(HeaderComponent.sortByDecodedCountryName)
      .reduce((ob, sortedKey) => {
        ob[sortedKey] = '' + countryTotalMap[sortedKey];
        return ob;
      }, {});

    let lastLetter = '';
    Object.keys(newMap).forEach((s: string) => {
      const decoded = isoCountryCodesReversed[s];
      const firstLetter = decoded[0];
      const match = firstLetter === lastLetter;
      this.countryFirstOfLetter[s] = match ? undefined : decoded[0];
      if (!match) {
        lastLetter = firstLetter;
      }
    });
    this._countryTotalMap = newMap;
  }

  get countryTotalMap(): IHash<number> {
    return this._countryTotalMap;
  }

  menuIsOpen = false;
  _activeCountry?: string;

  @Input() set activeCountry(activeCountry: string | undefined) {
    this.menuIsOpen = false;
    this._activeCountry = activeCountry;
  }

  get activeCountry(): string | undefined {
    return this._activeCountry;
  }

  /**
   * sortByDecodedCountryName
   * static (because pipe consumer has no "this" available) function
   * for sorting codes according to the country names they reference
   **/
  static sortByDecodedCountryName(a: string, b: string): number {
    const aDecoded = isoCountryCodesReversed[a];
    const bDecoded = isoCountryCodesReversed[b];
    return Intl.Collator('en').compare(aDecoded, bDecoded);
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
      this.includeCTZero
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

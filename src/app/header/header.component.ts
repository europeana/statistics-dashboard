import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { KeyValuePipe, NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { isoCountryCodes } from '../_data';
import { ClickAwareDirective } from '../_directives/click-aware/click-aware.directive';
import { CountryTotalInfo, IHash } from '../_models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    ClickAwareDirective,
    CTZeroControlComponent,
    KeyValuePipe,
    NgClass,
    NgIf,
    NgFor,
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

  public isoCountryCodes = isoCountryCodes;

  _countryTotalMap: IHash<CountryTotalInfo>;
  countryFirstOfLetter: IHash<string | undefined> = {};

  @Input() set countryTotalMap(countryTotalMap: IHash<CountryTotalInfo>) {
    this._countryTotalMap = countryTotalMap;

    let lastLetter = '';
    Object.keys(countryTotalMap)
      .sort()
      .forEach((s: string) => {
        const firstLetter = s[0];
        const match = firstLetter === lastLetter;
        this.countryFirstOfLetter[s] = match ? undefined : firstLetter;
        if (!match) {
          lastLetter = firstLetter;
        }
      });
  }

  get countryTotalMap(): IHash<CountryTotalInfo> {
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

  closeMenu(event: MouseEvent): void {
    this.menuIsOpen = false;
    event.stopPropagation();
  }

  toggleMenu(event: MouseEvent): void {
    if (!(event.target as HTMLElement).getAttribute('disabled')) {
      this.menuIsOpen = !this.menuIsOpen;
      event.stopPropagation();
    }
  }
}

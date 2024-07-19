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
  @Input() form?: FormGroup;
  @Input() includeCTZero: boolean;
  @Input() showPageTitle = false;

  public isoCountryCodes = isoCountryCodes;

  _countryTotalMap: IHash<CountryTotalInfo>;
  countryFirstOfLetter: IHash<boolean> = {};

  @Input() set countryTotalMap(countryTotalMap: IHash<CountryTotalInfo>) {
    this._countryTotalMap = countryTotalMap;

    let lastLetter = '';
    Object.keys(countryTotalMap)
      .sort()
      .forEach((s: string) => {
        const firstLetter = s[0];
        this.countryFirstOfLetter[s] = firstLetter !== lastLetter;
        if (this.countryFirstOfLetter[s]) {
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

  toggleMenu(event: MouseEvent): void {
    if (!(event.target as HTMLElement).getAttribute('disabled')) {
      this.menuIsOpen = !this.menuIsOpen;
      event.stopPropagation();
    }
  }
}

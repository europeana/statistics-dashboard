import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { KeyValuePipe, NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  countryTotalMap: IHash<CountryTotalInfo> = {};
  menuIsOpen = false;
  _activeCountry?: string;

  @Input() set activeCountry(activeCountry: string | undefined) {
    this.menuIsOpen = false;
    this._activeCountry = activeCountry;
  }

  get activeCountry(): string | undefined {
    return this._activeCountry;
  }

  toggleMenu(e: { target: HTMLElement }): void {
    if (!e.target.getAttribute('disabled')) {
      this.menuIsOpen = !this.menuIsOpen;
    }
  }
}

import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { KeyValuePipe, NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CTZeroControlComponent, KeyValuePipe, NgClass, NgFor, RouterLink]
})
export class HeaderComponent extends SubscriptionManager {
  @Input() form?: FormGroup;
  @Input() includeCTZero: boolean;
  @Input() showPageTitle = false;
  @Input() activeCountry?: string;

  constructor() {
    super();
  }

  cd = {
    Germany: 'DE',
    'Bosnia and Herzegovina': 'BO',
    Netherlands: 'NL',
    France: 'FR',
    'United Kingdom': 'GB'
  };
}

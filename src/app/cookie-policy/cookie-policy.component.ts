import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  imports: [CommonModule],
  styleUrls: ['./cookie-policy.component.scss'],
  templateUrl: './cookie-policy.component.html'
})
export class CookiePolicyComponent {
  siteAddress = document.baseURI.replace(/\/$/, '');
}

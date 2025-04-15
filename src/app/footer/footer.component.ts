import { Component, EventEmitter, Output } from '@angular/core';
import { externalLinks } from '../_data/static-data';
import { environment } from '../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [RouterLink]
})
export class FooterComponent {
  public externalLinks = externalLinks;
  public feedbackUrl = environment.feedbackUrl;

  @Output() showCookieConsent = new EventEmitter<void>();

  clickPrivacySettings(): void {
    this.showCookieConsent.emit();
  }
}

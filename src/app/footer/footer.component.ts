import { Component, output } from '@angular/core';
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
  public readonly externalLinks = externalLinks;
  public readonly feedbackUrl = environment.feedbackUrl;

  showCookieConsent = output<void>();

  clickPrivacySettings(): void {
    this.showCookieConsent.emit();
  }
}

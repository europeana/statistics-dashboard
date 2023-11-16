import { Component, EventEmitter, Output } from '@angular/core';
import { externalLinks } from '../_data/static-data';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public externalLinks = externalLinks;
  public feedbackUrl = environment.feedbackUrl;

  @Output() showCookieConsent = new EventEmitter<void>();

  clickPrivacySettings(): void {
    this.showCookieConsent.emit();
  }
}

import { Component } from '@angular/core';
import { externalLinks } from '../_data/static-data';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public externalLinks = externalLinks;
}

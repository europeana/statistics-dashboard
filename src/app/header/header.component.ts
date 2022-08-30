import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() form?: UntypedFormGroup;
  @Input() includeCTZero: boolean;
  @Input() showPageTitle = false;
}

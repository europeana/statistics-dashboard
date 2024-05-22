import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, CTZeroControlComponent]
})
export class HeaderComponent {
  @Input() form?: FormGroup;
  @Input() includeCTZero: boolean;
  @Input() showPageTitle = false;
}

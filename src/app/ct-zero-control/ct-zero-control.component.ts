import { Component, input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { externalLinks } from '../_data';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-ct-zero-control',
  templateUrl: './ct-zero-control.component.html',
  styleUrls: ['./ct-zero-control.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf]
})
export class CTZeroControlComponent {
  form = input<FormGroup<{ contentTierZero: FormControl<boolean> }>>();
  disabled = input<boolean>(false);
  onChange = output<void>();

  public externalLinks = externalLinks;

  /**
   * valueChanged
   * trigger parent updates
   **/
  valueChanged(): void {
    this.onChange.emit();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf]
})
export class CTZeroControlComponent {
  @Input() form: FormGroup<{ contentTierZero: FormControl<boolean> }>;

  @Input() disabled = false;
  @Output() onChange = new EventEmitter<void>();

  public externalLinks = externalLinks;

  /**
   * valueChanged
   * emits event (invokes updatePageUrl())
   **/
  valueChanged(): void {
    this.onChange.emit();
  }
}

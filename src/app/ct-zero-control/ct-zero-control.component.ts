import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { externalLinks } from '../_data';

@Component({
  selector: 'app-ct-zero-control',
  templateUrl: './ct-zero-control.component.html',
  styleUrls: ['./ct-zero-control.component.scss']
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

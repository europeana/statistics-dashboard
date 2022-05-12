import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { externalLinks } from '../_data';

@Component({
  selector: 'app-ct-zero-control',
  templateUrl: './ct-zero-control.component.html',
  styleUrls: ['./ct-zero-control.component.scss']
})
export class CTZeroControlComponent {
  @Input() form: FormGroup;
  @Input() disabled = false;
  @Output() onChange = new EventEmitter<void>();

  public externalLinks = externalLinks;

  valueChanged(): void {
    this.onChange.emit();
    // hooks to updatePageUrl()
  }
}

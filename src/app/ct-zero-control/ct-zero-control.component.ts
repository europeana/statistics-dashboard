import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf]
})
export class CTZeroControlComponent {
  form = input.required<FormGroup<{ contentTierZero: FormControl<boolean> }>>();
  disabled = input<boolean>(false);
  onChange = output<void>();

  public readonly externalLinks = externalLinks;

  contentTierZeroChecked = signal<boolean>(false);

  constructor() {
    effect((onCleanup) => {
      const activeForm = this.form();
      const control = activeForm.controls.contentTierZero;

      this.contentTierZeroChecked.set(!!control.value);

      const subscription = control.valueChanges.subscribe((value) => {
        this.contentTierZeroChecked.set(!!value);
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  valueChanged(): void {
    this.onChange.emit();
  }
}

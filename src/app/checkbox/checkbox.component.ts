import {
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  viewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';
import { InputDescription } from '../_models';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly form = input<UntypedFormGroup | undefined>(undefined);
  readonly labelText = input<string>('');
  readonly group = input<string>('');
  readonly controlName = input<string>('');

  readonly baseInput = viewChild<ElementRef<HTMLInputElement>>('baseInput');

  readonly valueChanged = output<void>();
  readonly keySelectionMade = output<InputDescription>();

  private onModelChange: (value: unknown) => void = () => {
    // unimplemented
  };
  private onModelTouched: () => void = () => {
    // unimplemented
  };

  writeValue(): void {
    // unimplemented
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  onInputChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;

    this.onModelChange(inputEl.checked);
    this.onModelTouched();

    this.valueChanged.emit();
  }

  onSpaceKey(): void {
    this.keySelectionMade.emit({
      group: this.group(),
      controlName: this.controlName()
    });
  }
}

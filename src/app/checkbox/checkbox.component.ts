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
  form = input<UntypedFormGroup | undefined>(undefined);
  labelText = input<string>('');
  group = input<string>('');
  controlName = input<string>('');

  baseInput = viewChild<ElementRef<HTMLInputElement>>('baseInput');

  valueChanged = output<void>();
  keySelectionMade = output<InputDescription>();

  writeValue(): void {
    // unimplemented
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
    // unimplemented
  }

  onChange(): void {
    this.valueChanged.emit();
  }

  onSpaceKey(): void {
    this.keySelectionMade.emit({
      group: this.group(),
      controlName: this.controlName()
    });
  }
}

import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() form: FormGroup;
  @Input() labelText: string;
  @Input() group: string;
  @Input() controlName: string;

  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter();

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
}

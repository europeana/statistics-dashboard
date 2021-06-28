import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  @Input() form: FormGroup;
  @Input() labelText: string;
  @Input() group: string;
  @Input() value: string;
  @Input() controlName: string;

  @Output() valueChanged: EventEmitter<true> = new EventEmitter();

  instanceId = 0;

  constructor() {
    this.instanceId++;
  }

  changed(): void {
    this.valueChanged.emit(true);
  }
}

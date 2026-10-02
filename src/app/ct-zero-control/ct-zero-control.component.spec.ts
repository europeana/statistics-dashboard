import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CTZeroControlComponent } from './ct-zero-control.component';

describe('CTZeroControlComponent', () => {
  let component: CTZeroControlComponent;
  let fixture: ComponentFixture<CTZeroControlComponent>;
  let componentRef: ComponentRef<CTZeroControlComponent>;
  let mockForm: FormGroup<{ contentTierZero: FormControl<boolean> }>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CTZeroControlComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CTZeroControlComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    mockForm = new FormGroup({
      contentTierZero: new FormControl<boolean>(false, { nonNullable: true })
    });

    componentRef.setInput('form', mockForm);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should default disabled input to false', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should accept disabled input updates', () => {
      componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });
  });

  describe('Effects and Signal Synchronization', () => {
    it('should initialize contentTierZeroChecked signal with the initial form control value', () => {
      // Re-create component with a true initial value to verify initialization sync
      const trueForm = new FormGroup({
        contentTierZero: new FormControl<boolean>(true, { nonNullable: true })
      });

      const newFixture = TestBed.createComponent(CTZeroControlComponent);
      const newComponent = newFixture.componentInstance;

      newFixture.componentRef.setInput('form', trueForm);
      newFixture.detectChanges();

      expect(newComponent.contentTierZeroChecked()).toBe(true);
    });

    it('should update contentTierZeroChecked signal when form control value changes', () => {
      expect(component.contentTierZeroChecked()).toBe(false);

      mockForm.controls.contentTierZero.setValue(true);
      fixture.detectChanges();

      expect(component.contentTierZeroChecked()).toBe(true);
    });

    it('should safely coerce null/undefined form values to boolean false in the signal', () => {
      // Temporarily allow null by casting or creating a permissive control
      const nullableControl = mockForm.controls.contentTierZero as FormControl;
      nullableControl.setValue(null);
      fixture.detectChanges();

      expect(component.contentTierZeroChecked()).toBe(false);
    });
  });

  describe('Outputs', () => {
    it('should emit changed output when valueChanged() is invoked', () => {
      const emitSpy = jest.spyOn(component.changed, 'emit');
      component.valueChanged();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });
});

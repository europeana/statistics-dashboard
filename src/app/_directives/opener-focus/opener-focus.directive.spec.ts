import { Component, DebugElement } from '@angular/core';
import { NgIf } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OpenerFocusDirective } from '.';

@Component({
  imports: [OpenerFocusDirective, NgIf],
  template: `
    <div appOpenerFocus [fnHide]="fnHide">
      <a class="link1" tabindex="0"></a>
      <a class="link2" tabindex="0"></a>
    </div>
  `
})
class TestOpenerFocusDirectiveComponent {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fnHide(): void {}
}

describe('OpenerFocusDirective', () => {
  let fixture: ComponentFixture<TestOpenerFocusDirectiveComponent>;
  let testComponent: TestOpenerFocusDirectiveComponent;
  let cmp: DebugElement;
  let link1: DebugElement;
  let link2: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenerFocusDirective, TestOpenerFocusDirectiveComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestOpenerFocusDirectiveComponent);
    testComponent = fixture.componentInstance;
    cmp = fixture.debugElement.query(By.directive(OpenerFocusDirective));
    link1 = fixture.debugElement.query(By.css('.link1'));
    link2 = fixture.debugElement.query(By.css('.link2'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
  });

  it('should handle the escape key', () => {
    const spyFocus1 = jest.spyOn(link1.nativeElement, 'focus');
    const spyFocus2 = jest.spyOn(link2.nativeElement, 'focus');

    const spyHide = jest.fn();
    testComponent.fnHide = spyHide;

    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', {
      key: 'escape',
      bubbles: true
    });

    cmp.nativeElement.dispatchEvent(event);

    expect(spyHide).toHaveBeenCalled();
    expect(spyFocus1).toHaveBeenCalled();
    expect(spyFocus2).not.toHaveBeenCalled();
  });

  it('should handle the tab key', () => {
    const spyFocus = jest.spyOn(link1.nativeElement, 'focus');

    const getTabEvent = (): KeyboardEvent => {
      return new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true
      });
    };

    const event = getTabEvent();
    const spyPreventDefault = jest.spyOn(event, 'preventDefault');

    Object.defineProperty(event, 'target', {
      value: link2.nativeElement,
      enumerable: true
    });
    link2.nativeElement.dispatchEvent(event);

    expect(spyFocus).toHaveBeenCalled();
    expect(spyPreventDefault).toHaveBeenCalled();
  });
});

import { Component, DebugElement } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OpenerFocusDirective, TestOpenerFocusDirectiveComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestOpenerFocusDirectiveComponent);
    testComponent = fixture.componentInstance;
    cmp = fixture.debugElement.query(By.directive(OpenerFocusDirective));
    link1 = fixture.debugElement.query(By.css('.link1'));
    link2 = fixture.debugElement.query(By.css('.link2'));
    fixture.detectChanges();
  });

  it('it should create', () => {
    expect(testComponent).toBeTruthy();
  });

  it('it should handle the escape key', fakeAsync(() => {
    const spyFocus1 = jest.spyOn(link1.nativeElement, 'focus');
    const spyFocus2 = jest.spyOn(link2.nativeElement, 'focus');

    const spyHide = jest.spyOn(testComponent, 'fnHide');
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', {
      key: 'Escape'
    });
    cmp.nativeElement.dispatchEvent(event);
    tick(1);
    expect(spyHide).toHaveBeenCalled();
    expect(spyFocus1).toHaveBeenCalled();
    expect(spyFocus2).not.toHaveBeenCalled();
  }));

  it('it should handle the tab key', fakeAsync(() => {
    const spyFocus = jest.spyOn(link1.nativeElement, 'focus');

    const getTabEvent = (): KeyboardEvent => {
      return new KeyboardEvent('keydown', {
        key: 'tab',
        bubbles: true
      });
    };

    const event = getTabEvent();
    const spyPreventDefault = jest.spyOn(event, 'preventDefault');

    link2.nativeElement.dispatchEvent(event);

    expect(spyFocus).toHaveBeenCalled();
    expect(spyPreventDefault).toHaveBeenCalled();
  }));
});

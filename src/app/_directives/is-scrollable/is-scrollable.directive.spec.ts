import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { NgIf } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IsScrollableDirective } from '.';

@Component({
  imports: [IsScrollableDirective],
  template: `
    <div class="cmp">
      <div
        class="scrollable"
        appIsScrollable
        #scrollInfo="scrollInfo"
        id="scrollInfo"
      >
        <div></div>
      </div>
      <a class="back" (click)="scrollInfo.back()">BACK</a>
      <a class="fwd" (click)="scrollInfo.fwd()">FWD</a>
    </div>
  `,
  styles: ['.scrollable{ width: 100px; max-width: 100px; }']
})
class TestIsScrollableDirectiveComponent {}

describe('IsScrollableDirective', () => {
  let fixture: ComponentFixture<TestIsScrollableDirectiveComponent>;
  let btnFwd: DebugElement;
  let btnBack: DebugElement;
  let testComponent: TestIsScrollableDirectiveComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IsScrollableDirective, TestIsScrollableDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(TestIsScrollableDirectiveComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  const initButtons = (): void => {
    btnBack = fixture.debugElement.query(By.css('.back'));
    btnFwd = fixture.debugElement.query(By.css('.fwd'));
  };

  it('it should create', () => {
    expect(testComponent).toBeTruthy();
  });

  it('it should have scrollInfo', fakeAsync(() => {
    const cmp = fixture.debugElement.query(By.css('.cmp'));
    spyOn(cmp.nativeElement, 'scrollTo');
    initButtons();
    btnFwd.nativeElement.click();
    expect(cmp.nativeElement.scrollTo).toHaveBeenCalled();
    btnBack.nativeElement.click();
    expect(cmp.nativeElement.scrollTo).toHaveBeenCalledTimes(2);
  }));
});

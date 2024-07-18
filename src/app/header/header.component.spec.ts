import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ]
    }).compileComponents();
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu', () => {
    const isDisabled = false;
    const spyStopPropagation = jasmine.createSpy();
    const e = {
      target: {
        getAttribute: () => {
          return isDisabled;
        }
      } as unknown as HTMLElement,
      stopPropagation: spyStopPropagation
    } as unknown as MouseEvent;
    expect(component.menuIsOpen).toBeFalsy();
    component.toggleMenu(e);
    expect(component.menuIsOpen).toBeTruthy();
    component.toggleMenu(e);
    expect(component.menuIsOpen).toBeFalsy();
    expect(spyStopPropagation).toHaveBeenCalledTimes(2);
  });

  it('should close the menu when activeCountry is set', () => {
    component.menuIsOpen = true;
    expect(component.menuIsOpen).toBeTruthy();
    component.activeCountry = 'France';
    expect(component.menuIsOpen).toBeFalsy();
  });
});

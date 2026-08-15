import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { mockFilterStateService } from '../_mocked';
import { FilterStateService } from '../_services';
import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFilterState: any;

  const configureTestBed = (): void => {
    mockFilterState = mockFilterStateService();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: FilterStateService,
          useValue: mockFilterState
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
    const spyStopPropagation = jest.fn();
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

  it('should close the menu when activeCountry is set', fakeAsync(() => {
    component.menuIsOpen = true;
    expect(component.menuIsOpen).toBeTruthy();
    component.activeCountry.set('France');
    fixture.detectChanges();
    tick();
    expect(component.menuIsOpen).toBeFalsy();
  }));
});

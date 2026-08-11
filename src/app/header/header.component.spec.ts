import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
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

  it('should sort by the decoded country', () => {
    const unsorted = ['CZ', 'HR'];
    unsorted.sort(HeaderComponent.sortByDecodedCountryName);
    expect(unsorted[0]).toEqual('HR');
    expect(unsorted[1]).toEqual('CZ');
  });

  it('should work out the first-letter countries', () => {
    expect(
      Object.keys(component.countryFirstOfLetter).includes('XX')
    ).toBeFalsy();
    const mockData = { FR: 1, FI: 1, DE: 2, XX: 3 };
    const sortedMock = Object.keys(mockData)
      .sort(HeaderComponent.sortByDecodedCountryName)
      .reduce((ob, k) => {
        ob[k] = '' + mockData[k];
        return ob;
      }, {});

    component.countryTotalMap.set(sortedMock);

    expect(
      Object.values(component.countryFirstOfLetter()).filter((x) => !!x).length
    ).toEqual(3);
    expect(
      Object.keys(component.countryFirstOfLetter()).includes('XX')
    ).toBeTruthy();
  });
});

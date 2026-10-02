import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { mockFilterStateService } from '../_mocked';
import { FilterStateService } from '../_services';
import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockFilterState: ReturnType<typeof mockFilterStateService>;

  const configureTestBed = (): void => {
    mockFilterState = mockFilterStateService();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: FilterStateService, useValue: mockFilterState }
      ]
    }).compileComponents();
  };

  beforeEach(async () => {
    configureTestBed();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu', () => {
    const e = {
      target: { getAttribute: () => false } as unknown as HTMLElement,
      stopPropagation: jest.fn()
    } as unknown as MouseEvent;

    expect(component.menuIsOpen()).toBeFalsy();
    component.toggleMenu(e);
    expect(component.menuIsOpen()).toBeTruthy();
  });

  it('should close the menu when activeCountry is set', () => {
    component.menuIsOpen.set(true);
    expect(component.menuIsOpen()).toBeTruthy();

    // Mutate the dependency signal state tree
    mockFilterState.activeCountry.set('France');

    // Force a change detection sweep over the component instance
    // This synchronously processes the effect under a standard TestBed environment
    fixture.detectChanges();

    // Assert the reactive result cleanly
    expect(component.menuIsOpen()).toBeFalsy();
  });

  it('should focus the menu opener on keyboard toggle events', () => {
    const spyFocus = jest.fn();
    const mockElementRef = {
      nativeElement: { focus: spyFocus }
    } as unknown as ElementRef<HTMLElement>;

    Object.defineProperty(component, 'menuOpener', {
      writable: true,
      value: jest.fn().mockReturnValue(mockElementRef)
    });

    const e = {
      target: { getAttribute: () => false } as unknown as HTMLElement,
      stopPropagation: jest.fn()
    } as unknown as MouseEvent;

    component.toggleMenu(e, true);
    expect(spyFocus).toHaveBeenCalled();
  });
});

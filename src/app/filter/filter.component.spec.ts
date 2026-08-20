import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl
} from '@angular/forms';
import { toInputSafeName } from '../_helpers';
import { DimensionName } from '../_data';
import { RenameApiFacetPipe } from '../_translate';
import { CheckboxComponent } from '../checkbox';
import { FilterComponent } from '.';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  const dataOptions = {
    hasMore: false,
    options: [
      {
        name: 'name',
        label: 'label'
      }
    ]
  };

  const emptyOptions = { options: [], hasMore: false };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, FilterComponent],
      providers: [RenameApiFacetPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('group', '' as DimensionName);
    fixture.componentRef.setInput('state', { visible: false, disabled: false });
    fixture.componentRef.setInput('totalAvailable', 0);

    fixture.componentRef.setInput(
      'form',
      new UntypedFormBuilder().group({
        facetParameter: [],
        contentTierZero: [''],
        contentTier: [''],
        datasetId: [''],
        dateFrom: [''],
        dateTo: ['']
      })
    );

    const mockElementRef = {
      nativeElement: {
        focus: jest.fn()
      }
    } as unknown as ElementRef<HTMLElement>;

    Object.defineProperty(component, 'opener', {
      writable: true,
      value: jest.fn().mockReturnValue(mockElementRef)
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable when options are added', () => {
    expect(component.isDisabled()).toBeTruthy();

    fixture.componentRef.setInput('optionSet', emptyOptions);
    fixture.detectChanges();
    expect(component.isDisabled()).toBeTruthy();

    fixture.componentRef.setInput('optionSet', dataOptions);
    fixture.detectChanges();
    expect(component.isDisabled()).toBeFalsy();
  });

  it('should not disable the date if a range has been specified', () => {
    fixture.componentRef.setInput('emptyDataset', true);
    fixture.componentRef.setInput('group', 'dates' as DimensionName);
    expect(component.isDisabled()).toBeTruthy();

    component.form().get('dateFrom').setValue(new Date().toISOString());
    component.form().get('dateTo').setValue(new Date().toISOString());
    expect(component.isDisabled()).toBeFalsy();

    component.form().get('dateFrom').setValue(null);
    expect(component.isDisabled()).toBeTruthy();
  });

  it('should not disable on the basis of a filter', () => {
    fixture.componentRef.setInput('state', {
      visible: true,
      disabled: false
    });

    // Override structural computed signals cleanly for isolated state scenarios
    Object.defineProperty(component, 'empty', {
      writable: true,
      value: () => false
    });
    Object.defineProperty(component, 'emptyData', {
      writable: true,
      value: () => false
    });
    expect(component.isDisabled()).toBeFalsy();

    Object.defineProperty(component, 'empty', {
      writable: true,
      value: () => true
    });
    Object.defineProperty(component, 'emptyData', {
      writable: true,
      value: () => true
    });
    expect(component.isDisabled()).toBeTruthy();

    Object.defineProperty(component, 'emptyData', {
      writable: true,
      value: () => false
    });
    expect(component.isDisabled()).toBeTruthy();

    component.term.set('xxx');
    expect(component.isDisabled()).toBeTruthy();

    fixture.componentRef.setInput('state', {
      visible: false,
      disabled: false
    });
    expect(component.isDisabled()).toBeFalsy();
  });

  it('should determine if a select option is enabled', () => {
    expect(
      component.selectOptionEnabled(DimensionName.contentTier, '0')
    ).toBeFalsy();
    component.form().get('contentTierZero').setValue(true);
    expect(
      component.selectOptionEnabled(DimensionName.contentTier, '0')
    ).toBeTruthy();
    component.form().get('contentTierZero').setValue(true);
    expect(
      component.selectOptionEnabled(DimensionName.contentTier, '1')
    ).toBeTruthy();
  });

  it('should set the filter options', () => {
    const evt = {
      key: '1',
      target: {
        value: 'option_1'
      }
    };

    fixture.componentRef.setInput('state', {
      visible: false,
      disabled: false
    });

    expect(component.optionSet()).toBeFalsy();
    component.filterOptions(evt);
    expect(component.optionSet()).toBeFalsy();

    fixture.componentRef.setInput('optionSet', {
      options: [{ name: 'option_1', label: 'option_1' }]
    });
    fixture.detectChanges();

    component.filterOptions(evt);
    expect(component.optionSet().options.length).toEqual(1);

    const spyHide = jest.spyOn(component, 'hide');
    component.filterOptions(evt);
    expect(spyHide).not.toHaveBeenCalled();

    const mockElementRef = {
      nativeElement: {
        focus: jest.fn()
      }
    } as unknown as ElementRef<HTMLElement>;

    Object.defineProperty(component, 'opener', {
      writable: true,
      value: jest.fn().mockReturnValue(mockElementRef)
    });

    evt.key = 'Escape';
    component.filterOptions(evt);
    expect(spyHide).toHaveBeenCalled();
  });

  it('should reapply the focus', async () => {
    const spyFocus = jest.fn();
    const spyFilterTermFocus = jest.fn();

    const mockFilterTerm = {
      nativeElement: {
        focus: spyFilterTermFocus
      }
    } as unknown as ElementRef<HTMLInputElement>;

    const mockCheckboxes = {
      find: (_: CheckboxComponent) => {
        return {
          group: () => '',
          controlName: () => '',
          baseInput: () => ({
            nativeElement: {
              focus: spyFocus
            }
          })
        } as unknown as CheckboxComponent;
      }
    } as unknown as readonly CheckboxComponent[];

    Object.defineProperty(component, 'checkboxes', {
      writable: true,
      value: jest.fn().mockReturnValue(mockCheckboxes)
    });
    Object.defineProperty(component, 'filterTerm', {
      writable: true,
      value: jest.fn().mockReturnValue(mockFilterTerm)
    });

    fixture.componentRef.setInput('state', {
      visible: true,
      disabled: true
    });

    fixture.componentRef.setInput('optionSet', {
      options: [{ name: 'option_1', label: 'option_1' }]
    });

    fixture.detectChanges();

    expect(spyFocus).not.toHaveBeenCalled();
    expect(spyFilterTermFocus).toHaveBeenCalled();

    spyFilterTermFocus.mockClear();

    component.inputToFocus.set({ group: '', controlName: '' });

    await Promise.resolve();

    fixture.componentRef.setInput('optionSet', {
      options: [{ name: 'option_2', label: 'option_2' }]
    });

    fixture.detectChanges();

    expect(spyFocus).toHaveBeenCalled();
    expect(component.inputToFocus()).toBeFalsy();
  });

  it('should get the values', () => {
    const createFormControls = (
      grp: DimensionName,
      ops: Array<string>
    ): Array<UntypedFormControl> => {
      const fGroup = new UntypedFormBuilder().group({});
      expect(component.getSetCheckboxValues(grp).length).toBe(0);
      component.form().addControl(grp, fGroup);
      const res = [];
      ops.forEach((s: string) => {
        fGroup.addControl(s, new UntypedFormControl(false));
        const ctrl = component.form().get(`${grp}.${s}`) as UntypedFormControl;
        ctrl.setValue(true);
        res.push(ctrl);
      });
      return res;
    };

    createFormControls(DimensionName.country, ['BE', 'DE', 'IT']);
    expect(component.getSetCheckboxValues(DimensionName.country)).toEqual(
      'Belgium, Germany, Italy'
    );

    fixture.componentRef.setInput('tierPrefix', 'Tier ');

    createFormControls(DimensionName.metadataTier, ['aaa', 'bbb']);
    expect(component.getSetCheckboxValues(DimensionName.metadataTier)).toEqual(
      'aaa, bbb'
    );

    fixture.componentRef.setInput('group', DimensionName.metadataTier);
    expect(component.getSetCheckboxValues(DimensionName.metadataTier)).toEqual(
      'Tier aaa, Tier bbb'
    );

    fixture.componentRef.setInput('group', DimensionName.provider);
    createFormControls(DimensionName.provider, ['Europeana']);
    expect(component.getSetCheckboxValues(DimensionName.provider)).toEqual(
      'Europeana'
    );

    fixture.componentRef.setInput('group', DimensionName.rightsCategory);

    createFormControls(DimensionName.rightsCategory, [
      'xxx',
      toInputSafeName('CC BY-ND')
    ]);
    expect(
      component.getSetCheckboxValues(DimensionName.rightsCategory)
    ).toEqual('xxx, CC BY-ND');
  });

  it('should signal changes', () => {
    const spyEmit = jest.spyOn(component.valueChanged, 'emit');
    component.changed();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should hide', () => {
    fixture.componentRef.setInput('state', { visible: true, disabled: false });
    fixture.detectChanges();

    component.hide();
    fixture.detectChanges();

    expect(component.state().visible).toBeFalsy();
  });

  it('should toggle', () => {
    fixture.componentRef.setInput('state', { disabled: false, visible: true });
    fixture.detectChanges();
    expect(component.state().visible).toBeTruthy();

    component.toggle();
    expect(component.state().visible).toBeFalsy();

    component.toggle();
    expect(component.state().visible).toBeTruthy();

    component.toggle();
    expect(component.state().visible).toBeFalsy();
  });

  it('should bind to the key selection', () => {
    expect(component.inputToFocus()).toBeFalsy();
    component.onKeySelectionMade({ controlName: '', group: '' });
    expect(component.inputToFocus()).toBeTruthy();
  });

  it('should load more', () => {
    const spyEmit = jest.spyOn(component.filterTermChanged, 'emit');

    expect(component.pagesVisible()).toEqual(1);

    component.loadMore();

    expect(spyEmit).toHaveBeenCalled();
    expect(component.pagesVisible()).toEqual(2);
  });
});

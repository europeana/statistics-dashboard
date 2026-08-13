import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, FilterComponent],
      providers: [RenameApiFacetPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
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

    component.opener = {
      nativeElement: {
        focus: jest.fn()
      }
    } as unknown as ElementRef;
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

  it('should track when the filter is empty and the data is empty', () => {
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();

    fixture.componentRef.setInput('optionSet', emptyOptions);
    fixture.detectChanges();
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();

    component.term = '';
    fixture.componentRef.setInput('optionSet', dataOptions);
    fixture.detectChanges();
    expect(component.empty).toBeFalsy();
    expect(component.emptyData).toBeFalsy();

    component.term = 'xxx';
    // Re-feed the signal reference to force the effect to evaluate again
    fixture.componentRef.setInput('optionSet', { ...dataOptions });
    fixture.detectChanges();
    expect(component.empty).toBeFalsy();
    expect(component.emptyData).toBeFalsy();
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

  it('should not disable the on the basis of a filter', () => {
    fixture.componentRef.setInput('state', {
      visible: true,
      disabled: false
    });

    component.empty = false;
    component.emptyData = false;
    expect(component.isDisabled()).toBeFalsy();

    component.empty = true;
    component.emptyData = true;
    expect(component.isDisabled()).toBeTruthy();

    component.emptyData = false;
    expect(component.isDisabled()).toBeTruthy();

    component.term = 'xxx';
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

    component.opener = {
      nativeElement: {
        focus: jest.fn()
      }
    } as unknown as ElementRef;

    evt.key = 'Escape';
    component.filterOptions(evt);
    expect(spyHide).toHaveBeenCalled();
  });

  it('should reapply the focus', fakeAsync(() => {
    const spyFocus = jest.fn();
    const spyFilterTermFocus = jest.fn();

    const mockFilterTerm = {
      nativeElement: {
        focus: spyFilterTermFocus
      }
    } as unknown as ElementRef;

    const mockCheckboxes = {
      find: (_: CheckboxComponent) => {
        return {
          baseInput: {
            nativeElement: {
              focus: spyFocus
            }
          }
        } as unknown as CheckboxComponent;
      }
    } as unknown as QueryList<CheckboxComponent>;

    component.filterTerm = mockFilterTerm;
    component.checkboxes = mockCheckboxes;

    fixture.componentRef.setInput('state', {
      visible: true,
      disabled: true
    });

    fixture.componentRef.setInput('optionSet', {
      options: [{ name: 'option_1', label: 'option_1' }]
    });

    fixture.detectChanges();

    component.filterTerm = mockFilterTerm;
    component.checkboxes = mockCheckboxes;

    expect(spyFocus).not.toHaveBeenCalled();

    tick();

    expect(spyFocus).not.toHaveBeenCalled();
    expect(spyFilterTermFocus).toHaveBeenCalled();

    // Reset mock tracking counts for the next verification step
    spyFilterTermFocus.mockClear();

    component.inputToFocus = { group: '', controlName: '' };
    fixture.componentRef.setInput('optionSet', {
      options: [{ name: 'option_2', label: 'option_2' }]
    });

    fixture.detectChanges();

    // Re-apply once more before ticking the final macro-task queue loop
    component.filterTerm = mockFilterTerm;
    component.checkboxes = mockCheckboxes;

    tick();
    expect(spyFocus).toHaveBeenCalled();
    expect(component.inputToFocus).toBeFalsy();
    expect(spyFilterTermFocus).not.toHaveBeenCalled();
  }));

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

    component.tierPrefix = 'Tier ';

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

    // Read the signal output as a function invocation
    expect(component.state().visible).toBeFalsy();
  });

  it('should toggle', fakeAsync(() => {
    fixture.componentRef.setInput('state', { disabled: false, visible: true });
    fixture.detectChanges();
    expect(component.state().visible).toBeTruthy();
    component.toggle();
    tick(1);
    expect(component.state().visible).toBeFalsy();
    component.toggle();
    tick(1);
    expect(component.state().visible).toBeTruthy();
    component.toggle();
    tick(1);
    expect(component.state().visible).toBeFalsy();
  }));

  it('should bind to the key selection', () => {
    expect(component.inputToFocus).toBeFalsy();
    component.onKeySelectionMade({ controlName: '', group: '' });
    expect(component.inputToFocus).toBeTruthy();
  });

  it('should load more', () => {
    const spyEmit = jest.spyOn(component.filterTermChanged, 'emit');

    expect(component.pagesVisible).toEqual(1);

    component.loadMore();

    expect(spyEmit).toHaveBeenCalled();
    expect(component.pagesVisible).toEqual(2);
  });
});

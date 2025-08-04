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
import { DimensionName } from '../_models';
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
    component.form = new UntypedFormBuilder().group({
      facetParameter: [],
      contentTierZero: [''],
      contentTier: [''],
      datasetId: [''],
      dateFrom: [''],
      dateTo: ['']
    });

    component.opener = {
      nativeElement: {
        focus: jasmine.createSpy()
      }
    } as unknown as ElementRef;
  });

  it('should enable when options are added', () => {
    expect(component.isDisabled()).toBeTruthy();
    component.optionSet = emptyOptions;
    expect(component.isDisabled()).toBeTruthy();
    component.optionSet = dataOptions;
    expect(component.isDisabled()).toBeFalsy();
  });

  it('should track when the filter is empty and the data is empty', () => {
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();
    component.optionSet = emptyOptions;
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();

    component.term = '';
    component.optionSet = dataOptions;
    expect(component.empty).toBeFalsy();
    expect(component.emptyData).toBeFalsy();

    component.term = 'xxx';
    component.optionSet = dataOptions;
    expect(component.empty).toBeFalsy();
    expect(component.emptyData).toBeFalsy();
  });

  it('should not disable the date if a range has been specified', () => {
    component.emptyDataset = true;
    component.group = 'dates' as DimensionName;
    expect(component.isDisabled()).toBeTruthy();

    component.form.get('dateFrom').setValue(new Date().toISOString());
    component.form.get('dateTo').setValue(new Date().toISOString());
    expect(component.isDisabled()).toBeFalsy();

    component.form.get('dateFrom').setValue(null);
    expect(component.isDisabled()).toBeTruthy();
  });

  it('should not disable the on the basis of a filter', () => {
    component.state = {
      visible: true,
      disabled: false
    };

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

    component.state.visible = false;
    expect(component.isDisabled()).toBeFalsy();
  });

  it('should determine if a select option is enabled', () => {
    expect(
      component.selectOptionEnabled(DimensionName.contentTier, '0')
    ).toBeFalsy();
    component.form.get('contentTierZero').setValue(true);
    expect(
      component.selectOptionEnabled(DimensionName.contentTier, '0')
    ).toBeTruthy();
    component.form.get('contentTierZero').setValue(true);
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
    expect(component.optionSet).toBeFalsy();
    component.filterOptions(evt);
    expect(component.optionSet).toBeFalsy();

    component.optionSet = {
      options: [{ name: 'option_1', label: 'option_1' }]
    };
    component.filterOptions(evt);
    expect(component.optionSet.options.length).toEqual(1);

    spyOn(component, 'hide');
    component.filterOptions(evt);
    expect(component.hide).not.toHaveBeenCalled();

    evt.key = 'Escape';
    component.filterOptions(evt);
    expect(component.hide).toHaveBeenCalled();
  });

  it('should reapply the focus', fakeAsync(() => {
    const spyFocus = jasmine.createSpy();

    component.state = { disabled: false, visible: true };
    component.filterTerm = {
      nativeElement: {
        focus: jasmine.createSpy()
      }
    };
    component.checkboxes = {
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
    component.optionSet = {
      options: [{ name: 'option_1', label: 'option_1' }]
    };
    expect(spyFocus).not.toHaveBeenCalled();
    tick();
    expect(spyFocus).not.toHaveBeenCalled();
    expect(spyFocus).not.toHaveBeenCalled();
    expect(component.filterTerm.nativeElement.focus).toHaveBeenCalled();

    component.inputToFocus = { group: '', controlName: '' };
    component.optionSet = {
      options: [{ name: 'option_2', label: 'option_2' }]
    };
    tick();
    expect(spyFocus).toHaveBeenCalled();
    expect(component.inputToFocus).toBeFalsy();
    expect(component.filterTerm.nativeElement.focus).toHaveBeenCalledTimes(1);
  }));

  it('should get the values', () => {
    const createFormControls = (
      grp: DimensionName,
      ops: Array<string>
    ): Array<UntypedFormControl> => {
      const fGroup = new UntypedFormBuilder().group({});
      expect(component.getSetCheckboxValues(grp).length).toBe(0);
      component.form.addControl(grp, fGroup);
      const res = [];
      ops.forEach((s: string) => {
        fGroup.addControl(s, new UntypedFormControl(false));
        const ctrl = component.form.get(`${grp}.${s}`) as UntypedFormControl;
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

    component.group = DimensionName.metadataTier;
    expect(component.getSetCheckboxValues(DimensionName.metadataTier)).toEqual(
      'Tier aaa, Tier bbb'
    );

    component.group = DimensionName.provider;
    createFormControls(DimensionName.provider, ['Europeana']);
    expect(component.getSetCheckboxValues(DimensionName.provider)).toEqual(
      'Europeana'
    );

    component.group = DimensionName.rightsCategory;
    createFormControls(DimensionName.rightsCategory, [
      'xxx',
      toInputSafeName('CC BY-ND')
    ]);
    expect(
      component.getSetCheckboxValues(DimensionName.rightsCategory)
    ).toEqual('xxx, CC BY-ND');
  });

  it('should signal changes', () => {
    spyOn(component.valueChanged, 'emit');
    component.changed();
    expect(component.valueChanged.emit).toHaveBeenCalled();
  });

  it('should hide', () => {
    component.state = { disabled: false, visible: true };
    expect(component.state.visible).toBeTruthy();
    component.hide();
    expect(component.state.visible).toBeFalsy();
  });

  it('should toggle', fakeAsync(() => {
    component.state = { disabled: false, visible: true };
    expect(component.state.visible).toBeTruthy();
    component.toggle();
    tick(1);
    expect(component.state.visible).toBeFalsy();
    component.toggle();
    tick(1);
    expect(component.state.visible).toBeTruthy();
    component.toggle();
    tick(1);
    expect(component.state.visible).toBeFalsy();
  }));

  it('should bind to the key selection', () => {
    expect(component.inputToFocus).toBeFalsy();
    component.onKeySelectionMade({ controlName: '', group: '' });
    expect(component.inputToFocus).toBeTruthy();
  });

  it('should load more', () => {
    spyOn(component.filterTermChanged, 'emit');

    expect(component.pagesVisible).toEqual(1);

    component.loadMore();

    expect(component.filterTermChanged.emit).toHaveBeenCalled();
    expect(component.pagesVisible).toEqual(2);
  });
});

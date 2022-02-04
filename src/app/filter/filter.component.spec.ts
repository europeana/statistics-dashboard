import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { toInputSafeName } from '../_helpers';
import { createMockPipe } from '../_mocked';
import { DimensionName } from '../_models';

import { FilterComponent } from '.';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  const dataOptions = [
    {
      name: 'name',
      label: 'label'
    }
  ];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [
          FilterComponent,
          createMockPipe('renameApiFacet'),
          createMockPipe('renameRights')
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group({
      facetParameter: [],
      contentTierZero: [''],
      contentTier: [''],
      datasetId: [''],
      dateFrom: [''],
      dateTo: ['']
    });
    fixture.detectChanges();
  });

  it('should enable when options are added', () => {
    expect(component.isDisabled()).toBeTruthy();
    component.options = [];
    expect(component.isDisabled()).toBeTruthy();
    component.options = dataOptions;
    expect(component.isDisabled()).toBeFalsy();
  });

  it('should track when the filter is empty and the data is empty', () => {
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();
    component.options = [];
    expect(component.empty).toBeTruthy();
    expect(component.emptyData).toBeTruthy();

    component.term = '';
    component.options = dataOptions;
    expect(component.empty).toBeFalsy();
    expect(component.emptyData).toBeFalsy();

    component.term = 'xxx';
    component.options = dataOptions;
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
      target: {
        value: 'option_1'
      }
    };
    expect(component.options).toBeFalsy();
    component.filterOptions(evt);
    expect(component.options).toBeFalsy();
    component.options = [{ name: 'option_1', label: 'option_1' }];
    component.filterOptions(evt);
    expect(component.options.length).toEqual(1);
  });

  it('should get the values', () => {
    const createFormControls = (
      grp: DimensionName,
      ops: Array<string>
    ): Array<FormControl> => {
      const fGroup = new FormBuilder().group({});
      expect(component.getSetCheckboxValues(grp).length).toBe(0);
      component.form.addControl(grp, fGroup);
      const res = [];
      ops.forEach((s: string) => {
        fGroup.addControl(s, new FormControl(false));
        const ctrl = component.form.get(`${grp}.${s}`) as FormControl;
        ctrl.setValue(true);
        res.push(ctrl);
      });
      return res;
    };

    createFormControls(DimensionName.country, ['xxx', 'yyy', 'zzz']);
    expect(component.getSetCheckboxValues(DimensionName.country)).toEqual(
      'xxx, yyy, zzz'
    );

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

    component.group = DimensionName.rights;
    createFormControls(DimensionName.rights, [
      'xxx',
      toInputSafeName('//creativecommons.org/licenses/by-nc-nd')
    ]);
    expect(component.getSetCheckboxValues(DimensionName.rights)).toEqual(
      'xxx, CC BY-NC-ND'
    );
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
    let hasCalledFocus = false;
    component.state = { disabled: false, visible: true };
    expect(component.state.visible).toBeTruthy();
    component.toggle();
    tick(1);
    expect(component.state.visible).toBeFalsy();
    component.toggle();
    tick(1);
    expect(component.state.visible).toBeTruthy();

    component.filterTerm = {
      nativeElement: {
        focus: (): void => {
          hasCalledFocus = true;
        }
      }
    };

    component.toggle();
    tick(1);
    expect(component.state.visible).toBeFalsy();
    expect(hasCalledFocus).toBeFalsy();

    component.toggle();
    tick(1);
    expect(component.state.visible).toBeTruthy();
    expect(hasCalledFocus).toBeTruthy();
  }));
});

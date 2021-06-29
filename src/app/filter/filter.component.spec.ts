import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { toInputSafeName } from '../_helpers';
import { createMockPipe } from '../_mocked';

import { FilterComponent } from '.';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        FilterComponent,
        createMockPipe('renameApiFacet'),
        createMockPipe('renameRights')
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group({
      facetParameter: [],
      contentTierZero: [''],
      contentTier: [''],
      showPercent: [false],
      datasetName: [''],
      dateFrom: [''],
      dateTo: ['']
    });
    fixture.detectChanges();
  });

  it('should determine if a select option is enabled', () => {
    expect(component.selectOptionEnabled('contentTier', '0')).toBeFalsy();
    component.form.get('contentTierZero').setValue(true);
    expect(component.selectOptionEnabled('contentTier', '0')).toBeTruthy();
    component.form.get('contentTierZero').setValue(true);
    expect(component.selectOptionEnabled('contentTier', '1')).toBeTruthy();
  });

  it('should set the filter options', () => {
    const evt = {
      target: {
        value: 'option_1'
      }
    };
    expect(component.filteredOptions).toBeFalsy();
    component.filterOptions(evt);
    expect(component.filteredOptions).toBeFalsy();
    component.options = [{ name: 'option_1', label: 'option_1' }];
    component.filterOptions(evt);
    expect(component.filteredOptions.length).toEqual(1);
  });

  it('should get the values', () => {
    const createFormControls = (
      grp: string,
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

    createFormControls('COUNTRY', ['xxx', 'yyy', 'zzz']);
    expect(component.getSetCheckboxValues('COUNTRY')).toEqual('xxx, yyy, zzz');

    createFormControls('metadataTier', ['aaa', 'bbb']);
    expect(component.getSetCheckboxValues('metadataTier')).toEqual('aaa, bbb');

    component.group = 'metadataTier';
    expect(component.getSetCheckboxValues('metadataTier')).toEqual(
      'Tier aaa, Tier bbb'
    );

    component.group = 'PROVIDER';
    createFormControls('PROVIDER', ['Europeana']);
    expect(component.getSetCheckboxValues('PROVIDER')).toEqual('Europeana');

    component.group = 'RIGHTS';
    createFormControls('RIGHTS', [
      'xxx',
      toInputSafeName('//creativecommons.org/licenses/by-nc-nd')
    ]);
    expect(component.getSetCheckboxValues('RIGHTS')).toEqual(
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

  it('should toggle', () => {
    component.state = { disabled: false, visible: true };
    expect(component.state.visible).toBeTruthy();
    component.toggle();
    expect(component.state.visible).toBeFalsy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { FilterComponent } from '.';

describe('OverviewComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group({
      facetParameter: [],
      contentTierZero: [false],
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
});

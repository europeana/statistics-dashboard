import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompareDataDescriptor, DimensionName, SortBy } from '../_models';
import { SnapshotsComponent } from '.';

describe('SnapshotsComponent', () => {
  let component: SnapshotsComponent;
  let fixture: ComponentFixture<SnapshotsComponent>;

  const dscContentTier: CompareDataDescriptor = {
    name: '',
    label: 'All (contentTier)',
    data: { 3: 6040254, 1: 16710922, 2: 11542267, 4: 18293692 },
    dataPercent: { 1: 31.78, 2: 21.95, 3: 11.49, 4: 34.79 },
    applied: true,
    orderOriginal: [],
    orderPreferred: [],
    pinIndex: 1,
    portalUrls: {},
    saved: true,
    total: 52587135,
    current: true
  };

  const dscContentTierQueried: CompareDataDescriptor = Object.assign(
    Object.assign({}, dscContentTier),
    {
      name: 'countryLuxembourg',
      label: 'country (Luxembourg)',
      pinIndex: 0
    }
  );

  const dscCountry: CompareDataDescriptor = {
    name: '',
    label: 'All (country)',
    data: { Germany: 5, Italy: 4, Hungary: 7, Slovenia: 18 },
    dataPercent: {
      Germany: 14.7,
      Italy: 11.76,
      Hungary: 20.58,
      Slovenia: 52.94
    },
    applied: true,
    orderOriginal: [],
    orderPreferred: [],
    pinIndex: 2,
    portalUrls: {},
    saved: true,
    total: 34,
    current: true
  };

  const dscRights: CompareDataDescriptor = {
    name: '',
    label: 'All (rights)',
    data: { CC0: 1, CC1: 1 },
    dataPercent: { CC0: 50, CC1: 50 },
    applied: false,
    orderOriginal: [],
    orderPreferred: [],
    pinIndex: 3,
    portalUrls: {},
    saved: true,
    total: 2,
    current: true
  };

  const initData = (): void => {
    const cds = {};
    cds[DimensionName.contentTier] = {
      '': dscContentTier,
      countryLuxembourg: dscContentTierQueried
    };

    cds[DimensionName.rights] = {
      '': dscRights
    };
    component.facetName = DimensionName.contentTier;
    component.compareDataAllFacets = cds;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [SnapshotsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotsComponent);
    component = fixture.componentInstance;
    component.facetName = DimensionName.contentTier;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the facetName', () => {
    dscContentTier.applied = true;
    initData();
    component.facetName = DimensionName.country;
    expect(dscContentTier.applied).toBeFalsy();
  });

  it('should (get) the filter CD Keys)', () => {
    dscContentTier.applied = true;
    expect(
      component.filteredCDKeys(DimensionName.contentTier, 'applied').length
    ).toBeFalsy();
    component.compareDataAllFacets[DimensionName.contentTier] = {
      '': dscContentTier
    };
    component.facetName = DimensionName.contentTier;
    expect(
      component.filteredCDKeys(DimensionName.contentTier, 'applied').length
    ).toBeTruthy();
  });

  it('should pre-sort', () => {
    initData();

    component.preSortAndFilter(DimensionName.contentTier, [''], {
      by: SortBy.name,
      dir: -1
    });

    expect(dscContentTier.orderPreferred[0].trim()).toEqual('4');

    component.preSortAndFilter(DimensionName.contentTier, [''], {
      by: SortBy.name,
      dir: 1
    });

    expect(dscContentTier.orderPreferred[0].trim()).toEqual('1');

    component.preSortAndFilter(DimensionName.contentTier, [''], {
      by: SortBy.count,
      dir: 1
    });

    expect(dscContentTier.orderPreferred[0].trim()).toEqual('3');

    component.preSortAndFilter(DimensionName.contentTier, [''], {
      by: SortBy.count,
      dir: -1
    });

    expect(dscContentTier.orderPreferred[0].trim()).toEqual('4');
    expect(dscRights.orderPreferred.length).toBeFalsy();

    component.preSortAndFilter(DimensionName.rights, [''], {
      by: SortBy.count,
      dir: -1
    });

    expect(dscRights.orderPreferred[0].trim()).toEqual('CC0');

    component.preSortAndFilter(DimensionName.rights, [''], {
      by: SortBy.count,
      dir: 0
    });
    expect(dscRights.orderPreferred.length).toBeFalsy();
  });

  it('should get series data for the chart', () => {
    initData();
    expect(
      component.getSeriesDataForChart(
        DimensionName.contentTier,
        [''],
        false,
        0,
        50
      )
    ).toBeTruthy();
    expect(
      component.getSeriesDataForChart(
        DimensionName.contentTier,
        [''],
        true,
        0,
        50
      )
    ).toBeTruthy();
  });

  it('should get series data for the grid', () => {
    initData();
    expect(
      component.getSeriesDataForGrid(DimensionName.contentTier, [''])
    ).toBeTruthy();
  });

  it('should snap', () => {
    dscContentTier.applied = false;
    component.snap(DimensionName.country, '', dscCountry);
    expect(dscCountry.applied).toBeTruthy();
  });

  it('should sort the keys', () => {
    initData();
    expect(component.getSortKeys(['']).length).toEqual(1);
    expect(component.getSortKeys(['countryLuxembourg', '']).length).toEqual(2);
  });

  it('should toggle saved', () => {
    initData();
    dscContentTier.saved = true;
    component.toggleSaved('');
    expect(dscContentTier.saved).toBeFalsy();
    component.toggleSaved('');
    expect(dscContentTier.saved).toBeTruthy();

    spyOn(component.hideItem, 'emit');
    dscContentTier.current = true;
    component.toggleSaved('');
    expect(component.hideItem.emit).toHaveBeenCalled();
    dscContentTier.current = false;
    component.toggleSaved('');
    expect(component.hideItem.emit).toHaveBeenCalledTimes(1);
  });

  it('should toggle', () => {
    initData();
    dscContentTier.applied = true;
    spyOn(component.hideItem, 'emit');
    spyOn(component.showItems, 'emit');
    component.toggle('');
    expect(component.hideItem.emit).toHaveBeenCalled();
    expect(component.showItems.emit).not.toHaveBeenCalled();
    component.toggle('', true);
    expect(component.hideItem.emit).toHaveBeenCalledTimes(1);
    expect(component.showItems.emit).not.toHaveBeenCalled();
    dscContentTier.applied = false;
    component.toggle('');
    expect(component.hideItem.emit).toHaveBeenCalledTimes(1);
    expect(component.showItems.emit).toHaveBeenCalled();
  });

  it('should apply and unapply', () => {
    initData();
    component.apply(DimensionName.contentTier, ['']);
    expect(dscContentTier.applied).toBeTruthy();
    component.unapply('');
    expect(dscContentTier.applied).toBeFalsy();
    component.apply(DimensionName.contentTier, ['']);
    expect(dscContentTier.applied).toBeTruthy();
  });
});

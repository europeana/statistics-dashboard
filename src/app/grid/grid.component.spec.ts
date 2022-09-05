import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { createMockPipe, MockAPIService } from '../_mocked';
import { DimensionName, PagerInfo, SortBy, TableRow } from '../_models';
import { APIService } from '../_services';
import { GridPaginatorComponent } from '../grid-paginator';
import { GridComponent } from '.';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let api: APIService;
  const testRows = [
    {
      name: 'A',
      count: 1,
      percent: 2,
      portalUrlInfo: {
        href: ''
      }
    },
    {
      name: 'B',
      count: 2,
      percent: 2,
      portalUrlInfo: {
        href: ''
      }
    },
    {
      name: 'B',
      count: 3,
      percent: 1,
      isTotal: true,
      portalUrlInfo: {
        href: ''
      }
    },
    {
      name: 'C',
      count: 0,
      percent: 1,
      portalUrlInfo: {
        href: ''
      }
    },
    {
      name: 'D',
      count: 2,
      percent: 1,
      portalUrlInfo: {
        href: ''
      }
    }
  ] as Array<TableRow>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        createMockPipe('renameApiFacet'),
        GridComponent,
        GridPaginatorComponent
      ],
      providers: [
        {
          provide: APIService,
          useClass: MockAPIService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    api = TestBed.inject(APIService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply highlights', () => {
    const rows = testRows.slice(0);
    rows.forEach((row: TableRow) => {
      if (row.name !== 'B') {
        delete row.displayIndex;
        expect(row.displayIndex).toBeFalsy();
      }
    });

    component.applyHighlights(rows);
    rows.forEach((row: TableRow) => {
      if (row.name !== 'B') {
        expect(row.displayIndex).toBeTruthy();
      }
    });
  });

  it('should bump the sort state', () => {
    expect(component.sortInfo.dir).toEqual(-1);
    component.bumpSortState(SortBy.count);
    expect(component.sortInfo.dir).toEqual(0);
    component.bumpSortState(SortBy.count);
    expect(component.sortInfo.dir).toEqual(1);
    component.bumpSortState(SortBy.count);
    expect(component.sortInfo.dir).toEqual(-1);
    expect(component.sortInfo.by).toBe(SortBy.count);

    component.bumpSortState(SortBy.name);
    expect(component.sortInfo.by).toBe(SortBy.name);
  });

  it('should click the link out', fakeAsync(() => {
    spyOn(api, 'getRightsCategoryUrls').and.callThrough();
    spyOn(window, 'open').and.callFake(() => {
      return { location: { href: '' } } as unknown as Window;
    });

    const mockTableRow = {
      name: 'test',
      count: 1,
      percent: 1,
      portalUrlInfo: {
        href: 'http://www.europeana.eu?query=*'
      }
    } as TableRow;
    component.loadFullLink(mockTableRow);
    tick();

    // test urls for rightsCategory facet

    expect(api.getRightsCategoryUrls).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();

    component.facet = DimensionName.rightsCategory;
    component.loadFullLink(mockTableRow);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();

    mockTableRow.portalUrlInfo.hrefRewritten = false;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalledTimes(2);
    expect(window.open).toHaveBeenCalled();
    expect(mockTableRow.portalUrlInfo.hrefRewritten).toBeTruthy();

    component.loadFullLink(mockTableRow, true);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalledTimes(2);
    expect(window.open).toHaveBeenCalledTimes(1);

    mockTableRow.portalUrlInfo.hrefRewritten = false;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalledTimes(3);
    expect(window.open).toHaveBeenCalledTimes(2);

    // test urls for rightsCategory filters

    component.facet = DimensionName.contentTier;
    mockTableRow.portalUrlInfo.hrefRewritten = false;
    mockTableRow.portalUrlInfo.rightsFilters = ['CC0'];

    component.loadFullLink(mockTableRow, false);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalledTimes(4);
    expect(window.open).toHaveBeenCalledTimes(2);

    // test normal links work correctly (normal behaviour - doesn't invoke open)

    component.facet = DimensionName.country;
    mockTableRow.portalUrlInfo.hrefRewritten = false;
    delete mockTableRow.portalUrlInfo.rightsFilters;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(window.open).toHaveBeenCalledTimes(2);

    // another test of the rightsCategory filter

    mockTableRow.portalUrlInfo.rightsFilters = ['In Copyright'];
    mockTableRow.portalUrlInfo.hrefRewritten = false;

    component.loadFullLink(mockTableRow, true);
    tick();

    expect(api.getRightsCategoryUrls).toHaveBeenCalledTimes(5);
    expect(window.open).toHaveBeenCalledTimes(3);
  }));

  it('should get the data', () => {
    expect(component.getData()).toBeTruthy();
  });

  it('should get the prefix', () => {
    const tierPrefix = 'Tier Prefix ';
    component.tierPrefix = tierPrefix;
    expect(component.getPrefix()).toEqual('');
    component.facet = DimensionName.contentTier;
    expect(component.getPrefix()).toEqual(tierPrefix);
  });

  it('should go to the page', fakeAsync(() => {
    component.setRows(testRows.slice(0));
    fixture.detectChanges();
    expect(component.paginator).toBeFalsy();
    component.isVisible = true;
    fixture.detectChanges();
    expect(component.paginator).toBeTruthy();
    tick(1);
    spyOn(component.paginator, 'setPage');
    component.goToPage({ key: '99' } as unknown as KeyboardEvent);
    component.goToPage({
      key: 'Enter',
      target: { value: 'a' }
    } as unknown as KeyboardEvent);
    expect(component.paginator.setPage).not.toHaveBeenCalled();
    component.goToPage({ key: '99' } as unknown as KeyboardEvent);
    component.goToPage({
      key: 'Enter',
      target: { value: '99' }
    } as unknown as KeyboardEvent);
    expect(component.paginator.setPage).toHaveBeenCalledWith(0);
  }));

  it('should set the page info', fakeAsync(() => {
    spyOn(component.chartPositionChanged, 'emit');
    component.setPagerInfo({} as PagerInfo);
    tick();
    expect(component.pagerInfo).toBeTruthy();
    expect(component.chartPositionChanged.emit).not.toHaveBeenCalled();
    component.setPagerInfo({} as PagerInfo);
    tick();
    expect(component.pagerInfo).toBeTruthy();
    expect(component.chartPositionChanged.emit).toHaveBeenCalled();
  }));

  it('should sort', () => {
    spyOn(component, 'bumpSortState');
    spyOn(component.refreshData, 'emit');
    component.sort(SortBy.count);
    expect(component.bumpSortState).toHaveBeenCalled();
    expect(component.refreshData.emit).toHaveBeenCalled();
  });

  it('should update the rows', () => {
    spyOn(component.refreshData, 'emit');
    component.updateRows({ key: '' } as unknown as KeyboardEvent);
    expect(component.refreshData.emit).not.toHaveBeenCalled();
    component.updateRows({ key: '1' } as unknown as KeyboardEvent);
    expect(component.refreshData.emit).toHaveBeenCalled();
  });
});

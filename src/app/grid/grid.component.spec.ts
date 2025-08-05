import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockAPIService } from '../_mocked';
import { DimensionName, PagerInfo, SortBy, TableRow } from '../_models';
import { APIService } from '../_services';
import { GridPaginatorComponent } from '../grid-paginator';
import { GridComponent } from '.';
import { RenameApiFacetPipe } from '../_translate';

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
      imports: [FormsModule, GridComponent, GridPaginatorComponent],
      providers: [
        {
          provide: APIService,
          useClass: MockAPIService
        },
        RenameApiFacetPipe
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
    const spyGetRightsCategoryUrls = jest.spyOn(api, 'getRightsCategoryUrls');
    const spyOpen = jest.spyOn(window, 'open').mockImplementation(() => {
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

    expect(spyGetRightsCategoryUrls).not.toHaveBeenCalled();
    expect(spyOpen).not.toHaveBeenCalled();

    component.facet = DimensionName.rightsCategory;
    component.loadFullLink(mockTableRow);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalled();
    expect(spyOpen).not.toHaveBeenCalled();

    mockTableRow.portalUrlInfo.hrefRewritten = false;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(2);
    expect(spyOpen).toHaveBeenCalled();
    expect(mockTableRow.portalUrlInfo.hrefRewritten).toBeTruthy();

    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(2);
    expect(spyOpen).toHaveBeenCalledTimes(1);

    mockTableRow.portalUrlInfo.hrefRewritten = false;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(3);
    expect(spyOpen).toHaveBeenCalledTimes(2);

    mockTableRow.portalUrlInfo.hrefRewritten = false;
    mockTableRow.isTotal = true;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(3);
    expect(spyOpen).toHaveBeenCalledTimes(2);

    // test urls for rightsCategory filters

    component.facet = DimensionName.contentTier;
    mockTableRow.portalUrlInfo.hrefRewritten = false;
    mockTableRow.portalUrlInfo.rightsFilters = ['CC0'];

    component.loadFullLink(mockTableRow, false);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(4);
    expect(spyOpen).toHaveBeenCalledTimes(2);

    // test normal links work correctly (normal behaviour - doesn't invoke open)

    component.facet = DimensionName.country;
    mockTableRow.portalUrlInfo.hrefRewritten = false;
    delete mockTableRow.portalUrlInfo.rightsFilters;
    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyOpen).toHaveBeenCalledTimes(2);

    // another test of the rightsCategory filter

    mockTableRow.portalUrlInfo.rightsFilters = ['In Copyright'];
    mockTableRow.portalUrlInfo.hrefRewritten = false;

    component.loadFullLink(mockTableRow, true);
    tick();

    expect(spyGetRightsCategoryUrls).toHaveBeenCalledTimes(5);
    expect(spyOpen).toHaveBeenCalledTimes(3);
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
    const spySetPage = jest.spyOn(component.paginator, 'setPage');
    component.goToPage({ key: '99' } as unknown as KeyboardEvent);
    component.goToPage({
      key: 'Enter',
      target: { value: 'a' }
    } as unknown as KeyboardEvent);
    expect(spySetPage).not.toHaveBeenCalled();
    component.goToPage({ key: '99' } as unknown as KeyboardEvent);
    component.goToPage({
      key: 'Enter',
      target: { value: '99' }
    } as unknown as KeyboardEvent);
    expect(spySetPage).toHaveBeenCalledWith(0);
  }));

  it('should set the page info', fakeAsync(() => {
    const spyEmit = jest.spyOn(component.chartPositionChanged, 'emit');
    component.setPagerInfo({} as PagerInfo);
    tick();
    expect(component.pagerInfo).toBeTruthy();
    expect(spyEmit).not.toHaveBeenCalled();
    component.setPagerInfo({} as PagerInfo);
    tick();
    expect(component.pagerInfo).toBeTruthy();
    expect(spyEmit).toHaveBeenCalled();
  }));

  it('should sort', () => {
    const spyBumpSortState = jest.spyOn(component, 'bumpSortState');
    const spyEmit = jest.spyOn(component.refreshData, 'emit');
    component.sort(SortBy.count);
    expect(spyBumpSortState).toHaveBeenCalled();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should update the rows', () => {
    const spyEmit = jest.spyOn(component.refreshData, 'emit');
    component.updateRows({ key: '' } as unknown as KeyboardEvent);
    expect(spyEmit).not.toHaveBeenCalled();
    component.updateRows({ key: '1' } as unknown as KeyboardEvent);
    expect(spyEmit).toHaveBeenCalled();
  });
});

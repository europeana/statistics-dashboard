import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { createMockPipe } from '../_mocked';
import { DimensionName, PagerInfo, SortBy, TableRow } from '../_models';
import { GridPaginatorComponent } from '../grid-paginator';
import { GridComponent } from '.';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  const testRows = [
    {
      name: 'A',
      count: 1,
      percent: 2
    },
    {
      name: 'B',
      count: 2,
      percent: 2
    },
    {
      name: 'B',
      count: 3,
      percent: 1,
      isTotal: true
    },
    {
      name: 'C',
      count: 0,
      percent: 1
    },
    {
      name: 'D',
      count: 2,
      percent: 1
    }
  ] as Array<TableRow>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        createMockPipe('renameApiFacet'),
        GridComponent,
        GridPaginatorComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
  });

  it('should get the data', () => {
    expect(component.getData()).toBeTruthy();
  });

  it('should get the prefix', () => {
    expect(component.getPrefix()).toEqual('');
    component.facet = DimensionName.contentTier;
    expect(component.getPrefix()).toEqual('Tier ');
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
    component.setPagerInfo({} as PagerInfo);
    tick();
    expect(component.pagerInfo).toBeTruthy();
  }));

  it('should sort', () => {
    spyOn(component, 'bumpSortState');
    spyOn(component.refreshData, 'emit');
    component.sort(SortBy.count);
    expect(component.bumpSortState).toHaveBeenCalled();
    expect(component.refreshData.emit).toHaveBeenCalled();
  });
});

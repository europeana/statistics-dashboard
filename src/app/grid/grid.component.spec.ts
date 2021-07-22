import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { PagerInfo, TableRow } from '../_models';
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
      declarations: [GridComponent, GridPaginatorComponent],
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

  it('should auto-sort the rows', () => {
    const rows = testRows.slice(0);
    expect(rows[0].name).toEqual('A');

    component.sortStates['count'] = 0;
    component.sortRows(rows, 'count');

    expect(rows[0].name).toEqual('A');

    component.sortStates['count'] = 1;
    component.autoSort(rows);

    expect(rows[0].name).toEqual('C');

    component.sortStates['count'] = -1;
    component.autoSort(rows);

    expect(rows[0].name).toEqual('B');

    component.sortStates['count'] = 0;
    component.sortStates['percent'] = -1;
    component.autoSort(rows);

    expect(rows[0].name).toEqual('B');
  });

  it('should bump the sort state', () => {
    expect(component.sortStates['count']).toEqual(0);
    component.bumpSortState('count');
    expect(component.sortStates['count']).toEqual(1);
    component.bumpSortState('count');
    expect(component.sortStates['count']).toEqual(-1);
    component.bumpSortState('count');
    expect(component.sortStates['count']).toEqual(0);
  });

  it('should get the data', () => {
    expect(component.getData()).toBeTruthy();
  });

  it('should get the filtered data', () => {
    expect(component.getFilteredRows().length).toEqual(0);
    expect(component.summaryRows.length).toEqual(0);

    component.setRows(testRows.slice(0));
    expect(component.getFilteredRows().length).toEqual(4);
    expect(component.summaryRows.length).toEqual(1);

    component.filterString = 'b';
    component.setRows(testRows.slice(0));
    expect(component.getFilteredRows().length).toEqual(1);
  });

  it('should go to the page', fakeAsync(() => {
    component.setRows(testRows.slice(0));
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

  it('should sort the rows', () => {
    spyOn(component, 'bumpSortState');
    spyOn(component, 'sortRows');
    component.sort('count');
    expect(component.bumpSortState).toHaveBeenCalled();
    expect(component.sortRows).toHaveBeenCalled();
  });

  it('should sort the rows', () => {
    const rows = testRows.slice(0);
    expect(rows[0].name).toEqual('A');

    component.sortStates['count'] = 0;
    component.sortRows(rows, 'count');

    expect(rows[0].name).toEqual('A');

    component.sortStates['count'] = 1;
    component.sortRows(rows, 'count');

    expect(rows[0].name).toEqual('C');

    component.sortStates['count'] = -1;
    component.sortRows(rows, 'count');

    expect(rows[0].name).toEqual('B');
  });
});

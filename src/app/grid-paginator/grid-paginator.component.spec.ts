import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRow } from '../_models';
import { GridPaginatorComponent } from '.';

describe('GridPaginatorComponent', () => {
  let component: GridPaginatorComponent;
  let fixture: ComponentFixture<GridPaginatorComponent>;

  const testRows = [
    { name: 'A', count: 1, percent: 2 },
    { name: 'B', count: 2, percent: 2 },
    { name: 'B', count: 3, percent: 1, isTotal: true },
    { name: 'C', count: 0, percent: 1 },
    { name: 'D', count: 2, percent: 1 }
  ] as Array<TableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridPaginatorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect if next is available', () => {
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    component.activePageIndex.set(1);
    fixture.detectChanges();
    expect(component.canNext()).toBeTruthy();

    component.activePageIndex.set(2);
    fixture.detectChanges();
    expect(component.canNext()).toBeFalsy();
  });

  it('should detect if previous is available', () => {
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    component.activePageIndex.set(0);
    fixture.detectChanges();
    expect(component.canPrev()).toBeFalsy();

    component.activePageIndex.set(1);
    fixture.detectChanges();
    expect(component.canPrev()).toBeTruthy();
  });

  it('should calculate the pages dynamically via signal computed properties', () => {
    expect(component.paginationData().ranges.length).toBe(0);
    expect(component.paginationData().totalRows).toBe(0);
    expect(component.paginationData().totalPageCount).toBe(0);

    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.detectChanges();

    expect(component.paginationData().ranges.length).toBeGreaterThan(0);
    expect(component.paginationData().totalRows).toBe(testRows.length);
    expect(component.paginationData().totalPageCount).toBeGreaterThan(0);
  });

  it('should auto-reset the pages when rows shift via linkedSignal', () => {
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 1);
    fixture.detectChanges();

    component.setPage(2);
    expect(component.activePageIndex()).toBe(2);

    // Changing maxPageSize now successfully triggers the linkedSignal reset!
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    expect(component.activePageIndex()).toBe(0);
    expect(component.paginationData().pages.length).toBe(3);
  });

  it('should set the page and update computed pagerInfo', () => {
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    component.setPage(1);
    fixture.detectChanges();

    // Assert on declarative computed signal data status directly
    expect(component.activePageIndex()).toBe(1);
    expect(component.pagerInfo().currentPage).toBe(1);
    expect(component.pagerInfo().pageRows.length).toBe(2);
  });

  it('should set the page via wrapper function click handles', () => {
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    const dummyEvent = { preventDefault: jest.fn() } as unknown as Event;
    component.callSetPage(dummyEvent, 1);
    fixture.detectChanges();

    expect(dummyEvent.preventDefault).toHaveBeenCalled();
    expect(component.activePageIndex()).toBe(1);
  });
});

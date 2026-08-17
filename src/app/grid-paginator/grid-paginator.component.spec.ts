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
    component.activePageIndex.set(1);
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    expect(component.canNext()).toBeTruthy();

    component.activePageIndex.set(3);
    fixture.detectChanges();
    expect(component.canNext()).toBeFalsy();
  });

  it('should detect if previous is available', () => {
    component.activePageIndex.set(0);
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    expect(component.canPrev()).toBeFalsy();

    component.activePageIndex.set(2);
    fixture.detectChanges();
    expect(component.canPrev()).toBeTruthy();
  });

  it('should calculate the pages dynamically via signal computed properties', () => {
    expect(component.ranges.length).toBe(0);
    expect(component.totalRows).toBe(0);
    expect(component.totalPageCount).toBe(0);

    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.detectChanges();

    expect(component.ranges.length).toBeGreaterThan(0);
    expect(component.totalRows).toBe(testRows.length);
    expect(component.totalPageCount).toBeGreaterThan(0);
  });

  it('should recalculate the pages when the page size changes', () => {
    const spySetPage = jest.spyOn(component, 'setPage');

    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.detectChanges();

    fixture.componentRef.setInput('maxPageSize', 2);
    fixture.detectChanges();

    expect(spySetPage).toHaveBeenCalled();
    expect(component.pages.length).toBe(3);
  });

  it('should set the page', () => {
    const spyChange = jest.spyOn(component.change, 'emit');
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.detectChanges();

    component.setPage(1);
    expect(spyChange).toHaveBeenCalled();
  });

  it('should set the page via wrapper function click handles', () => {
    const spyChange = jest.spyOn(component.change, 'emit');
    fixture.componentRef.setInput('rows', testRows.slice(0));
    fixture.detectChanges();

    const dummyEvent = { preventDefault: jest.fn() } as unknown as Event;
    component.callSetPage(dummyEvent, 1);

    expect(dummyEvent.preventDefault).toHaveBeenCalled();
    expect(spyChange).toHaveBeenCalled();
  });
});

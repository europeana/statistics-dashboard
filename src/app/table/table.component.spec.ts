import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import {
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle row expansion', () => {
    const spy = jasmine.createSpy();
    component.dataTable = {
      rowDetail: {
        toggleExpandRow: spy
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as DatatableComponent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component.toggleExpandRow({} as any as DatatableRowDetailDirective);
    expect(spy).toHaveBeenCalled();
  });
});

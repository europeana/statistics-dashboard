import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppendiceSectionComponent } from '.';

describe('AppendiceSectionComponent', () => {
  let component: AppendiceSectionComponent;
  let fixture: ComponentFixture<AppendiceSectionComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppendiceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invoke the columns-enabled count calculation', () => {
    const spyCalculateColumnsEnabledCount = jest.spyOn(
      component,
      'calculateColumnsEnabledCount'
    );
    component.columnEnabled3D = true;
    component.columnEnabled3D = false;

    expect(spyCalculateColumnsEnabledCount).toHaveBeenCalledTimes(2);

    component.columnEnabledHQ = true;
    component.columnEnabledHQ = false;

    expect(spyCalculateColumnsEnabledCount).toHaveBeenCalledTimes(4);

    component.columnEnabledALL = true;
    component.columnEnabledALL = false;

    expect(spyCalculateColumnsEnabledCount).toHaveBeenCalledTimes(6);
  });

  it('should calculate the columns-enabled count', () => {
    expect(component.columnsEnabledCount).toEqual(3);

    component.columnEnabledHQ = false;
    component.calculateColumnsEnabledCount();

    expect(component.columnsEnabledCount).toEqual(2);

    component.columnEnabled3D = false;
    component.calculateColumnsEnabledCount();

    expect(component.columnsEnabledCount).toEqual(1);

    component.columnEnabledHQ = true;
    component.columnEnabled3D = true;

    expect(component.columnsEnabledCount).toEqual(3);
  });
});

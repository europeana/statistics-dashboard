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

  it('should reactively calculate the columns-enabled count when inputs change', () => {
    // Default initial value should be 3
    expect(component.columnsEnabledCount()).toEqual(3);

    // Toggle HQ off -> count drops to 2
    fixture.componentRef.setInput('columnEnabledHQ', false);
    fixture.detectChanges();
    expect(component.columnsEnabledCount()).toEqual(2);

    // Toggle 3D off -> count drops to 1
    fixture.componentRef.setInput('columnEnabled3D', false);
    fixture.detectChanges();
    expect(component.columnsEnabledCount()).toEqual(1);

    // Toggle ALL off -> count drops to 0
    fixture.componentRef.setInput('columnEnabledALL', false);
    fixture.detectChanges();
    expect(component.columnsEnabledCount()).toEqual(0);

    // Toggle them back on
    fixture.componentRef.setInput('columnEnabledHQ', true);
    fixture.componentRef.setInput('columnEnabled3D', true);
    fixture.componentRef.setInput('columnEnabledALL', true);
    fixture.detectChanges();
    expect(component.columnsEnabledCount()).toEqual(3);
  });
});

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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyStatementComponent } from '.';

describe('PrivacyStatementComponent', () => {
  let component: PrivacyStatementComponent;
  let fixture: ComponentFixture<PrivacyStatementComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

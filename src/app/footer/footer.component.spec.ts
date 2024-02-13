import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from '.';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the event', () => {
    spyOn(component.showCookieConsent, 'emit');
    component.clickPrivacySettings();
    expect(component.showCookieConsent.emit).toHaveBeenCalled();
  });
});

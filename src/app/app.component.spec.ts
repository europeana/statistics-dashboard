import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterEvent } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: './data', component: AppComponent }
        ])
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect data urls', () => {
    component.handleRouterEvent(
      new NavigationEnd(1, '/data', '/data') as RouterEvent
    );
    expect(component.showPageTitle).toBeFalsy();

    component.handleRouterEvent(
      new NavigationEnd(1, '/xxx', '/xxx') as RouterEvent
    );
    expect(component.showPageTitle).toBeTruthy();

    component.handleRouterEvent({} as unknown as RouterEvent);
    expect(component.showPageTitle).toBeTruthy();
  });
});

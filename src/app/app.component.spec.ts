import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterEvent } from '@angular/router';
import { ClickService } from './_services';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let clicks: ClickService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterTestingModule.withRoutes([
            { path: './data', component: AppComponent }
          ])
        ]
      });
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    clicks = TestBed.inject(ClickService);
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

  it('should listen for document clicks', fakeAsync(() => {
    spyOn(clicks.documentClickedTarget, 'next');
    const el = fixture.debugElement.query(By.css('*'));
    el.nativeElement.click();
    tick(1);
    expect(clicks.documentClickedTarget.next).toHaveBeenCalled();
    component.documentClick({ target: {} as any as HTMLElement });
    expect(clicks.documentClickedTarget.next).toHaveBeenCalledTimes(2);
  }));
});

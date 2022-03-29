import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { APIService, ClickService } from './_services';
import { AppComponent } from './app.component';
import { MockAPIService } from './_mocked';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let clicks: ClickService;
  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const tmpParams = {};
  tmpParams['content-tier-zero'] = false;
  const queryParams = new BehaviorSubject(tmpParams as Params);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterTestingModule.withRoutes([
            { path: './data', component: AppComponent }
          ])
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { params: params, queryParams: queryParams }
          },
          {
            provide: APIService,
            useClass: MockAPIService //errorMode ? MockAPIServiceErrors : MockAPIService
          }
        ]
      }).compileComponents();
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

  it('should listen for document clicks', fakeAsync(() => {
    spyOn(clicks.documentClickedTarget, 'next');
    const el = fixture.debugElement.query(By.css('*'));
    el.nativeElement.click();
    tick(1);
    expect(clicks.documentClickedTarget.next).toHaveBeenCalled();
    component.documentClick({ target: {} as unknown as HTMLElement });
    expect(clicks.documentClickedTarget.next).toHaveBeenCalledTimes(2);
  }));
});

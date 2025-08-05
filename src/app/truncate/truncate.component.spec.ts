import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { ResizeComponent } from '../resize';
import { TruncateComponent } from './';
import { HighlightMatchPipe } from '../_translate';

describe('TruncateComponent', () => {
  let component: TruncateComponent;
  let fixture: ComponentFixture<TruncateComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [TruncateComponent, ResizeComponent],
      providers: [HighlightMatchPipe]
    }).compileComponents();
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruncateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split the text on init', () => {
    const spySplitText = jest.spyOn(component, 'splitText');
    component.text = 'xxxx';
    component.ngOnInit();
    expect(spySplitText).toHaveBeenCalled();
  });

  it('should split the text on resize', fakeAsync(() => {
    component.text = 'xxxx';
    component.ngOnInit();
    const spySplitText = jest.spyOn(component, 'splitText');
    window.dispatchEvent(new Event('resize'));
    tick(component.debounceMS);
    expect(spySplitText).toHaveBeenCalled();
  }));

  it('should split the text recursively', fakeAsync(() => {
    const ellipsisActive = false;
    jest.spyOn(component, 'isEllipsisActive').mockImplementation(() => {
      return ellipsisActive;
    });

    component.text = 'xxxx';
    for (let x = 0; x < 10; x++) {
      component.text = component.text + component.text;
    }

    const spySplitText = jest.spyOn(component, 'splitText');
    component.ngOnInit();
    fixture.detectChanges();
    component.omitCount = 2;
    component.callSplitText();
    expect(component.omitCount).toEqual(0);
    tick(component.debounceMS);
    expect(component.splitText).toHaveBeenCalledTimes(2);
  }));
});

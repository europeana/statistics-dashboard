import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { TruncateComponent } from './';

describe('TruncateComponent', () => {
  let component: TruncateComponent;
  let fixture: ComponentFixture<TruncateComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({}).compileComponents();
  };

  beforeEach(async(() => {
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
    spyOn(component, 'splitText');
    component.text = 'xxxx';
    component.ngOnInit();
    expect(component.splitText).toHaveBeenCalled();
  });

  it('should split the text on resize', fakeAsync(() => {
    component.text = 'xxxx';
    component.ngOnInit();
    spyOn(component, 'splitText');
    window.dispatchEvent(new Event('resize'));
    tick(component.debounceMS);
    expect(component.splitText).toHaveBeenCalled();
  }));

  it('should split the text recursively', fakeAsync(() => {
    component.text = 'xxxx';
    for (let x = 0; x < 10; x++) {
      component.text = component.text + component.text;
    }

    component.ngOnInit();
    spyOn(component, 'splitText');
    fixture.detectChanges();

    component.callSplitText();
    expect(component.splitText).toHaveBeenCalled();

    const ellipsisActive = false;

    spyOn(component, 'isEllipsisActive').and.callFake(() => {
      return ellipsisActive;
    });

    component.omitCount = 2;
    component.callSplitText();
    expect(component.splitText).toHaveBeenCalledTimes(2);
    expect(component.omitCount).toEqual(0);

    tick(component.debounceMS);
  }));
});

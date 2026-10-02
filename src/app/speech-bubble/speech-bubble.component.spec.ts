import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeechBubbleComponent } from '.';

describe('SpeechBubbleComponent', () => {
  let component: SpeechBubbleComponent;
  let fixture: ComponentFixture<SpeechBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechBubbleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeechBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the correct conditional classes when input signals change', () => {
    expect(component.arrowTopRight()).toBeFalsy();

    fixture.componentRef.setInput('arrowTopRight', true);
    fixture.detectChanges();

    expect(component.arrowTopRight()).toBe(true);

    const spanElement: HTMLElement =
      fixture.nativeElement.querySelector('.speech-bubble');
    expect(spanElement.classList.contains('arrow-top-right')).toBeTruthy();
  });
});

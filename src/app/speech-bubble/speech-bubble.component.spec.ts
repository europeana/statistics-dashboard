import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeechBubbleComponent } from '.';

describe('SpeechBubbleComponent', () => {
  let component: SpeechBubbleComponent;
  let fixture: ComponentFixture<SpeechBubbleComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SpeechBubbleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeechBubbleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

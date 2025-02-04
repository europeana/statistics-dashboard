import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-speech-bubble',
  templateUrl: './speech-bubble.component.html',
  styleUrls: ['./speech-bubble.component.scss'],
  imports: [NgClass]
})
export class SpeechBubbleComponent {
  @Input() arrowTopRight = false;
  @Input() arrowTopLeft = false;
  @Input() arrowBottomRight = false;
  @Input() arrowBottomLeft = false;
}

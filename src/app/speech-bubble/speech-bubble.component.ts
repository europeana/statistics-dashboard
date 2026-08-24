import { Component, input } from '@angular/core';

@Component({
  selector: 'app-speech-bubble',
  templateUrl: './speech-bubble.component.html',
  styleUrls: ['./speech-bubble.component.scss'],
  imports: []
})
export class SpeechBubbleComponent {
  arrowTopRight = input<boolean>(false);
  arrowTopLeft = input<boolean>(false);
  arrowBottomRight = input<boolean>(false);
  arrowBottomLeft = input<boolean>(false);
}

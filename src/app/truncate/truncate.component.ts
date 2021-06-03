import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss']
})
export class TruncateComponent implements OnInit {
  @Input() text: string;
  applySpace = false;
  omitCount = 0;
  textLeft: string;
  textRight: string;

  maxRecursions = 100;
  minSegmentLength = 20;

  @ViewChild('contentRef') contentRef: ElementRef;
  @ViewChild('elRefTextLeft') elRefTextLeft: ElementRef;
  @ViewChild('elRefTextRight') elRefTextRight: ElementRef;

  constructor() {}

  ngOnInit() {
    console.log('init ' + this.text);
    this.splitText();
  }

  isEllipsisActive(): boolean {
    const el = this.elRefTextLeft.nativeElement;
    return (
      el.firstElementChild.getBoundingClientRect().width >
      el.getBoundingClientRect().width
    );
  }

  run(): void {
    this.splitText();
  }

  splitText(rec = 0): void {
    const textLength = this.text.length;
    console.log('splitText(rec' + rec + ') textLength = ' + textLength);

    const omit = Math.floor(this.omitCount / 2);
    const cutOff = Math.floor(textLength / 2);

    if (cutOff - omit < 1 || cutOff + omit > textLength) {
      console.error('no cut off');
      return;
    }

    this.textLeft = this.text.substr(0, cutOff - omit);
    this.textRight = this.text.substr(cutOff + omit);

    if (this.textLeft.endsWith(' ') || this.textRight.startsWith(' ')) {
      this.applySpace = true;
    }

    const fn = (): void => {
      this.callR(rec);
    };
    setTimeout(fn, 0);
  }

  callR(rec = 0): void {
    if (!this.isEllipsisActive()) {
      // there are no ellipsis
      console.log('no ellipsis');
      if(this.omitCount !== 0){
        this.omitCount = Math.max(this.omitCount - 2, 0);
        this.splitText(this.maxRecursions);
      }
      return;
    }
    else{

      const wLeft =
        this.elRefTextLeft.nativeElement.getBoundingClientRect().width;
      const wRight =
        this.elRefTextRight.nativeElement.getBoundingClientRect().width;

      //console.log('textLeft (' + this.textLeft.length + ', ' + wLeft + ')\t"' + this.textLeft + '"');
      //console.log('textRight (' + this.textRight.length + ', ' + wRight + ')\t"' + this.textRight + '"');
      console.log('textLeft (' + this.textLeft.length + ', ' + wLeft + ')');
      console.log('textRight (' + this.textRight.length + ', ' + wRight + ')');
      console.log('sum = ' + (this.textLeft.length + this.textRight.length));
      console.log('omitCount = ' + this.omitCount);

      if (wRight > wLeft) {
        // omit more characters...
        this.omitCount += 2;
        if (rec < this.maxRecursions) {
          this.splitText(rec + 1);
        }
      }
    }

  }
}

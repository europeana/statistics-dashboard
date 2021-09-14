/** HighlightMatchPipe
/*
/* a text / html highlighting facility
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightMatch'
})
export class HighlightMatchPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0) {
      return value.replace(
        new RegExp(args[0], 'gi'),
        `<span class="highlight">${args[0]}</span>`
      );
    }
    return value;
  }
}

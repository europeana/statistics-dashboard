/** HighlightMatchPipe
/*
/* a text / html highlighting facility
*/
import { Pipe, PipeTransform } from '@angular/core';
import { appendDiacriticEquivalents, replaceDiacritics } from '../_helpers';

@Pipe({
  name: 'highlightMatch'
})
export class HighlightMatchPipe implements PipeTransform {
  tagOpen = '<span class="term-highlight">';
  tagClose = '</span>';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0 && args[0].length > 0) {
      const term = replaceDiacritics(args[0]);
      const reg = new RegExp(appendDiacriticEquivalents(term), 'gi');

      const startIndexes = [0];
      const endIndexes = [];
      const matches = [];

      let match = reg.exec(value);

      while (match != null) {
        matches.push(match);
        startIndexes.push(match.index + term.length);
        endIndexes.push(match.index);
        match = reg.exec(value);
      }
      endIndexes.push(value.length);

      let newStr = '';

      startIndexes.forEach((start: number, index: number) => {
        newStr += value.substr(start, endIndexes[index] - start);
        if (index < matches.length) {
          newStr += `${this.tagOpen}${matches[index]}${this.tagClose}`;
        }
      });
      return newStr;
    }
    return value;
  }
}

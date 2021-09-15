/** HighlightMatchPipe
/*
/* a text / html highlighting facility
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DiacriticsMap } from '../_data';

@Pipe({
  name: 'highlightMatch'
})
export class HighlightMatchPipe implements PipeTransform {
  tagOpen = '<span class="highlight">';
  tagClose = '</span>';

  appendDiacriticEquivalents(source: string): string {
    return source
      .replace(/A/gi, `[${DiacriticsMap.A}]`)
      .replace(/B/gi, `[${DiacriticsMap.B}]`)
      .replace(/C/gi, `[${DiacriticsMap.C}]`)
      .replace(/D/gi, `[${DiacriticsMap.D}]`)
      .replace(/E/gi, `[${DiacriticsMap.E}]`)
      .replace(/F/gi, `[${DiacriticsMap.F}]`)
      .replace(/G/gi, `[${DiacriticsMap.G}]`)
      .replace(/H/gi, `[${DiacriticsMap.H}]`)
      .replace(/I/gi, `[${DiacriticsMap.I}]`)
      .replace(/J/gi, `[${DiacriticsMap.J}]`)
      .replace(/K/gi, `[${DiacriticsMap.K}]`)
      .replace(/L/gi, `[${DiacriticsMap.L}]`)
      .replace(/M/gi, `[${DiacriticsMap.M}]`)
      .replace(/N/gi, `[${DiacriticsMap.N}]`)
      .replace(/O/gi, `[${DiacriticsMap.O}]`)
      .replace(/P/gi, `[${DiacriticsMap.P}]`)
      .replace(/Q/gi, `[${DiacriticsMap.Q}]`)
      .replace(/R/gi, `[${DiacriticsMap.R}]`)
      .replace(/S/gi, `[${DiacriticsMap.S}]`)
      .replace(/T/gi, `[${DiacriticsMap.T}]`)
      .replace(/U/gi, `[${DiacriticsMap.U}]`)
      .replace(/V/gi, `[${DiacriticsMap.V}]`)
      .replace(/W/gi, `[${DiacriticsMap.W}]`)
      .replace(/X/gi, `[${DiacriticsMap.X}]`)
      .replace(/Y/gi, `[${DiacriticsMap.Y}]`)
      .replace(/Z/gi, `[${DiacriticsMap.Z}]`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0 && args[0].length > 0) {
      const reg = new RegExp(this.appendDiacriticEquivalents(args[0]), 'gi');

      let startIndexes = [0];
      let endIndexes = [];
      let matches = [];

      let match = reg.exec(value);

      while (match != null) {
        matches.push(match);
        startIndexes.push(match.index + args[0].length);
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

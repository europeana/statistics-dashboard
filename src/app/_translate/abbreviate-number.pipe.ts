/** AbbreviateNumberPipe
 * Pipe numbers to short strings, i.e. 1000 ==> "1k"
 **/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbreviateNumber',
  standalone: true
})
export class AbbreviateNumberPipe implements PipeTransform {
  fmtSettings = {
    // ts doesn't understand NumberFormatOptions, but this cast allows it to compile
    notation: 'compact' as
      | 'standard'
      | 'compact'
      | 'scientific'
      | 'engineering',
    maximumFractionDigits: 1
  };

  transform(value: number): string {
    return Intl.NumberFormat('en-US', this.fmtSettings).format(value);
  }
}

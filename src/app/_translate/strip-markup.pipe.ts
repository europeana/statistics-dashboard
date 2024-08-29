/** StripMarkupPipe
/*
/* a translation utility for stripping markup from strings
/* (supplies tooltip-safe strings)
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripMarkup',
  standalone: true
})
export class StripMarkupPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/<.*?>/g, '');
  }
}

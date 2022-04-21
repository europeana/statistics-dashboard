/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';
import { portalNamesFriendly } from '../_data';

@Pipe({
  name: 'renameApiFacet'
})
export class RenameApiFacetPipe implements PipeTransform {
  transform(value: string): string {
    return portalNamesFriendly[value] || value;
  }
}

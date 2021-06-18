/** RenameRightsPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for rights
*/
import { Pipe, PipeTransform } from '@angular/core';
import { rightsUrlMatch } from '../_helpers';

@Pipe({
  name: 'renameRights'
})
export class RenameRightsPipe implements PipeTransform {
  transform(value: string): string {
    const res = rightsUrlMatch(value);
    if (res) {
      return res;
    }
    return value;
  }
}

/** RenameRightsPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for rights
*/
import { Pipe, PipeTransform } from '@angular/core';

import { IHash } from '../_models';
import { APIService } from '../_services';

@Pipe({
  name: 'renameRights'
})
export class RenameRightsPipe implements PipeTransform {
  rightsNames: IHash;

  constructor(private api: APIService) {
    this.rightsNames = api.loadRightsStatements();
  }
  transform(value: string): string {
    const replaced =
      this.rightsNames[
        value
          .replace(/http(s)?:/, '')
          .split('?')[0]
          .replace(/[\/]$/, '')
      ];
    if (replaced) {
      return replaced.split('?')[0].trim();
    }
    return value;
  }
}

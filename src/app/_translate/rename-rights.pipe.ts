/** RenameRightsPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for rights
*/
import { Pipe, PipeTransform } from '@angular/core';

const rightsNames: { [key: string]: string } = {
  'http://rightsstatements.org/vocab/InC/1.0/': 'In Copyright',
  'http://creativecommons.org/publicdomain/zero/1.0/': 'CC0 1.0 Universal',
  'http://creativecommons.org/licenses/by-nc-nd/4.0/': 'CC BY-NC-ND 4.0'
};

@Pipe({
  name: 'renameRights'
})
export class RenameRightsPipe implements PipeTransform {
  transform(value: string): string {
    return rightsNames[value] || value;
  }
}

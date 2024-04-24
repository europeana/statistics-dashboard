/** RenameTargetType
/*
/* a translation utility for html files
/* supplies human-readable labels for target types
*/
import { Pipe, PipeTransform } from '@angular/core';

const targetTypeNames = {
  total: 'Total',
  three_d: '3D',
  hq: 'HQ'
};

@Pipe({
  name: 'renameTargetType',
  standalone: true
})
export class RenameTargetTypePipe implements PipeTransform {
  transform(value: string): string {
    return targetTypeNames[value] || value;
  }
}
/** RenameTargetTypeLong
/*
/* a translation utility for html files
/* supplies human-readable labels for target types
*/
import { Pipe, PipeTransform } from '@angular/core';
import { RenameTargetTypePipe } from '.';

const targetTypeNames = {
  high_quality: 'high quality'
};

@Pipe({
  name: 'renameTargetTypeLong',
  standalone: true
})
export class RenameTargetTypeLongPipe
  extends RenameTargetTypePipe
  implements PipeTransform
{
  transform(value: string): string {
    return targetTypeNames[value] || super.transform(value);
  }
}

import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  IHash,
  IHashArray,
  TargetData,
  TargetFieldName,
  TargetMetaData,
  TargetSeriesSuffixes
} from '../_models';
import { AbbreviateNumberPipe, RenameCountryPipe } from '../_translate';

@Component({
  imports: [
    AbbreviateNumberPipe,
    CommonModule,
    KeyValuePipe,
    RenameCountryPipe
  ],
  selector: 'app-appendice-section',
  styleUrls: ['./appendice-section.component.scss'],
  templateUrl: './appendice-section.component.html'
})
export class AppendiceSectionComponent {
  public TargetFieldName = TargetFieldName;
  public TargetSeriesSuffixes = TargetSeriesSuffixes;

  readonly pinnedCountries = input<IHash<number>>({});
  readonly countryData = input<IHash<Array<TargetData>>>({});
  readonly targetMetaData = input<IHash<IHashArray<TargetMetaData>>>();
  readonly colourMap = input<IHash<{ fill?: string }>>();

  readonly columnEnabled3D = input<boolean>(true);
  readonly columnEnabledHQ = input<boolean>(true);
  readonly columnEnabledALL = input<boolean>(true);

  readonly columnsEnabledCount = computed(() => {
    return [
      this.columnEnabled3D(),
      this.columnEnabledHQ(),
      this.columnEnabledALL()
    ].filter((val: boolean) => val).length;
  });
}

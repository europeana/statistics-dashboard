import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  @Input() pinnedCountries: IHash<number> = {};
  @Input() countryData: IHash<Array<TargetData>> = {};
  @Input() targetMetaData: IHash<IHashArray<TargetMetaData>>;
  @Input() colourMap: IHash<{ fill?: string }>;

  _columnEnabled3D = true;
  _columnEnabledHQ = true;
  _columnEnabledALL = true;
  columnsEnabledCount = 3;

  @Input() set columnEnabled3D(value: boolean) {
    this._columnEnabled3D = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabled3D(): boolean {
    return this._columnEnabled3D;
  }

  @Input() set columnEnabledHQ(value: boolean) {
    this._columnEnabledHQ = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabledHQ(): boolean {
    return this._columnEnabledHQ;
  }

  @Input() set columnEnabledALL(value: boolean) {
    this._columnEnabledALL = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabledALL(): boolean {
    return this._columnEnabledALL;
  }

  calculateColumnsEnabledCount(): void {
    this.columnsEnabledCount = [
      this.columnEnabled3D,
      this.columnEnabledHQ,
      this.columnEnabledALL
    ].filter((val: boolean) => !!val).length;
  }
}

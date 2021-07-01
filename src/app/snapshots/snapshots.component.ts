import { Component, EventEmitter, Input, Output } from '@angular/core';

import { colours, facetNames } from '../_data';

import {
  ColourSeriesData,
  CompareData,
  CompareDataDescriptor
} from '../_models';

@Component({
  selector: 'app-snapshots',
  templateUrl: './snapshots.component.html',
  styleUrls: ['./snapshots.component.scss']
})
export class SnapshotsComponent {
  compareData: CompareData;

  _facetName: string;
  @Input() set facetName(facetName: string) {
    this._facetName = facetName;

    Object.keys(this.compareDataAllFacets).forEach((fName: string) => {
      if (fName !== facetName) {
        const cd = this.compareDataAllFacets[fName];
        Object.keys(cd).forEach((key: string) => {
          cd[key].applied = false;
        });
      }
    });

    this.compareData = this.compareDataAllFacets[facetName];
  }

  @Output() hideItem: EventEmitter<string> = new EventEmitter();
  @Output() showItems: EventEmitter<Array<string>> = new EventEmitter();

  public colours = colours;

  topList: Array<string> = [];
  maxList = 3;

  compareDataAllFacets: { [key: string]: CompareData } = facetNames.reduce(
    (map, s: string) => {
      map[s] = {};
      return map;
    },
    {}
  );

  filteredCDKeys(facetName: string, prop: string): Array<string> {
    const cd = this.compareDataAllFacets[facetName];
    return Object.keys(cd).filter((key: string) => {
      return cd[key][prop];
    });
  }

  getSeriesData(
    facetName: string,
    seriesKeys: Array<string>,
    percent: boolean,
    seriesCount: number
  ): Array<ColourSeriesData> {
    return seriesKeys.map((seriesKey: string) => {
      const colourIndex = seriesCount % colours.length;
      const cd = this.compareDataAllFacets[facetName][seriesKey];

      cd._colourIndex = colourIndex;
      cd.applied = true;

      const csd: ColourSeriesData = {
        data: percent ? cd.dataPercent : cd.data,
        colour: colours[colourIndex],
        seriesName: seriesKey
      };

      seriesCount++;
      return csd;
    });
  }

  /** snap
  /* take a snapshot - adds a comparison
  */
  snap(facetName: string, key: string, cdd: CompareDataDescriptor): void {
    this.compareDataAllFacets[facetName][key] = cdd;
  }

  /** toggle
  /* Emits showItems event or hideItem event according to a CompareData applied property
  */
  toggle(key: string): void {
    const cd = this.compareDataAllFacets[this._facetName][key];
    if (cd.applied) {
      this.hideItem.emit(key);
    } else {
      this.showItems.emit([key]);
    }
  }

  unapply(seriesKey: string): void {
    const cd = this.compareDataAllFacets[this._facetName][seriesKey];
    cd._colourIndex = 0;
    cd.applied = false;
  }
}

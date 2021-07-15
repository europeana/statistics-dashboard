import { Component, EventEmitter, Input, Output } from '@angular/core';
import { colours, facetNames } from '../_data';
import {
  ColourSeriesData,
  CompareData,
  CompareDataDescriptor,
  HeaderNameType,
  TableRow
} from '../_models';

@Component({
  selector: 'app-snapshots',
  templateUrl: './snapshots.component.html',
  styleUrls: ['./snapshots.component.scss']
})
export class SnapshotsComponent {
  public colours = colours;

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

  compareData: CompareData;
  pinIndex = 0;

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

  clearColourIndexes(): void {
    const cd = this.compareDataAllFacets[this._facetName];
    return Object.keys(cd).forEach((key: string) => {
      cd[key]._colourIndex = -1;
    });
  }

  /** getNextAvailableColourIndex
  /* calculates the next available colour by looking at which have been used
  /* within the current facet data
  /* @param { string : facetName } - the active facet
  /* @returns number
  */
  getNextAvailableColourIndex(facetName: string): number {
    const cd = this.compareDataAllFacets[facetName];

    const usedIndexes = Object.keys(cd)
      .filter((key: string) => {
        return cd[key]['applied'];
      })
      .map((key: string) => {
        return cd[key]._colourIndex;
      });

    const res = new Array(colours.length)
      .fill(null)
      .findIndex((_, x: number) => {
        return !usedIndexes.includes(x);
      });
    return res > -1 ? res : 0;
  }

  /** applySeries
  /* sets "applied" on series with identified by seriesKeys
  /* assign colour indexes
  /* @param { string : facetName } - the active facet
  /* @param { Array<string> : seriesKeys } - the keys of the series to apply
  /* @param { boolean : percent } - percent value switch
  /* @returns Array<ColourSeriesData> converts to data (for chart)
  */
  applySeries(
    facetName: string,
    seriesKeys: Array<string>,
    percent: boolean
  ): Array<ColourSeriesData> {
    return seriesKeys.map((seriesKey: string) => {
      const colourIndex = this.getNextAvailableColourIndex(facetName);
      const cd = this.compareDataAllFacets[facetName][seriesKey];

      cd._colourIndex = colourIndex;
      cd.applied = true;

      const csd: ColourSeriesData = {
        data: percent ? cd.dataPercent : cd.data,
        colour: colours[colourIndex],
        seriesName: seriesKey
      };
      return csd;
    });
  }

  /** getSeriesDataForTable
  /* converts to grouped / interplated data for table
  **/
  getSeriesDataForTable(
    facetName: string,
    seriesKeys: Array<string>
  ): Array<TableRow> {
    const allKeysInAllSeries: { [groupName: string]: true } = {};

    seriesKeys.forEach((seriesKey: string) => {
      const cd = this.compareDataAllFacets[facetName][seriesKey];
      Object.keys(cd.data).forEach((key: string) => {
        allKeysInAllSeries[key] = true;
      });
    });

    const result: Array<TableRow> = [];

    Object.keys(allKeysInAllSeries).forEach((groupKey: string) => {
      // check all series for groupKey

      seriesKeys.forEach((seriesKey: string) => {
        const cd = this.compareDataAllFacets[facetName][seriesKey];

        if (cd.data[groupKey]) {
          result.push({
            name: groupKey as HeaderNameType,
            count: cd.data[groupKey],
            percent: cd.dataPercent[groupKey],
            colourIndex: cd._colourIndex,
            series: cd.label
          });
        }
      });
    });
    return result;
  }

  /** snap
  /* take a snapshot - adds a comparison
  */
  snap(facetName: string, key: string, cdd: CompareDataDescriptor): void {
    const cd = this.compareDataAllFacets[facetName];
    cd[key] = cdd;
    cdd.pinIndex = this.pinIndex;
    this.pinIndex++;

    this.filteredCDKeys(facetName, 'applied').forEach((key: string) => {
      cd[key].applied = false;
    });

    this.filteredCDKeys(facetName, 'current').forEach((key: string) => {
      cd[key].current = false;
    });

    cdd.applied = true;
    cdd.current = true;
  }

  getSortKeys(): Array<string> {
    const cd = this.compareDataAllFacets[this._facetName];
    return Object.keys(cd).sort((keyA: string, keyB: string) => {
      const indexA = cd[keyA].pinIndex;
      const indexB = cd[keyB].pinIndex;
      return indexB - indexA;
    });
  }

  toggleSaved(key: string, current = false): void {
    const cd = this.compareDataAllFacets[this._facetName][key];
    cd.saved = !cd.saved;

    if (!cd.saved) {
      if (!current) {
        this.hideItem.emit(key);
      }
    }
  }

  /** toggle
  /* Emits showItems event or hideItem event according to a CompareData applied property
  */
  toggle(key: string, current = false): void {
    if (current) {
      return;
    }
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

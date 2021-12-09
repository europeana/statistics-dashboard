import { Component, EventEmitter, Input, Output } from '@angular/core';
import { colours, facetNames } from '../_data';
import { filterList } from '../_helpers';
import {
  ColourSeriesData,
  CompareData,
  CompareDataDescriptor,
  HeaderNameType,
  IHashNumber,
  SortBy,
  SortInfo,
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

    // unapply all other facets
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

  @Input() isVisible: boolean;
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

  preSortAndFilter(
    facetName: string,
    seriesKeys: Array<string>,
    sortInfo: SortInfo,
    filterTerm = ''
  ): void {
    seriesKeys.forEach((seriesKey: string) => {
      const cd = this.compareDataAllFacets[facetName][seriesKey];
      const data = cd.data;

      let operandA;
      let operandB;
      let sortedKeys: Array<string>;

      const sortByCount = sortInfo.by === SortBy.count;

      if (cd.orderOriginal && sortInfo.dir === 0) {
        sortedKeys = filterList(filterTerm, cd.orderOriginal);
      } else {
        sortedKeys = filterList(filterTerm, Object.keys(data)).sort(
          (a: string, b: string) => {
            if (sortByCount) {
              operandA = data[a];
              operandB = data[b];
            } else {
              operandA = a;
              operandB = b;
            }
            if (sortInfo.dir === 1) {
              return operandA > operandB ? 1 : operandA === operandB ? 0 : -1;
            } else if (sortInfo.dir === -1) {
              return operandA < operandB ? 1 : operandA === operandB ? 0 : -1;
            } else {
              return 0;
            }
          }
        );
      }
      cd.orderPreferred = sortedKeys;
    });
  }

  /** getSeriesDataForChart
  /* @param { string : facetName } - the active facet
  /* @param { Array<string> : seriesKeys } - the keys of the series to apply
  /* @param { boolean : percent } - percent value switch
  /* @returns Array<ColourSeriesData> converts to data (for chart)
  */
  getSeriesDataForChart(
    facetName: string,
    seriesKeys: Array<string>,
    percent: boolean,
    offset: number,
    maxRows: number
  ): Array<ColourSeriesData> {
    return this.getSortKeys(seriesKeys).map((seriesKey: string, keyIndex: number) => {
      const cd = this.compareDataAllFacets[facetName][seriesKey];
      const data = percent ? cd.dataPercent : cd.data;
      const cdKeys = cd.orderPreferred.slice(offset, offset + maxRows);
      return {
        data: cdKeys.reduce((map: IHashNumber, pref: string) => {
          map[`${pref} `] = data[pref];
          return map;
        }, {}),
        colour: colours[keyIndex],
        seriesName: seriesKey
      };
    });
  }

  /** getSeriesDataForGrid
  /* converts to grouped / interplated data for table
  **/
  getSeriesDataForGrid(
    facetName: string,
    seriesKeys: Array<string>
  ): Array<TableRow> {
    const allPreferred: Array<string> = [];
    const result: Array<TableRow> = [];
    const cds = this.compareDataAllFacets[facetName];

    // sort series keys (by pinIndex)
    this.getSortKeys(seriesKeys);

    // collect all possible category values and assign totals

    seriesKeys.forEach((seriesKey: string, keyIndex: number) => {
      const cd = cds[seriesKey];

      cd.orderPreferred.forEach((key: string) => {
        allPreferred.push(key);
      });

      cd._colourIndex = keyIndex;

      result.push({
        name: 'Total', // name will not be shown in the grid
        nameOriginal: 'Total',
        count: cd.total,
        isTotal: true,
        percent: 100,
        colourIndex: cd._colourIndex,
        series: cd.label
      });
    });

    // interpolate rows: check all series for category value's groupKey - add row if it has data
    allPreferred.forEach((groupKey: string) => {
      seriesKeys.forEach((seriesKey: string) => {
        const cd = cds[seriesKey];
        const count = cd.data[groupKey];
        const rawNames = cd.namesOriginal ? cd.namesOriginal : {};

        if (count) {
          result.push({
            name: groupKey as HeaderNameType,
            nameOriginal: rawNames[groupKey] ? rawNames[groupKey] : groupKey,
            count: count,
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

    // record the original order
    cdd.orderOriginal = Object.keys(cdd.data).slice(0);
    cdd.orderPreferred = Object.keys(cdd.data).slice(0);

    this.filteredCDKeys(facetName, 'applied').forEach((key: string) => {
      cd[key].applied = false;
    });

    this.filteredCDKeys(facetName, 'current').forEach((key: string) => {
      cd[key].current = false;
    });

    cdd.applied = true;
    cdd.current = true;
  }

  getSortKeys(keys?: Array<string>): Array<string> {
    const cd = this.compareDataAllFacets[this._facetName];

    if (!keys) {
      keys = Object.keys(cd);
    }

    return keys.sort((keyA: string, keyB: string) => {
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

  apply(facetName: string, seriesKeys: Array<string>): void {
    seriesKeys.forEach((seriesKey: string) => {
      this.compareDataAllFacets[facetName][seriesKey].applied = true;
    });
  }

  unapply(seriesKey: string): void {
    const cd = this.compareDataAllFacets[this._facetName][seriesKey];
    cd._colourIndex = null;
    cd.applied = false;
  }
}

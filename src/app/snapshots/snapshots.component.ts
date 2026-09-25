import { Component, effect, input, output, signal } from '@angular/core';
import { colours, facetNames } from '../_data';
import { filterList } from '../_helpers';
import {
  ColourSeriesData,
  CompareData,
  CompareDataDescriptor,
  HeaderNameType,
  IHash,
  SortBy,
  SortInfo,
  TableRow
} from '../_models';

@Component({
  selector: 'app-snapshots',
  templateUrl: './snapshots.component.html',
  styleUrls: ['./snapshots.component.scss'],
  imports: []
})
export class SnapshotsComponent {
  public colours = colours;

  facetName = input<string>('');
  isVisible = input<boolean>(false);
  hideItem = output<string>();
  showItems = output<Array<string>>();
  pinIndex = signal<number>(0);

  private readonly stateChangeTrigger = signal<number>(0);

  compareDataAllFacets: { [key: string]: CompareData } = facetNames.reduce(
    (map, s: string) => {
      map[s] = {};
      return map;
    },
    {} as { [key: string]: CompareData }
  );

  get compareData(): CompareData {
    this.stateChangeTrigger();
    return this.compareDataAllFacets[this.facetName()] || {};
  }

  constructor() {
    effect(() => {
      const activeFacet = this.facetName();
      if (!activeFacet) return;

      Object.keys(this.compareDataAllFacets).forEach((fName: string) => {
        if (fName !== activeFacet) {
          const cd = this.compareDataAllFacets[fName];
          Object.keys(cd).forEach((key: string) => {
            if (cd[key]) {
              cd[key].applied = false;
            }
          });
        }
      });
      this.stateChangeTrigger.update((v) => v + 1);
    });
  }

  filteredCDKeys(facetName: string, prop: string): Array<string> {
    const cd = this.compareDataAllFacets[facetName];
    if (!cd) return [];
    return Object.keys(cd).filter((key: string) => {
      return (cd[key] as unknown as Record<string, unknown>)?.[prop];
    });
  }

  sortDataList(
    data: IHash<number>,
    list: Array<string>,
    sortInfo: SortInfo
  ): void {
    let operandA: string | number;
    let operandB: string | number;
    const sortByCount = sortInfo.by === SortBy.count;

    list.sort((a: string, b: string) => {
      if (sortByCount) {
        operandA = data[a];
        operandB = data[b];
      } else {
        operandA = a;
        operandB = b;
      }
      if (sortInfo.dir === 1) {
        if (operandA > operandB) return 1;
        if (operandB > operandA) return -1;
      } else if (sortInfo.dir === -1) {
        if (operandA < operandB) return 1;
        if (operandA > operandB) return -1;
      }
      return 0;
    });
  }

  preSortAndFilter(
    facetName: string,
    seriesKeys: Array<string>,
    sortInfo: SortInfo,
    filterTerm = ''
  ): void {
    seriesKeys.forEach((seriesKey: string) => {
      const facetGroup = this.compareDataAllFacets[facetName];
      if (!facetGroup) return;
      const cd = facetGroup[seriesKey];
      if (!cd) return;
      const data = cd.data;

      let sortedKeys: Array<string>;

      if (cd.orderOriginal && sortInfo.dir === 0) {
        sortedKeys = filterList(filterTerm, cd.orderOriginal);
      } else {
        sortedKeys = filterList(filterTerm, Object.keys(data));
        this.sortDataList(data, sortedKeys, sortInfo);
      }
      cd.orderPreferred = sortedKeys;
    });
    this.stateChangeTrigger.update((v) => v + 1);
  }

  getSeriesDataForChart(
    facetName: string,
    seriesKeys: Array<string>,
    percent: boolean,
    offset: number,
    maxRows: number
  ): Array<ColourSeriesData> {
    return this.getSortKeys(seriesKeys).map(
      (seriesKey: string, keyIndex: number) => {
        const cd = this.compareDataAllFacets[facetName][seriesKey];
        const data = percent ? cd.dataPercent : cd.data;
        const cdKeys = cd.orderPreferred.slice(offset, offset + maxRows);
        return {
          data: cdKeys.reduce((map: IHash<number>, pref: string) => {
            map[`${pref} `] = data[pref];
            return map;
          }, {}),
          colour: colours[keyIndex],
          seriesName: seriesKey
        };
      }
    );
  }

  getSeriesDataForGrid(
    facetName: string,
    seriesKeys: Array<string>
  ): Array<TableRow> {
    const allPreferred: Array<string> = [];
    const result: Array<TableRow> = [];
    const cds = this.compareDataAllFacets[facetName];
    if (!cds) return [];

    this.getSortKeys(seriesKeys);

    seriesKeys.forEach((seriesKey: string, keyIndex: number) => {
      const cd = cds[seriesKey];
      if (!cd) return;

      cd.orderPreferred.forEach((key: string) => {
        allPreferred.push(key);
      });

      cd._colourIndex = keyIndex;
      result.push({
        name: 'Total',
        count: cd.total,
        isTotal: true,
        percent: 100,
        colourIndex: cd._colourIndex,
        series: cd.label,
        portalUrlInfo: {
          href: cd.portalUrls['summary'],
          rightsFilters: cd.rightsFilters
        }
      });
    });

    allPreferred.forEach((groupKey: string) => {
      seriesKeys.forEach((seriesKey: string) => {
        const cd = cds[seriesKey];
        if (!cd) return;
        const count = cd.data[groupKey];

        if (count) {
          result.push({
            name: groupKey as HeaderNameType,
            count: count,
            percent: cd.dataPercent[groupKey],
            colourIndex: cd._colourIndex,
            series: cd.label,
            portalUrlInfo: {
              href: cd.portalUrls[groupKey],
              rightsFilters: cd.rightsFilters
            }
          });
        }
      });
    });
    return result;
  }

  snap(facetName: string, key: string, cdd: CompareDataDescriptor): void {
    const cd = this.compareDataAllFacets[facetName];
    if (!cd) return;

    // delete any historical filter track that is neither pinned nor the active query view.
    Object.keys(cd).forEach((existingKey: string) => {
      const entry = cd[existingKey];
      if (entry && !entry.saved && !entry.current && existingKey !== key) {
        delete cd[existingKey];
      }
    });

    cd[key] = cdd;
    cdd.pinIndex = this.pinIndex();
    this.pinIndex.update((val) => val + 1);

    cdd.orderOriginal = Object.keys(cdd.data).slice(0);
    cdd.orderPreferred = Object.keys(cdd.data).slice(0);

    this.filteredCDKeys(facetName, 'applied').forEach((appliedKey: string) => {
      if (cd[appliedKey] && appliedKey !== key) {
        cd[appliedKey].applied = false;
      }
    });

    this.filteredCDKeys(facetName, 'current').forEach((currentKey: string) => {
      if (cd[currentKey]) cd[currentKey].current = false;
    });

    cdd.applied = true;
    cdd.current = true;

    this.stateChangeTrigger.update((v) => v + 1);
  }

  getSortKeys(keys?: Array<string>): Array<string> {
    const cd = this.compareDataAllFacets[this.facetName()];
    if (!cd) return [];

    if (!keys) {
      keys = Object.keys(cd);
    }

    return keys.sort((keyA: string, keyB: string) => {
      const indexA = cd[keyA]?.pinIndex ?? 0;
      const indexB = cd[keyB]?.pinIndex ?? 0;
      return indexB - indexA;
    });
  }

  toggleSaved(key: string, current = false): void {
    const cd = this.compareDataAllFacets[this.facetName()]?.[key];
    if (!cd) return;
    cd.saved = !cd.saved;

    if (!cd.saved && !current) {
      this.hideItem.emit(key);
    }
    this.stateChangeTrigger.update((v) => v + 1);
  }

  toggle(key: string, current = false): void {
    if (current) return;
    const cd = this.compareDataAllFacets[this.facetName()]?.[key];
    if (!cd) return;

    if (cd.applied) {
      this.hideItem.emit(key);
    } else {
      this.showItems.emit([key]);
    }
    this.stateChangeTrigger.update((v) => v + 1);
  }

  apply(facetName: string, seriesKeys: Array<string>): void {
    seriesKeys.forEach((seriesKey: string) => {
      const cd = this.compareDataAllFacets[facetName]?.[seriesKey];
      if (cd) cd.applied = true;
    });
    this.stateChangeTrigger.update((v) => v + 1);
  }

  unapply(seriesKey: string): void {
    const cd = this.compareDataAllFacets[this.facetName()]?.[seriesKey];
    if (!cd) return;
    cd._colourIndex = null;
    cd.applied = false;
    this.stateChangeTrigger.update((v) => v + 1);
  }
}

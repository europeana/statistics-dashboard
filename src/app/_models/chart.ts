import { IHash } from './models';

export interface ChartSettings {
  configurable: boolean;
  ctrlsOpen?: boolean;
  hasScroll?: boolean;
  isHorizontal?: boolean;
  labelTruncate?: boolean;
  labelWrap?: boolean;
  maxLabelWidth?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  prefixValueAxis?: string;
  chartLegend?: boolean;
}

export interface ColourSeriesData {
  colour: string;
  data: IHash<number>;
  seriesName: string;
}

export interface CompareDataDescriptor {
  _colourIndex?: number;
  applied: boolean;
  current?: boolean;
  data: IHash<number>;
  orderOriginal?: Array<string>;
  orderPreferred?: Array<string>;
  dataPercent: IHash<number>;
  label: string;
  name: string;
  portalUrls: IHash<string>;
  rightsFilters?: Array<string>;
  pinIndex: number;
  saved?: boolean;
  total: number;
}

export interface CompareData {
  [key: string]: CompareDataDescriptor;
}

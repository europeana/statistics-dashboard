import { IHashNumber, IHashString } from '.';

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
  showExports?: boolean;
  chartLegend?: boolean;
}

export interface ColourSeriesData {
  colour: string;
  data: IHashNumber;
  seriesName: string;
}

export interface CompareDataDescriptor {
  _colourIndex?: number;
  applied: boolean;
  current?: boolean;
  data: IHashNumber;
  orderOriginal?: Array<string>;
  orderPreferred?: Array<string>;
  dataPercent: IHashNumber;
  label: string;
  name: string;
  namesOriginal?: IHashString;
  pinIndex: number;
  saved?: boolean;
  total: number;
}

export interface CompareData {
  [key: string]: CompareDataDescriptor;
}

import { IHashNumber } from '.';

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
  data: IHashNumber;
  colour: string;
  seriesName: string;
}

export interface CompareData {
  [key: string]: {
    name: string;
    label: string;
    data: IHashNumber;
    dataPercent: IHashNumber;
    applied: boolean;
    saved?: boolean;
  };
}

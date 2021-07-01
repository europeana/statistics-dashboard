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
  colour: string;
  data: IHashNumber;
  seriesName: string;
}

export interface CompareData {
  [key: string]: {
    _colourIndex: number;
    applied: boolean;
    data: IHashNumber;
    dataPercent: IHashNumber;
    label: string;
    name: string;
    // make the order pinned (>count) the order used for activated
    //pinnedCount?: number;
    saved?: boolean;
  };
}

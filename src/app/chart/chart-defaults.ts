import { ChartSettings } from '../_models';

export const BarChartDefaults: ChartSettings = {
  configurable: false,
  ctrlsOpen: false,
  hasScroll: true,
  isHorizontal: true,
  labelTruncate: false,
  labelWrap: true,
  maxLabelWidth: 150,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  prefixValueAxis: null,
  showExports: false,
  chartLegend: false // used to set class 'offscreen'
};

export const BarChartCool: ChartSettings = {
  configurable: false,
  hasScroll: true,
  isHorizontal: true,
  maxLabelWidth: 250,
  paddingTop: 20,
  showExports: false
};

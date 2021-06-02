import { ChartSettings } from '../_models';

export const BarChartDefaults: ChartSettings = {
  configurable: false,
  ctrlsOpen: false,
  hasLines: true,
  hasScroll: false,
  is3D: false,
  isCylindrical: false,
  isHorizontal: true,
  labelTruncate: false,
  labelWrap: false,
  maxLabelWidth: 250,
  prefixValueAxis: null,
  showExports: false,
  strokeColour: '#000',
  strokeOpacity: 1.0,
  strokeWidth: 0,
  chartLegend: false // used to set class 'offscreen'
};

export const BarChartCool: ChartSettings = {
  configurable: true,
  hasLines: true,
  hasScroll: true,
  is3D: true,
  isHorizontal: true,
  maxLabelWidth: 250,
  showExports: true
};

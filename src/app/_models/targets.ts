import * as am4charts from '@amcharts/amcharts4/charts';
import { IHash } from '../_models';

export interface TargetData {
  value: number;
  label: string;
  interim?: boolean;
  range?: am4charts.ValueAxisDataItem;
}

export interface TemporalDataItem extends IHash<number | string> {
  date: string;
}

export interface CountryTargetData {
  targetAll: number;
  target3D: number;
  targetMetaTierA: number;
  dataRows: Array<TemporalDataItem>;
}

import * as am4charts from '@amcharts/amcharts4/charts';
import { IHash } from '../_models';

//export enum TargetFieldNames {
export enum SeriesValueNames {
  TOTAL = 'total',
  THREE_D = 'three_d',
  HQ = 'meta_tier_a'
}

export interface TargetData {
  value: number;
  label: string;
  interim?: boolean;
  range?: am4charts.ValueAxisDataItem;
}

export interface TargetDataRaw extends TargetData {
  country: string;
  targetType: SeriesValueNames;
}

type TargetFieldNameType = {
  [key in SeriesValueNames]: string;
};

export interface TemporalDataItem extends TargetFieldNameType {
  date: string;
  label: string;
  interim?: boolean;
}

export interface TemporalLocalisedDataItem extends TemporalDataItem {
  country: string;
}

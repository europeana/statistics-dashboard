import * as am4charts from '@amcharts/amcharts4/charts';

export enum TargetFieldNames {
  TOTAL = 'total',
  THREE_D = 'three_d',
  HQ = 'meta_tier_a'
}

export interface TargetDataBase {
  value: number;
  label: string;
  interim?: boolean;
}

export interface TargetDataRaw extends TargetDataBase {
  country: string;
  targetType: TargetFieldNames;
}

export interface TargetData extends TargetDataBase {
  range?: am4charts.ValueAxisDataItem;
}

type TargetFieldNameType = {
  [key in TargetFieldNames]: string;
};

export interface TemporalDataItem extends TargetFieldNameType {
  date: string;
  label: string;
  interim?: boolean;
}

export interface TemporalLocalisedDataItem extends TemporalDataItem {
  country: string;
}

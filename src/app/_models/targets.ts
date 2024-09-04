import * as am4charts from '@amcharts/amcharts4/charts';

export enum TargetFieldName {
  THREE_D = 'three_d',
  HQ = 'high_quality',
  TOTAL = 'total'
}

interface TargetMetaDataBase {
  value: number;
  targetYear: number;
  isInterim?: boolean;
}

export interface TargetMetaDataRaw extends TargetMetaDataBase {
  country: string;
  targetType: TargetFieldName;
}

export interface TargetMetaData extends TargetMetaDataBase {
  range?: am4charts.ValueAxisDataItem;
  rangeFakeSeries?: am4charts.LineSeries;
}

type TargetFieldNameType = {
  [key in TargetFieldName]: string;
};

export interface TargetData extends TargetFieldNameType {
  date: string;
}

export interface TargetCountryData extends TargetData {
  country: string;
}

export const TargetSeriesSuffixes = ['3D', 'high_quality', 'total'];

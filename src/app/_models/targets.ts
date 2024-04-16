import * as am4charts from '@amcharts/amcharts4/charts';

export enum TargetFieldName {
  THREE_D = 'three_d',
  HQ = 'hq'
}

interface TargetMetaDataBase {
  value: number;
  label: string;
  interim?: boolean;
}

export interface TargetMetaDataRaw extends TargetMetaDataBase {
  country: string;
  targetType: TargetFieldName;
}

export interface TargetMetaData extends TargetMetaDataBase {
  range?: am4charts.ValueAxisDataItem;
}

type TargetFieldNameType = {
  [key in TargetFieldName]: string;
};

export interface TargetData extends TargetFieldNameType {
  date: string;
  label: string;
}

export interface TargetCountryData extends TargetData {
  country: string;
}

export const TargetSeriesSuffixes = ['3D', 'META_A'];

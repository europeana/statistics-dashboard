import * as am4charts from '@amcharts/amcharts4/charts';

export enum TargetFieldName {
  THREE_D = 'three_d',
  HQ = 'high_quality',
  TOTAL = 'total'
}

export type VisibleHeatMap = {
  [key in
    | TargetFieldName.THREE_D
    | TargetFieldName.HQ
    | TargetFieldName.TOTAL]: number;
};

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

export interface CountryHistoryRequest {
  country: string;
  fnCallback: (result: Array<TargetCountryData>) => void;
}

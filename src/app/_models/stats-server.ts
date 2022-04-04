// FILTER / BREAKDOWN REQUEST

import { IHashArray, NamesValuePercent } from './';

export interface BreakdownRequest {
  datasetId?: string;
  filters: {
    [details: string]: RequestFilter | RequestFilterRange;
  };
}

export interface RequestFilterRange {
  from: string;
  to: string;
}

export interface RequestFilter {
  breakdown?: number;
  values?: Array<string>;
}

// RESPONSE

export interface CountPercentageValue {
  count: number;
  percentage: number;
  value: string;
  breakdowns?: BreakdownResult;
}

export interface FilterOption {
  filter: string;
  availableOptions: Array<string>;
}

export interface BreakdownResult {
  results: Array<CountPercentageValue>;
  breakdownBy?: string;
}

export interface BreakdownResults {
  filteringOptions: IHashArray<string>;
  results: CountPercentageValue;
}

export interface GeneralResults {
  allBreakdowns: Array<BreakdownResult>;
}

export interface GeneralResultsFormatted {
  [facetName: string]: Array<NamesValuePercent>;
}

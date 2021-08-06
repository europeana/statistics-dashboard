// FILTER / BREAKDOWN REQUEST

export interface BreakdownRequest {
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
  breakdown?: BreakdownResult;
}

export interface FilterOption {
  filter: string;
  availableOptions: Array<string>;
}

export interface BreakdownResult {
  results: Array<CountPercentageValue>;
  by?: string;
}

export interface BreakdownResults {
  filterOptions: {
    [details: string]: Array<string>;
  };
  results: CountPercentageValue;
}

export interface GeneralResults {
  allBreakdowns: Array<BreakdownResult>;
}

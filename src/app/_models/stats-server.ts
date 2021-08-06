// FILTER / BREAKDOWN REQUEST

export interface RequestFilterRange {
  from: string;
  to: string;
}

export interface RequestFilter {
  breakdown?: number;
  values?: Array<string>;
}

export interface BreakdownRequest {
  filters: {
    [details: string]: RequestFilter | RequestFilterRange;
  };
}

// RESPONSE

export interface CountPercentageValue {
  count: number;
  percentage: number;
  value: string;
  results?: BreakdownResult;
}

export interface FilterOption {
  filter: string;
  availableOptions: Array<string>;
}

export interface BreakdownResult {
  breakdown: Array<CountPercentageValue>;
  by: string;
}

export interface GeneralResults {
  results: Array<BreakdownResult>;
}

export interface BreakdownResults extends GeneralResults {
  filterOptions: Array<FilterOption>;
}

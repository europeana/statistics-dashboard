import { signal } from '@angular/core';
import { GeneralResults, GeneralResultsFormatted } from '../_models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockFilterStateService = (): any => {
  return {
    includeCTZero: signal<boolean>(false),
    hasCountryMapData: signal<boolean>(false),
    landingData: signal<GeneralResultsFormatted>({} as GeneralResultsFormatted),
    landingDataIsLoading: signal<boolean>(false),
    rawGeneralData: signal<GeneralResults | null>({
      allBreakdowns: []
    } as unknown as GeneralResults),
    countryTotalMap: signal<Record<string, string>>({
      France: '1'
    }),
    pageTitleDynamic: signal<boolean>(false),
    pageTitleInViewport: signal<boolean>(false),
    activeCountry: signal<string | undefined>(undefined)
  };
};

import { computed, Injectable, signal } from '@angular/core';
import { sortByDecodedCountryName } from '../_helpers';
import {
  BreakdownResult,
  CountPercentageValue,
  GeneralResults,
  GeneralResultsFormatted
} from '../_models';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  readonly includeCTZero = signal<boolean>(false);
  readonly rawGeneralData = signal<GeneralResults | null>(null);
  readonly landingData = computed<GeneralResultsFormatted>(() => {
    const general = this.rawGeneralData();
    if (!general) return {};

    const processedData: GeneralResultsFormatted = {};

    general.allBreakdowns.forEach((br: BreakdownResult) => {
      processedData[br.breakdownBy] = br.results.map(
        (cpv: CountPercentageValue) => ({
          name: cpv.value,
          value: cpv.count,
          percent: cpv.percentage
        })
      );
    });

    return processedData;
  });
  readonly countryTotalMap = computed<Record<string, string>>(() => {
    const general = this.rawGeneralData();
    if (!general) return {};

    const tempCountryTotalMap: Record<string, number> = {};

    // Find the country breakdown and extract percentages
    const countryBreakdown = general.allBreakdowns.find(
      (br) => br.breakdownBy === 'country'
    );

    if (countryBreakdown) {
      countryBreakdown.results.forEach((result: CountPercentageValue) => {
        tempCountryTotalMap[result.value] = result.percentage;
      });
    }

    // Sort and build the final formatted map object
    return Object.keys(tempCountryTotalMap)
      .sort(sortByDecodedCountryName)
      .reduce((ob, sortedKey) => {
        ob[sortedKey] = String(tempCountryTotalMap[sortedKey]);
        return ob;
      }, {} as Record<string, string>);
  });
  readonly hasCountryMapData = computed<boolean>(() => {
    return Object.keys(this.countryTotalMap()).length > 0;
  });
  readonly landingDataIsLoading = signal<boolean>(false);
  readonly pageTitleDynamic = signal<boolean>(false);
  readonly pageTitleInViewport = signal<boolean>(false);
  readonly activeCountry = signal<string | undefined>(undefined);
}

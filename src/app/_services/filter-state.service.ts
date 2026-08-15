import { Injectable, signal } from '@angular/core';
import { GeneralResultsFormatted } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  includeCTZero = signal<boolean>(false);
  hasCountryMapData = signal<boolean>(false);
  landingData = signal<GeneralResultsFormatted>({});
  landingDataIsLoading = signal<boolean>(false);
}

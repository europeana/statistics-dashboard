import { Component, forwardRef, input } from '@angular/core';
import { MapComponent } from '../chart';
import { IdValue } from '../_models';

interface MapColourConfig {
  base: { hex: string };
  highlight: string | { hex: string };
  outline: string | { hex: string };
}

@Component({
  selector: 'app-map-chart',
  template: '',
  standalone: true,
  providers: [
    {
      provide: MapComponent,
      useExisting: forwardRef(() => MockMapComponent)
    }
  ]
})
export class MockMapComponent {
  mapData = input<IdValue[]>();

  public colourSchemeDefault = {
    base: { hex: '#ffffff' },
    highlight: { hex: '#0771ce' },
    outline: { hex: '#cccccc' }
  };

  public colourSchemeTargets: Record<string, MapColourConfig[]> = {
    total: [{ base: { hex: '#ffffff' }, highlight: '', outline: '' }],
    three_d: [{ base: { hex: '#ffffff' }, highlight: '', outline: '' }],
    high_quality: [{ base: { hex: '#ffffff' }, highlight: '', outline: '' }]
  };

  public colourScheme: MapColourConfig | undefined;
  public selectedCountry: string | undefined = 'FR';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  countryClick(_countryCode: string | undefined): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMapPercentMode(_isPercent: boolean): void {}
}

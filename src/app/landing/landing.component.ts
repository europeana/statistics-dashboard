import { Component, Input } from '@angular/core';
import { externalLinks } from '../_data';
import {
  BreakdownResult,
  CountPercentageValue,
  DimensionName,
  GeneralResultsFormatted
} from '../_models';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;

  barColour = '#0771ce';
  isLoading = true;

  @Input() landingData: GeneralResultsFormatted;
}

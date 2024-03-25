/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
/* (short versions for use in the summary grid)
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DimensionName } from '../_models';

const facetNames: { [key: string]: string } = {};

facetNames[
  DimensionName.contentTier
] = $localize`:@@facetNameShortContentTier:Tier`;

facetNames[
  DimensionName.metadataTier
] = $localize`:@@facetNameShortMetadataTier:Tier`;

facetNames[DimensionName.country] = $localize`:@@facetNameShortCountry:Country`;

facetNames[DimensionName.type] = $localize`:@@facetNameShortType:Type`;

facetNames[
  DimensionName.rightsCategory
] = $localize`:@@facetNameShortRightsCategory:Rights Category`;

facetNames[
  DimensionName.dataProvider
] = $localize`:@@facetNameShortDataProvider:CHI`;

facetNames[
  DimensionName.provider
] = $localize`:@@facetNameShortProvider:Provider`;

facetNames[
  `plural_${DimensionName.contentTier}`
] = $localize`:@@facetNameShortPluralContentTier:Tiers`;

facetNames[
  `plural_${DimensionName.metadataTier}`
] = $localize`:@@facetNameShortPluralMetadataTier:Tiers`;

facetNames[
  `plural_${DimensionName.country}`
] = $localize`:@@facetNameShortPluralCountry:Countries`;

facetNames[
  `plural_${DimensionName.type}`
] = $localize`:@@facetNameShortPluralType:Types`;

facetNames[
  `plural_${DimensionName.rightsCategory}`
] = $localize`:@@facetNameShortPluralRightsCategory:Rights Category`;

facetNames[
  `plural_${DimensionName.dataProvider}`
] = $localize`:@@facetNameShortPluralDataProvider:CHIs`;

facetNames[
  `plural_${DimensionName.provider}`
] = $localize`:@@facetNameShortPluralProvider:Providers`;

@Pipe({
  name: 'renameApiFacetShort',
  standalone: true
})
export class RenameApiFacetShortPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

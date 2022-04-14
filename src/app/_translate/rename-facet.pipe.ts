/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DimensionName } from '../_models';

const facetNames: { [key: string]: string } = {};

facetNames[
  DimensionName.contentTier
] = $localize`:@@facetNameContentTier:Content Tier`;
facetNames[
  DimensionName.metadataTier
] = $localize`:@@facetNameMetadataTier:Metadata Tier`;
facetNames[DimensionName.country] = $localize`:@@facetNameCountry:Country`;
facetNames[DimensionName.type] = $localize`:@@facetNameMediaType:Media Type`;
facetNames[
  DimensionName.rightsCategory
] = $localize`:@@facetNameRights:Rights Category`;
facetNames[
  DimensionName.dataProvider
] = $localize`:@@facetNameDataProvider:Data Provider`;
facetNames[DimensionName.provider] = $localize`:@@facetNameProvider:Provider`;
facetNames['dates'] = $localize`:@@facetNameDates:Last Updated`;

@Pipe({
  name: 'renameApiFacet'
})
export class RenameApiFacetPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

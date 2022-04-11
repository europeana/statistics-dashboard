/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DimensionName } from '../_models';

const facetNames: { [key: string]: string } = {};

facetNames[DimensionName.contentTier] = 'Content Tier';
facetNames[DimensionName.metadataTier] = 'Metadata Tier';
facetNames[DimensionName.country] = 'Country';
facetNames[DimensionName.type] = 'Media Type';
facetNames[DimensionName.rightsCategory] = 'Rights Category';
facetNames[DimensionName.dataProvider] = 'Data Provider';
facetNames[DimensionName.provider] = 'Provider';

facetNames['dates'] = 'Last Updated';

@Pipe({
  name: 'renameApiFacet'
})
export class RenameApiFacetPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

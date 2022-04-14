/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
/* (short versions for use in the summary grid)
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DimensionName } from '../_models';

const facetNames: { [key: string]: string } = {};

facetNames[DimensionName.contentTier] = 'Tier';
facetNames[DimensionName.metadataTier] = 'Tier';
facetNames[DimensionName.country] = 'Country';
facetNames[DimensionName.type] = 'Type';
facetNames[DimensionName.rightsCategory] = 'Rights Category';
facetNames[DimensionName.dataProvider] = 'CHI';
facetNames[DimensionName.provider] = 'Provider';

facetNames[`plural_${DimensionName.contentTier}`] = 'Tiers';
facetNames[`plural_${DimensionName.metadataTier}`] = 'Tiers';
facetNames[`plural_${DimensionName.country}`] = 'Countries';
facetNames[`plural_${DimensionName.type}`] = 'Types';
facetNames[`plural_${DimensionName.rightsCategory}`] = 'Rights Category';
facetNames[`plural_${DimensionName.dataProvider}`] = 'CHIs';
facetNames[`plural_${DimensionName.provider}`] = 'Providers';

@Pipe({
  name: 'renameApiFacetShort'
})
export class RenameApiFacetShortPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

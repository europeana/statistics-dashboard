/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';

const facetNames: { [key: string]: string } = {
  contentTier: 'Tier',
  metadataTier: 'Tier',
  country: 'Country',
  type: 'Type',
  rights: 'Rights',
  dataProvider: 'CHI',
  provider: 'Provider',

  plural_contentTier: 'Tiers',
  plural_metadataTier: 'Tiers',
  plural_country: 'Countries',
  plural_type: 'Types',
  plural_rights: 'Rights',
  plural_dataProvider: 'CHIs',
  plural_provider: 'Providers'
};

@Pipe({
  name: 'renameApiFacetShort'
})
export class RenameApiFacetShortPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

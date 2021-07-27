/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';

const facetNames: { [key: string]: string } = {
  contentTier: 'Tier',
  metadataTier: 'Tier',
  COUNTRY: 'Country',
  TYPE: 'Type',
  RIGHTS: 'Rights',
  DATA_PROVIDER: 'CHI',
  PROVIDER: 'Provider',

  plural_contentTier: 'Tiers',
  plural_metadataTier: 'Tiers',
  plural_COUNTRY: 'Countries',
  plural_TYPE: 'Types',
  plural_RIGHTS: 'Rights',
  plural_DATA_PROVIDER: 'CHIs',
  plural_PROVIDER: 'Providers'
};

@Pipe({
  name: 'renameApiFacetShort'
})
export class RenameApiFacetShortPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

/** RenameApiFacetPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for facet names
*/
import { Pipe, PipeTransform } from '@angular/core';

const facetNames: { [key: string]: string } = {
  contentTier: 'Content Tier',
  metadataTier: 'Metadata Tier',
  COUNTRY: 'Country',
  TYPE: 'Type',
  RIGHTS: 'Rights',
  DATA_PROVIDER: 'Data Provider',
  PROVIDER: 'Provider'
};

@Pipe({
  name: 'renameApiFacet'
})
export class RenameApiFacetPipe implements PipeTransform {
  transform(value: string): string {
    return facetNames[value] || value;
  }
}

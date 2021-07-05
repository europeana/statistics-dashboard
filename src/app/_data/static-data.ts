import { HeaderNameType } from '../_models';

export const facetNames = [
  'contentTier',
  'COUNTRY',
  'DATA_PROVIDER',
  'metadataTier',
  'PROVIDER',
  'RIGHTS',
  'TYPE'
];

export const colours = ['#0a72cc', '#e11d53', '#ffae00', '#219d31'];

export const tableColumnNames = ['name', 'count', 'percent'].map(
  (x) => x as HeaderNameType
);

export const RightsStatements = {
  '//creativecommons.org/licenses/by-nc-nd': 'CC BY-NC-ND',
  '//creativecommons.org/licenses/by-nc-nd/2.0': 'CC BY-NC-ND 2.0',
  '//creativecommons.org/licenses/by-nc-nd/2.5': 'CC BY-NC-ND 2.5',
  '//creativecommons.org/licenses/by-nc-nd/2.5/ch': 'CC BY-NC-ND 2.5 CH',
  '//creativecommons.org/licenses/by-nc-nd/2.5/pl': 'CC BY-NC-ND 2.5 PL',
  '//creativecommons.org/licenses/by-nc-nd/2.5/pt': 'CC BY-NC-ND 2.5 PT',
  '//creativecommons.org/licenses/by-nc-nd/3.0': 'CC BY-NC-ND 3.0',
  '//creativecommons.org/licenses/by-nc-nd/3.0/de': 'CC BY-NC-ND 3.0 DE',
  '//creativecommons.org/licenses/by-nc-nd/3.0/pl': 'CC BY-NC-ND 3.0 PL',

  '//creativecommons.org/licenses/by-nc-nd/3.0/es/deed.ca':
    'CC BY-NC-ND 3.0 ES',

  '//creativecommons.org/licenses/by-nc-nd/3.0/gr': 'CC BY-NC-ND 3.0 GR',
  '//creativecommons.org/licenses/by-nc-nd/4.0': 'CC BY-NC-ND 4.0',
  '//creativecommons.org/licenses/by-nc-sa/2.5': 'CC BY-NC-SA 2.5',
  '//creativecommons.org/licenses/by-nc-sa/2.5/fr': 'CC BY-NC-SA 2.5 FR',
  '//creativecommons.org/licenses/by-nc-sa/2.5/pl': 'CC BY-NC-SA 2.5 PL',
  '//creativecommons.org/licenses/by-nc-sa/3.0': 'CC BY-NC-SA 3.0',
  '//creativecommons.org/licenses/by-nc-sa/3.0/de': 'CC BY-NC-SA 3.0 DE',
  '//creativecommons.org/licenses/by-nc-sa/3.0/es': 'CC BY-NC-SA 3.0 ES',
  '//creativecommons.org/licenses/by-nc-sa/3.0/ie': 'CC BY-NC-SA 3.0 IE',
  '//creativecommons.org/licenses/by-nc-sa/3.0/pl': 'CC BY-NC-SA 3.0 PL',
  '//creativecommons.org/licenses/by-nc-sa/4.0': 'CC BY-NC-SA 4.0',
  '//creativecommons.org/licenses/by-nc-sa/4.0/deed.de': 'CC BY-NC-SA 4.0',

  '//creativecommons.org/licenses/by-nc/2.0': 'CC BY-NC 2.0',
  '//creativecommons.org/licenses/by-nc/2.0/at': 'CC BY-NC 2.0 AT',
  '//creativecommons.org/licenses/by-nc/2.5/pl': 'CC BY-NC 2.5 PL',
  '//creativecommons.org/licenses/by-nc/2.5/se': 'CC BY-NC 2.5 SE',
  '//creativecommons.org/licenses/by-nc/3.0': 'CC BY-NC 3.0',
  '//creativecommons.org/licenses/by-nc/3.0/de': 'CC BY-NC 3.0 DE',
  '//creativecommons.org/licenses/by-nc/3.0/nl': 'CC BY-NC 3.0 NL',
  '//creativecommons.org/licenses/by-nc/3.0/pl': 'CC BY-NC 3.0 PL',
  '//creativecommons.org/licenses/by-nc/3.0/pt': 'CC BY-NC 3.0 PT',
  '//creativecommons.org/licenses/by-nc/4.0': 'CC BY-NC 4.0',
  '//creativecommons.org/licenses/by-nd/2.5/pl': 'CC BY-ND 2.5 PL',
  '//creativecommons.org/licenses/by-nd/3.0': 'CC BY-ND 3.0',
  '//creativecommons.org/licenses/by-nd/3.0/de': 'CC BY-ND 3.0 DE',
  '//creativecommons.org/licenses/by-nd/3.0/pl': 'CC BY-ND 3.0 PL',
  '//creativecommons.org/licenses/by-nd/4.0': 'CC BY-ND 4.0',
  '//creativecommons.org/licenses/by-sa': 'CC BY-SA',
  '//creativecommons.org/licenses/by-sa/2.5': 'CC BY-SA 2.5',
  '//creativecommons.org/licenses/by-sa/3.0': 'CC BY-SA 3.0',
  '//creativecommons.org/licenses/by-sa/3.0/': 'CC BY-SA 3.0',
  '//creativecommons.org/licenses/by-sa/3.0/de': 'CC BY-SA 3.0 DE',
  '//creativecommons.org/licenses/by-sa/3.0/nl': 'CC BY-SA 3.0 NL',
  '//creativecommons.org/licenses/by-sa/3.0/pl': 'CC BY-SA 3.0 PL',
  '//creativecommons.org/licenses/by-sa/4.0': 'CC BY-SA 4.0',
  '//creativecommons.org/licenses/by/2.0/': 'CC BY 2.0',
  '//creativecommons.org/licenses/by/2.0/uk': 'CC BY 2.0 UK',
  '//creativecommons.org/licenses/by/2.5': 'CC BY 2.5',
  '//creativecommons.org/licenses/by/2.5/pl': 'CC BY 2.5 PL',
  '//creativecommons.org/licenses/by/3.0': 'CC BY 3.0',
  '//creativecommons.org/licenses/by/3.0/pl': 'CC BY 3.0 PL',
  '//creativecommons.org/licenses/by/3.0/de': 'CC BY 3.0 DE',
  '//creativecommons.org/licenses/by/4.0': 'CC BY 4.0',
  '//creativecommons.org/publicdomain/mark/1.0': 'No Copyright',
  '//creativecommons.org/publicdomain/zero/1.0': 'CC0 1.0 Universal',
  '//rightsstatements.org/page/InC/1.0': 'In Copyright',

  '//rightsstatements.org/vocab/CNE/1.0': 'Copyright Not Evaluated',

  '//rightsstatements.org/vocab/InC-EDU/1.0': 'Educational Use Permitted',
  '//rightsstatements.org/vocab/InC-OW-EU/1.0': 'In Copyright - EU Orphan Work',
  '//rightsstatements.org/vocab/InC/1.0': 'In Copyright',
  '//rightsstatements.org/vocab/NoC-NC/1.0': 'Non-Commercial Use Only',
  '//rightsstatements.org/vocab/NoC-OKLR/1.0': 'Other Known Legal Restrictions',
  '//www.europeana.eu/rights/out-of-copyright-non-commercial':
    '(Europena Out of Copyright)',
  '//www.europeana.eu/rights/rr-f': 'Rights Reserved - Free Access'
};

export const facetNames = [
  'contentTier',
  'COUNTRY',
  'DATA_PROVIDER',
  'metadataTier',
  'PROVIDER',
  'RIGHTS',
  'TYPE'
];

export const STATIC_DATA_RIGHTS = {
  'https://creativecommons.org/licenses/by-nc-nd': 'CC BY-NC-ND',
  'https://creativecommons.org/licenses/by-nc-nd/2.0': 'CC BY-NC-ND 2.0',
  'https://creativecommons.org/licenses/by-nc-nd/2.5': 'CC BY-NC-ND 2.5',
  'https://creativecommons.org/licenses/by-nc-nd/2.5/ch': 'CC BY-NC-ND 2.5 CH',
  'https://creativecommons.org/licenses/by-nc-nd/2.5/pl': 'CC BY-NC-ND 2.5 PL',
  'https://creativecommons.org/licenses/by-nc-nd/2.5/pt': 'CC BY-NC-ND 2.5 PT',
  'https://creativecommons.org/licenses/by-nc-nd/3.0': 'CC BY-NC-ND 3.0',
  'https://creativecommons.org/licenses/by-nc-nd/3.0/de': 'CC BY-NC-ND 3.0 DE',
  'https://creativecommons.org/licenses/by-nc-nd/3.0/pl': 'CC BY-NC-ND 3.0 PL',

  'https://creativecommons.org/licenses/by-nc-nd/3.0/es/deed.ca':
    'CC BY-NC-ND 3.0 ES',

  'https://creativecommons.org/licenses/by-nc-nd/3.0/gr': 'CC BY-NC-ND 3.0 GR',
  'https://creativecommons.org/licenses/by-nc-nd/4.0': 'CC BY-NC-ND 4.0',
  'https://creativecommons.org/licenses/by-nc-sa/2.5': 'CC BY-NC-SA 2.5',
  'https://creativecommons.org/licenses/by-nc-sa/2.5/fr': 'CC BY-NC-SA 2.5 FR',
  'https://creativecommons.org/licenses/by-nc-sa/2.5/pl': 'CC BY-NC-SA 2.5 PL',
  'https://creativecommons.org/licenses/by-nc-sa/3.0': 'CC BY-NC-SA 3.0',
  'https://creativecommons.org/licenses/by-nc-sa/3.0/de': 'CC BY-NC-SA 3.0 DE',
  'https://creativecommons.org/licenses/by-nc-sa/3.0/es': 'CC BY-NC-SA 3.0 ES',
  'https://creativecommons.org/licenses/by-nc-sa/3.0/ie': 'CC BY-NC-SA 3.0 IE',
  'https://creativecommons.org/licenses/by-nc-sa/3.0/pl': 'CC BY-NC-SA 3.0 PL',
  'https://creativecommons.org/licenses/by-nc-sa/4.0': 'CC BY-NC-SA 4.0',
  'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de':
    'CC BY-NC-SA 4.0',

  'https://creativecommons.org/licenses/by-nc/2.0': 'CC BY-NC 2.0',
  'https://creativecommons.org/licenses/by-nc/2.0/at': 'CC BY-NC 2.0 AT',
  'https://creativecommons.org/licenses/by-nc/2.5/pl': 'CC BY-NC 2.5 PL',
  'https://creativecommons.org/licenses/by-nc/2.5/se': 'CC BY-NC 2.5 SE',
  'https://creativecommons.org/licenses/by-nc/3.0': 'CC BY-NC 3.0',
  'https://creativecommons.org/licenses/by-nc/3.0/de': 'CC BY-NC 3.0 DE',
  'https://creativecommons.org/licenses/by-nc/3.0/nl': 'CC BY-NC 3.0 NL',
  'https://creativecommons.org/licenses/by-nc/3.0/pl': 'CC BY-NC 3.0 PL',
  'https://creativecommons.org/licenses/by-nc/3.0/pt': 'CC BY-NC 3.0 PT',
  'https://creativecommons.org/licenses/by-nc/4.0': 'CC BY-NC 4.0',
  'https://creativecommons.org/licenses/by-nd/2.5/pl': 'CC BY-ND 2.5 PL',
  'https://creativecommons.org/licenses/by-nd/3.0': 'CC BY-ND 3.0',
  'https://creativecommons.org/licenses/by-nd/3.0/de': 'CC BY-ND 3.0 DE',
  'https://creativecommons.org/licenses/by-nd/3.0/pl': 'CC BY-ND 3.0 PL',
  'https://creativecommons.org/licenses/by-nd/4.0': 'CC BY-ND 4.0',
  'https://creativecommons.org/licenses/by-sa': 'CC BY-SA',
  'https://creativecommons.org/licenses/by-sa/2.5': 'CC BY-SA 2.5',
  'https://creativecommons.org/licenses/by-sa/3.0': 'CC BY-SA 3.0',
  'https://creativecommons.org/licenses/by-sa/3.0/': 'CC BY-SA 3.0',
  'https://creativecommons.org/licenses/by-sa/3.0/de': 'CC BY-SA 3.0 DE',
  'https://creativecommons.org/licenses/by-sa/3.0/nl': 'CC BY-SA 3.0 NL',
  'https://creativecommons.org/licenses/by-sa/3.0/pl': 'CC BY-SA 3.0 PL',
  'https://creativecommons.org/licenses/by-sa/4.0': 'CC BY-SA 4.0',
  'https://creativecommons.org/licenses/by/2.0/': 'CC BY 2.0',
  'https://creativecommons.org/licenses/by/2.0/uk': 'CC BY 2.0 UK',
  'https://creativecommons.org/licenses/by/2.5': 'CC BY 2.5',
  'https://creativecommons.org/licenses/by/2.5/pl': 'CC BY 2.5 PL',
  'https://creativecommons.org/licenses/by/3.0': 'CC BY 3.0',
  'https://creativecommons.org/licenses/by/3.0/pl': 'CC BY 3.0 PL',
  'https://creativecommons.org/licenses/by/3.0/de': 'CC BY 3.0 DE',
  'https://creativecommons.org/licenses/by/4.0': 'CC BY 4.0',
  'https://creativecommons.org/publicdomain/mark/1.0': 'No Copyright',
  'https://creativecommons.org/publicdomain/zero/1.0': 'CC0 1.0 Universal',
  'https://rightsstatements.org/page/InC/1.0': 'In Copyright',

  'https://rightsstatements.org/vocab/CNE/1.0': 'Copyright Not Evaluated',

  'https://rightsstatements.org/vocab/InC-EDU/1.0': 'Educational Use Permitted',
  'https://rightsstatements.org/vocab/InC-OW-EU/1.0':
    'In Copyright - EU Orphan Work',
  'https://rightsstatements.org/vocab/InC/1.0': 'In Copyright',
  'https://rightsstatements.org/vocab/NoC-NC/1.0': 'Non-Commercial Use Only',
  'https://rightsstatements.org/vocab/NoC-OKLR/1.0':
    'Other Known Legal Restrictions',
  'https://www.europeana.eu/rights/out-of-copyright-non-commercial':
    '(Europena Out of Copyright)',
  'https://www.europeana.eu/rights/rr-f': 'Rights Reserved - Free Access'
};

import { DimensionName, IHash, NonFacetFilterNames } from '../_models';

export const facetNames: Array<DimensionName> = [
  DimensionName.contentTier,
  DimensionName.metadataTier,
  DimensionName.country,
  DimensionName.dataProvider,
  DimensionName.provider,
  DimensionName.rights,
  DimensionName.type
];

const additionalFilters: IHash<string> = {};
additionalFilters[NonFacetFilterNames.contentTierZero] = 'content-tier-zero';
additionalFilters[NonFacetFilterNames.dateFrom] = 'date-from';
additionalFilters[NonFacetFilterNames.dateTo] = 'date-to';
additionalFilters[NonFacetFilterNames.datasetId] = 'dataset-id';

export const nonFacetFilters = additionalFilters;

const facetNamesPortal: IHash<string> = {};

facetNamesPortal[DimensionName.contentTier] = 'contentTier';
facetNamesPortal[DimensionName.metadataTier] = 'metadataTier';
facetNamesPortal[DimensionName.country] = 'COUNTRY';
facetNamesPortal[DimensionName.dataProvider] = 'DATA_PROVIDER';
facetNamesPortal[DimensionName.provider] = 'PROVIDER';
facetNamesPortal[DimensionName.rights] = 'RIGHTS';
facetNamesPortal[DimensionName.type] = 'TYPE';

export const portalNames = facetNamesPortal;

export const colours = ['#0a72cc', '#e11d53', '#ffae00', '#219d31'];

export const DiacriticsMap = {
  A: 'AÁĂẮẶẰẲẴǍÂẤẬẦẨẪÄẠÀẢĀĄÅǺÃÆǼА',
  B: 'BḄƁʚɞБВ',
  C: 'CĆČÇĈĊƆʗЦЧ',
  D: 'DĎḒḌƊḎǲǅĐÐǱǄД',
  E: 'EÉĔĚÊẾỆỀỂỄËĖẸÈẺĒĘẼƐƏЕЁЭ',
  F: 'FƑФ',
  G: 'GǴĞǦĢĜĠḠʛГ',
  H: 'HḪĤḤĦГ',
  I: 'IÍĬǏÎÏİỊÌỈĪĮĨĲИ',
  J: 'JĴ',
  K: 'KĶḲƘḴК',
  L: 'LĹȽĽĻḼḶḸḺĿǈŁǇЛ',
  M: 'MḾṀṂМ',
  N: 'NŃŇŅṊṄṆǸƝṈǋÑǊН',
  O: 'OÓŎǑÔỐỘỒỔỖÖỌŐÒỎƠỚỢỜỞỠŌƟǪØǾÕŒɶО',
  P: 'PÞП',
  Q: 'Q',
  R: 'RŔŘŖṘṚṜṞʁРЯ',
  S: 'SŚŠŞŜȘṠṢẞСšШЩ',
  T: 'TŤŢṰȚṬṮŦÞÐТ',
  U: 'UÚŬǓÛÜǗǙǛǕỤŰÙỦƯỨỰỪỬỮŪŲŮŨУЮ',
  V: 'VВ',
  W: 'WẂŴẄẀʬВ',
  X: 'XХ',
  Y: 'YÝŶŸẎỴỲƳỶȲỸЙЫ',
  Z: 'ZŹŽŻẒẔƵЖЗЦ'
};

export const externalLinks = {
  ctZero: 'https://pro.europeana.eu/page/edm-documentation',
  europeana: '//www.europeana.eu',
  pro: '//pro.europeana.eu',
  api: '//api.europeana.eu',
  tos: '//www.europeana.eu/rights/terms-of-use',
  privacy: '//www.europeana.eu/rights/privacy-policy',
  help: {
    contentTier:
      'https://europeana.atlassian.net/wiki/spaces/EF/pages/2060386340/Requirements+for+digital+objects+Tier+1',
    metadataTier:
      'https://europeana.atlassian.net/wiki/spaces/EF/pages/1969979393/Recommendations+for+metadata+Tier+A-C',
    provider: 'https://pro.europeana.eu/page/aggregators',
    rights: 'https://pro.europeana.eu/page/available-rights-statements'
  }
};

export const ISOCountryCodes = {
  Bangladesh: 'BD',
  Belgium: 'BE',
  'Burkina Faso': 'BF',
  Bulgaria: 'BG',
  'Bosnia and Herzegovina': 'BA',
  Barbados: 'BB',
  'Wallis and Futuna': 'WF',
  'Saint Barthelemy': 'BL',
  Bermuda: 'BM',
  Brunei: 'BN',
  Bolivia: 'BO',
  Bahrain: 'BH',
  Burundi: 'BI',
  Benin: 'BJ',
  Bhutan: 'BT',
  Jamaica: 'JM',
  'Bouvet Island': 'BV',
  Botswana: 'BW',
  Samoa: 'WS',
  'Bonaire, Saint Eustatius and Saba ': 'BQ',
  Brazil: 'BR',
  Bahamas: 'BS',
  Jersey: 'JE',
  Belarus: 'BY',
  Belize: 'BZ',
  Russia: 'RU',
  Rwanda: 'RW',
  Serbia: 'RS',
  'East Timor': 'TL',
  Reunion: 'RE',
  Turkmenistan: 'TM',
  Tajikistan: 'TJ',
  Romania: 'RO',
  Tokelau: 'TK',
  'Guinea-Bissau': 'GW',
  Guam: 'GU',
  Guatemala: 'GT',
  'South Georgia and the South Sandwich Islands': 'GS',
  Greece: 'GR',
  'Equatorial Guinea': 'GQ',
  Guadeloupe: 'GP',
  Japan: 'JP',
  Guyana: 'GY',
  Guernsey: 'GG',
  'French Guiana': 'GF',
  Georgia: 'GE',
  Grenada: 'GD',
  'United Kingdom': 'GB',
  Gabon: 'GA',
  'El Salvador': 'SV',
  Guinea: 'GN',
  Gambia: 'GM',
  Greenland: 'GL',
  Gibraltar: 'GI',
  Ghana: 'GH',
  Oman: 'OM',
  Tunisia: 'TN',
  Jordan: 'JO',
  Croatia: 'HR',
  Haiti: 'HT',
  Hungary: 'HU',
  'Hong Kong': 'HK',
  Honduras: 'HN',
  'Heard Island and McDonald Islands': 'HM',
  Venezuela: 'VE',
  'Puerto Rico': 'PR',
  'Palestinian Territory': 'PS',
  Palau: 'PW',
  Portugal: 'PT',
  'Svalbard and Jan Mayen': 'SJ',
  Paraguay: 'PY',
  Iraq: 'IQ',
  Panama: 'PA',
  'French Polynesia': 'PF',
  'Papua New Guinea': 'PG',
  Peru: 'PE',
  Pakistan: 'PK',
  Philippines: 'PH',
  Pitcairn: 'PN',
  Poland: 'PL',
  'Saint Pierre and Miquelon': 'PM',
  Zambia: 'ZM',
  'Western Sahara': 'EH',
  Estonia: 'EE',
  Egypt: 'EG',
  'South Africa': 'ZA',
  Ecuador: 'EC',
  Italy: 'IT',
  Vietnam: 'VN',
  'Solomon Islands': 'SB',
  Ethiopia: 'ET',
  Somalia: 'SO',
  Zimbabwe: 'ZW',
  'Saudi Arabia': 'SA',
  Spain: 'ES',
  Eritrea: 'ER',
  Montenegro: 'ME',
  Moldova: 'MD',
  Madagascar: 'MG',
  'Saint Martin': 'MF',
  Morocco: 'MA',
  Monaco: 'MC',
  Uzbekistan: 'UZ',
  Myanmar: 'MM',
  Mali: 'ML',
  Macao: 'MO',
  Mongolia: 'MN',
  'Marshall Islands': 'MH',
  Macedonia: 'MK',
  Mauritius: 'MU',
  Malta: 'MT',
  Malawi: 'MW',
  Maldives: 'MV',
  Martinique: 'MQ',
  'Northern Mariana Islands': 'MP',
  Montserrat: 'MS',
  Mauritania: 'MR',
  'Isle of Man': 'IM',
  Uganda: 'UG',
  Tanzania: 'TZ',
  Malaysia: 'MY',
  Mexico: 'MX',
  Israel: 'IL',
  France: 'FR',
  'British Indian Ocean Territory': 'IO',
  'Saint Helena': 'SH',
  Finland: 'FI',
  Fiji: 'FJ',
  'Falkland Islands': 'FK',
  Micronesia: 'FM',
  'Faroe Islands': 'FO',
  Nicaragua: 'NI',
  Netherlands: 'NL',
  Norway: 'NO',
  Namibia: 'NA',
  Vanuatu: 'VU',
  'New Caledonia': 'NC',
  Niger: 'NE',
  'Norfolk Island': 'NF',
  Nigeria: 'NG',
  'New Zealand': 'NZ',
  Nepal: 'NP',
  Nauru: 'NR',
  Niue: 'NU',
  'Cook Islands': 'CK',
  Kosovo: 'XK',
  'Ivory Coast': 'CI',
  Switzerland: 'CH',
  Colombia: 'CO',
  China: 'CN',
  Cameroon: 'CM',
  Chile: 'CL',
  'Cocos Islands': 'CC',
  Canada: 'CA',
  'Republic of the Congo': 'CG',
  'Central African Republic': 'CF',
  'Democratic Republic of the Congo': 'CD',
  'Czech Republic': 'CZ',
  Cyprus: 'CY',
  'Christmas Island': 'CX',
  'Costa Rica': 'CR',
  Curacao: 'CW',
  'Cape Verde': 'CV',
  Cuba: 'CU',
  Swaziland: 'SZ',
  Syria: 'SY',
  'Sint Maarten': 'SX',
  Kyrgyzstan: 'KG',
  Kenya: 'KE',
  'South Sudan': 'SS',
  Suriname: 'SR',
  Kiribati: 'KI',
  Cambodia: 'KH',
  'Saint Kitts and Nevis': 'KN',
  Comoros: 'KM',
  'Sao Tome and Principe': 'ST',
  Slovakia: 'SK',
  'South Korea': 'KR',
  Slovenia: 'SI',
  'North Korea': 'KP',
  Kuwait: 'KW',
  Senegal: 'SN',
  'San Marino': 'SM',
  'Sierra Leone': 'SL',
  Seychelles: 'SC',
  Kazakhstan: 'KZ',
  'Cayman Islands': 'KY',
  Singapore: 'SG',
  Sweden: 'SE',
  Sudan: 'SD',
  'Dominican Republic': 'DO',
  Dominica: 'DM',
  Djibouti: 'DJ',
  Denmark: 'DK',
  'British Virgin Islands': 'VG',
  Germany: 'DE',
  Yemen: 'YE',
  Algeria: 'DZ',
  'United States': 'US',
  Uruguay: 'UY',
  Mayotte: 'YT',
  'United States Minor Outlying Islands': 'UM',
  Lebanon: 'LB',
  'Saint Lucia': 'LC',
  Laos: 'LA',
  Tuvalu: 'TV',
  Taiwan: 'TW',
  'Trinidad and Tobago': 'TT',
  Turkey: 'TR',
  'Sri Lanka': 'LK',
  Liechtenstein: 'LI',
  Latvia: 'LV',
  Tonga: 'TO',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Liberia: 'LR',
  Lesotho: 'LS',
  Thailand: 'TH',
  'French Southern Territories': 'TF',
  Togo: 'TG',
  Chad: 'TD',
  'Turks and Caicos Islands': 'TC',
  Libya: 'LY',
  Vatican: 'VA',
  'Saint Vincent and the Grenadines': 'VC',
  'United Arab Emirates': 'AE',
  Andorra: 'AD',
  'Antigua and Barbuda': 'AG',
  Afghanistan: 'AF',
  Anguilla: 'AI',
  'U.S. Virgin Islands': 'VI',
  Iceland: 'IS',
  Iran: 'IR',
  Armenia: 'AM',
  Albania: 'AL',
  Angola: 'AO',
  Antarctica: 'AQ',
  'American Samoa': 'AS',
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Aruba: 'AW',
  India: 'IN',
  'Aland Islands': 'AX',
  Azerbaijan: 'AZ',
  Ireland: 'IE',
  Indonesia: 'ID',
  Ukraine: 'UA',
  Qatar: 'QA',
  Mozambique: 'MZ'
};

export const RightsStatements = {
  '//creativecommons.org/licenses/by/2.0': 'CC BY 2.0',
  '//creativecommons.org/licenses/by/2.0/uk': 'CC BY 2.0 UK',
  '//creativecommons.org/licenses/by/2.5': 'CC BY 2.5',
  '//creativecommons.org/licenses/by/2.5/pl': 'CC BY 2.5 PL',
  '//creativecommons.org/licenses/by/3.0': 'CC BY 3.0',
  '//creativecommons.org/licenses/by/3.0/pl': 'CC BY 3.0 PL',
  '//creativecommons.org/licenses/by/3.0/de': 'CC BY 3.0 DE',
  '//creativecommons.org/licenses/by/4.0': 'CC BY 4.0',

  '//creativecommons.org/licenses/by-nc/2.0': 'CC BY-NC 2.0',
  '//creativecommons.org/licenses/by-nc/2.0/at': 'CC BY-NC 2.0 AT',
  '//creativecommons.org/licenses/by-nc/2.5/pl': 'CC BY-NC 2.5 PL',
  '//creativecommons.org/licenses/by-nc/2.5/se': 'CC BY-NC 2.5 SE',
  '//creativecommons.org/licenses/by-nc/3.0': 'CC BY-NC 3.0',
  '//creativecommons.org/licenses/by-nc/3.0/de': 'CC BY-NC 3.0 DE',
  '//creativecommons.org/licenses/by-nc/3.0/nl': 'CC BY-NC 3.0 NL',
  '//creativecommons.org/licenses/by-nc/3.0/pl': 'CC BY-NC 3.0 PL',
  '//creativecommons.org/licenses/by-nc/3.0/pt': 'CC BY-NC 3.0 PT',
  '//creativecommons.org/licenses/by-nc/2.5': 'CC BY-NC 2.5',
  '//creativecommons.org/licenses/by-nc/4.0': 'cc by-nc 4.0',

  '//creativecommons.org/licenses/by-nc-nd': 'CC BY-NC-ND',
  '//creativecommons.org/licenses/by-nc-nd/2.0': 'CC BY-NC-ND 2.0',
  '//creativecommons.org/licenses/by-nc-nd/2.0/es': 'CC BY-NC-ND 2.0 ES',
  '//creativecommons.org/licenses/by-nc-nd/2.5': 'CC BY-NC-ND 2.5',
  '//creativecommons.org/licenses/by-nc-nd/2.5/ch': 'CC BY-NC-ND 2.5 CH',
  '//creativecommons.org/licenses/by-nc-nd/2.5/mt': 'CC BY-NC-ND 2.5 MT',
  '//creativecommons.org/licenses/by-nc-nd/2.5/pl': 'CC BY-NC-ND 2.5 PL',
  '//creativecommons.org/licenses/by-nc-nd/2.5/pt': 'CC BY-NC-ND 2.5 PT',
  '//creativecommons.org/licenses/by-nc-nd/3.0': 'CC BY-NC-ND 3.0',
  '//creativecommons.org/licenses/by-nc-nd/3.0/de': 'CC BY-NC-ND 3.0 DE',
  '//creativecommons.org/licenses/by-nc-nd/3.0/es/deed.ca':
    'CC BY-NC-ND 3.0 ES',
  '//creativecommons.org/licenses/by-nc-nd/3.0/gr': 'CC BY-NC-ND 3.0 GR',
  '//creativecommons.org/licenses/by-nc-nd/3.0/nl': 'CC BY-NC-ND 3.0 NL',
  '//creativecommons.org/licenses/by-nc-nd/3.0/pl': 'CC BY-NC-ND 3.0 PL',
  '//creativecommons.org/licenses/by-nc-nd/4.0': 'CC BY-NC-ND 4.0',

  '//creativecommons.org/licenses/by-nc-sa/2.0/fr': 'CC BY-NC-SA 2.0 FR',
  '//creativecommons.org/licenses/by-nc-sa/2.5': 'CC BY-NC-SA 2.5',
  '//creativecommons.org/licenses/by-nc-sa/2.5/fr': 'CC BY-NC-SA 2.5 FR',
  '//creativecommons.org/licenses/by-nc-sa/2.5/pl': 'CC BY-NC-SA 2.5 PL',
  '//creativecommons.org/licenses/by-nc-sa/3.0': 'CC BY-NC-SA 3.0',
  '//creativecommons.org/licenses/by-nc-sa/3.0/de': 'CC BY-NC-SA 3.0 DE',
  '//creativecommons.org/licenses/by-nc-sa/3.0/es': 'CC BY-NC-SA 3.0 ES',
  '//creativecommons.org/licenses/by-nc-sa/3.0/ie': 'CC BY-NC-SA 3.0 IE',
  '//creativecommons.org/licenses/by-nc-sa/3.0/lu': 'CC BY-NC-SA 3.0 LU',
  '//creativecommons.org/licenses/by-nc-sa/3.0/pl': 'CC BY-NC-SA 3.0 PL',
  '//creativecommons.org/licenses/by-nc-sa/4.0': 'CC BY-NC-SA 4.0',
  '//creativecommons.org/licenses/by-nc-sa/4.0/deed.de':
    'CC BY-NC-SA 4.0 (deed.de)',

  '//creativecommons.org/licenses/by-nd/2.0/es': 'CC BY-ND 2.0 ES',
  '//creativecommons.org/licenses/by-nd/2.5/pl': 'CC BY-ND 2.5 PL',
  '//creativecommons.org/licenses/by-nd/2.5': 'CC BY-ND 2.5',
  '//creativecommons.org/licenses/by-nd/3.0': 'CC BY-ND 3.0',
  '//creativecommons.org/licenses/by-nd/3.0/de': 'CC BY-ND 3.0 DE',
  '//creativecommons.org/licenses/by-nd/3.0/pl': 'CC BY-ND 3.0 PL',
  '//creativecommons.org/licenses/by-nd/4.0': 'CC BY-ND 4.0',
  '//creativecommons.org/licenses/by-sa': 'CC BY-SA',
  '//creativecommons.org/licenses/by-sa/2.0': 'CC BY-SA 2.0',
  '//creativecommons.org/licenses/by-sa/2.5': 'CC BY-SA 2.5',
  '//creativecommons.org/licenses/by-sa/2.5/se': 'CC BY-SA 2.5 SE',
  '//creativecommons.org/licenses/by-sa/3.0': 'CC BY-SA 3.0',
  '//creativecommons.org/licenses/by-sa/3.0/us': 'CC BY-SA 3.0 US',
  '//creativecommons.org/licenses/by-sa/3.0/de': 'CC BY-SA 3.0 DE',
  '//creativecommons.org/licenses/by-sa/3.0/nl': 'CC BY-SA 3.0 NL',
  '//creativecommons.org/licenses/by-sa/3.0/pl': 'CC BY-SA 3.0 PL',
  '//creativecommons.org/licenses/by-sa/4.0': 'CC BY-SA 4.0',

  '//www.europeana.eu/rights/unknown': 'Unknown Copyright Status',
  '//www.europeana.eu/rights/orphan-work-eu.html': 'Orphan Work',
  '//www.europeana.eu/rights/out-of-copyright-non-commercial':
    '(Europeana out of Copyright)',
  '//www.europeana.eu/rights/rr-f': 'rights reserved - free access',
  '//www.legislation.gov.uk/ukpga/1988/48/section/57':
    'OGL (1988 / 48 / Section 57)',
  '//www.legislation.gov.uk/ukpga/1988/48/section/75':
    'OGL (1988 / 48 / Section 75)',
  '//rightsstatements.org/page/inc/1.0': 'In Copyright',
  '//creativecommons.org/publicdomain/mark/1.0': 'No Copyright',
  '//creativecommons.org/publicdomain/zero/1.0': 'CC0 1.0 Universal',
  '//rightsstatements.org/vocab/cne/1.0': 'Copyright Not Evaluated',
  '//rightsstatements.org/vocab/inc-edu/1.0': 'Educational Use Permitted',
  '//rightsstatements.org/vocab/inc-ow-eu/1.0': 'In Copyright - EU Orphan Work',
  '//rightsstatements.org/vocab/inc/1.0': 'In Copyright',
  '//rightsstatements.org/vocab/noc-nc/1.0': 'Non-commercial Use Only',
  '//rightsstatements.org/vocab/noc-oklr/1.0': 'Other Known Legal Restrictions',
  '//rightsstatements.org/page/und/1.0': 'Copyright Undetermined'
};

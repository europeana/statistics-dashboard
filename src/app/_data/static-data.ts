import { DimensionName, IHash, NonFacetFilterNames } from '../_models';

export const facetNames: Array<DimensionName> = [
  DimensionName.contentTier,
  DimensionName.metadataTier,
  DimensionName.country,
  DimensionName.dataProvider,
  DimensionName.provider,
  DimensionName.rightsCategory,
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
facetNamesPortal[DimensionName.rightsCategory] = 'RIGHTS';
facetNamesPortal[DimensionName.type] = 'TYPE';

export const portalNames = facetNamesPortal;

const facetNamesFriendly: IHash<string> = {};
facetNamesFriendly[
  DimensionName.contentTier
] = $localize`:@@facetNameContentTier:Content Tier`;
facetNamesFriendly[
  DimensionName.metadataTier
] = $localize`:@@facetNameMetadataTier:Metadata Tier`;
facetNamesFriendly[
  DimensionName.country
] = $localize`:@@facetNameCountry:Country`;
facetNamesFriendly[
  DimensionName.type
] = $localize`:@@facetNameMediaType:Media Type`;
facetNamesFriendly[
  DimensionName.rightsCategory
] = $localize`:@@facetNameRights:Rights Category`;
facetNamesFriendly[
  DimensionName.dataProvider
] = $localize`:@@facetNameDataProvider:Data Provider`;
facetNamesFriendly[
  DimensionName.provider
] = $localize`:@@facetNameProvider:Provider`;
facetNamesFriendly['dates'] = $localize`:@@facetNameDates:Last Updated`;

export const portalNamesFriendly = facetNamesFriendly;

export const colours = [
  '#0a72cc',
  '#e11d53',
  '#ffae00',
  '#219d31',
  '#0a72cc',
  '#e11d53',
  '#ffae00',
  '#219d31',
  '#0a72cc',
  '#e11d53',
  '#ffae00',
  '#219d31'
];

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
  help: {
    contentTier: {
      href: 'https://europeana.atlassian.net/wiki/spaces/EF/pages/2060386340/Requirements+for+digital+objects+Tier+1',
      description: $localize`:@@tooltipHelpContentTier:EDM Documentation`
    },
    metadataTier: {
      href: 'https://europeana.atlassian.net/wiki/spaces/EF/pages/1969979393/Recommendations+for+metadata+Tier+A-C',
      description: $localize`:@@tooltipHelpMetadataTier:Tier Documentation`
    },
    provider: {
      href: 'https://pro.europeana.eu/page/aggregators',
      description: $localize`:@@tooltipHelpProvider:Provider Documentation`
    },
    rights: {
      href: 'https://pro.europeana.eu/page/available-rights-statements',
      description: $localize`:@@tooltipHelpRights:Rights Documentation`
    }
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
  'North Macedonia': 'MK',
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
  'United States of America': 'USA',
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

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

export const memberStateCountryCodes = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE'
];

export const isoCountryCodes = {
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Belgium: 'BE',
  Bulgaria: 'BG',
  'Bosnia and Herzegovina': 'BA',
  Belarus: 'BY',
  Russia: 'RU',
  Serbia: 'RS',
  Romania: 'RO',
  Greece: 'GR',
  Georgia: 'GE',
  'United Kingdom': 'GB',
  Croatia: 'HR',
  Hungary: 'HU',
  Portugal: 'PT',
  Poland: 'PL',
  Estonia: 'EE',
  Italy: 'IT',
  Spain: 'ES',
  Montenegro: 'ME',
  Moldova: 'MD',
  Monaco: 'MC',
  'North Macedonia': 'MK',
  Malta: 'MT',
  France: 'FR',
  Finland: 'FI',
  'Faroe Islands': 'FO',
  Netherlands: 'NL',
  Norway: 'NO',
  Kosovo: 'XK',
  Switzerland: 'CH',
  Czechia: 'CZ',
  Cyprus: 'CY',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Sweden: 'SE',
  Denmark: 'DK',
  Germany: 'DE',
  'United States of America': 'US',
  Turkey: 'TR',
  Liechtenstein: 'LI',
  Latvia: 'LV',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  'Holy See (Vatican City State)': 'VA',
  Andorra: 'AD',
  Iceland: 'IS',
  Israel: 'IL',
  Albania: 'AL',
  Ireland: 'IE',
  Ukraine: 'UA',
  Europe: 'EU'
};

export const isoCountryCodesReversed = Object.entries(isoCountryCodes).reduce(
  (obj, item) => (obj[item[1]] = item[0]) && obj,
  {}
);

export const eliData = {
  eliDocNum: '32021H1970',
  eliUrl: 'http://data.europa.eu/eli/reco/2021/1970/oj',
  eliTitle:
    'Commission Recommendation (EU) 2021/1970 of 10 November 2021 on a common European data space for cultural heritage'
};

import { externalLinks } from '../app/_data/static-data';
import { matomoSettings } from './matomo-settings';

/**
 * callbackMatomo
 *
 * handle cookie permission
 *
 * @param { boolean: consent }
 **/
const callbackMatomo = (consent: boolean): void => {
  const _paq = matomoSettings.getPAQ();
  if (_paq) {
    if (consent == true) {
      _paq.push(['rememberCookieConsentGiven']);
    } else {
      _paq.push(['forgetCookieConsentGiven']);
    }
  }
};

export const cookieConsentConfig = {
  services: [
    {
      name: 'matomo',
      label: 'matomo tracker',
      description: $localize`:@@cmServiceDescriptionMatomo:Collects anonymous statistics on how visitors interact with the website.`,
      purposes: ['usage tracking'],
      callback: callbackMatomo,
      cookies: [/_pk_id\./, /_pk_ses\./]
    },
    {
      name: 'Consent',
      label: 'Consent',
      description: $localize`:@@cmServiceDescriptionConsent:Remembers what consent you have given for the use of services on this web application.`,
      required: true
    }
  ],
  translations: {
    alwaysRequired: $localize`:@@cmAlwaysRequired:always required`,
    title: $localize`:@@cmTitle:Services we would like to use`,
    description: $localize`:@@cmDescription:Here you can see and customise the services that we'd like to use on this website. To learn more please read our`,
    privacyPolicy: $localize`:@@cmPrivacyPolicy:privacy policy`,
    serviceSingle: $localize`:@@cmServiceSingle:one service`,
    servicePlural: $localize`:@@cmServicePlural:services`,
    services: {} as {
      [key: string]: { [key: string]: Array<string> | string | undefined };
    },
    optional: {
      title: $localize`:@@cmOptionalTitle:Services to capture website usage and feedback`,
      description: $localize`:@@cmOptionalDescription:These services collect the information to help us better understand how the website gets used`
    },
    required: {
      title: $localize`:@@cmRequiredTitle:Essential services for security and customization`,
      description: $localize`:@@cmRequiredDescription:These services are essential for the correct functioning of this website.`
    },
    userDecline: $localize`:@@cmUserDecline:I decline`,
    userAcceptSelected: $localize`:@@cmUserAcceptSelected:Accept Selected`,
    userAcceptAll: $localize`:@@cmUserAcceptAll:Accept All`,
    miniMode: {
      text:
        // eslint-disable-next-line max-len
        $localize`:@@cmMiniModeText:Hi! We’d like your permission to collect anonymous usage statistics that will help us improve our applications. You can always change or withdraw your consent later.`,
      userChoose: $localize`:@@cmMiniModeUserChoose:Let me choose`,
      userAcceptAll: $localize`:@@cmMiniModeUserAcceptAll:Okay`,
      userDecline: $localize`:@@cmMiniModeUserDecline:I decline`
    }
  }
};

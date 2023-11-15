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
      _paq.push(['setCookieConsentGiven']);
    } else {
      _paq.push(['forgetCookieConsentGiven']);
    }
  }
};

export const cookieConsentConfig = {
  privacyPolicyUrl: externalLinks.privacy,
  services: [
    {
      name: 'matomo',
      label: 'matomo tracker',
      description: 'Collects anonymous statistics on how visitors interact with the website.',
      purposes: ['usage tracking'],
      callback: callbackMatomo,
      cookies: [/_pk_id\./, /_pk_ses\./]
    }
  ],
  translations: {
    alwaysRequired: 'sempre necessario',
    title: 'Servizi che vogliamo usare',
    description:
      'Qui puoi vedere e aggiustare i servizi che vorremo usare su questo sito. Per impararne di piu legge nostro ',
    privacyPolicy: 'privacy policy',
    serviceSingle: 'uno servizio',
    servicePlural: 'servizi',
    services: {} as { [key: string]: { [key: string]: Array<string> | string | undefined } },
    optional: {
      title: 'Servizi per ricordare come il sito si usa',
      description: 'Questi servizi raccolgono informazioni per aiutarci capire come il sito si usa.'
    },
    required: {
      title: "Servizi essenziali per la funzionalita' di questo sito",
      title2: '(always required)',
      description:
        'Questi servizi sono essenziali per questo sito a funzionare giustamenteessenziali'
    },
    userDecline: 'Io declino',
    userAcceptSelected: 'Accetto Selezionati',
    userAcceptAll: 'Accetto tutto',
    miniMode: {
      text:
        "Potremmo attivare aluni servizi per analytici e sicurrezza? Si puo' sempre cambiare o negare il tuo consento dopo.",
      userChoose: 'Fammi scegliere',
      userAcceptAll: 'Va bene',
      userDecline: 'Io declino'
    }
  }
};

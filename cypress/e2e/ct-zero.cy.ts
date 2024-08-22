import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
  describe('content-tier zero', () => {
    const force = { force: true };
    const ctZeroParam = 'content-tier-zero=true';
    const ctZeroFilterParam = DimensionName.contentTier;
    const selCtrlCTZero = '[for=ctZero]';
    const selFilterLabel = '.checkbox-labelled.contentTier .checkbox-label';
    const selCountryMenu = '.country-select';

    const confirmCTZeroSetting = (enabled: boolean): void => {
      cy.get(selCtrlCTZero)
        .contains('Disable content tier 0')
        .should('have.length', enabled ? 1 : 0);
      cy.get(selCtrlCTZero)
        .contains('Enable content tier 0')
        .should('have.length', enabled ? 0 : 1);
    };

    describe('country pages', () => {
      const urlDefault = `/country/Europe`;
      const urlCTZero = `${urlDefault}?${ctZeroParam}`;

      const checkCTZeroParamAbsent = (linkText: string) => {
        cy.contains('a', linkText)
          .should('exist')
          .invoke('attr', 'href')
          .should('not.contain', ctZeroParam);
      };

      const checkCTZeroParamPresent = (linkText: string) => {
        cy.contains('a', linkText)
          .should('exist')
          .invoke('attr', 'href')
          .should('contain', ctZeroParam);
      };

      describe('country menu', () => {
        it('should parameterise the menu links', () => {
          const countries = [
            'Austria',
            'Belgium',
            'Bulgaria',
            'Croatia',
            'Denmark'
          ];
          cy.visit(urlDefault);
          cy.wait(100);

          countries.forEach((country: string) => {
            checkCTZeroParamAbsent(country);
          });

          cy.visit(urlCTZero);
          cy.wait(100);

          countries.forEach((country: string) => {
            checkCTZeroParamPresent(country);
          });
        });
      });

      describe('country page', () => {
        const linkTexts = [
          'View by type',
          'View by rights category',
          'View by data provider',
          'View by provider'
        ];

        const targetLinkTexts = [
          'View (3D data) by content tier',
          'View (HQ data) by type'
        ];

        it('should (conditionally) show the control zero control', () => {
          cy.visit(urlDefault);
          cy.wait(100);

          cy.get(selCtrlCTZero).filter(':visible').should('exist');

          cy.visit('/country/Austria');
          cy.wait(100);

          cy.get(selCtrlCTZero).filter(':visible').should('not.exist');

          cy.scrollTo('bottom');

          cy.get(selCtrlCTZero).filter(':visible').should('exist');
        });

        it('should update the content when the zero control control is toggled', () => {
          cy.visit(urlDefault);
          cy.wait(100);

          const valDefault = '10%';
          const valCTZero = '21.6%';
          const sel = '.entry-card .total.triple';

          cy.get(sel).contains(valDefault).should('exist');
          cy.get(sel).contains(valCTZero).should('not.exist');

          cy.get(selCtrlCTZero).click(force);

          cy.get(sel).contains(valCTZero).should('exist');
          cy.get(sel).contains(valDefault).should('not.exist');

          cy.get(selCtrlCTZero).click(force);

          cy.get(sel).contains(valDefault).should('exist');
          cy.get(sel).contains(valCTZero).should('not.exist');
        });

        it('should parameterise the links', () => {
          cy.visit(urlDefault);
          cy.wait(100);

          linkTexts.forEach((linkText: string) => {
            checkCTZeroParamAbsent(linkText);
          });

          cy.visit(urlCTZero);
          cy.wait(100);

          linkTexts.forEach((linkText: string) => {
            checkCTZeroParamPresent(linkText);
          });
        });

        it('Should maintain the content tier zero control setting', () => {
          const country = 'Belgium';
          const url = `/country/${country}`;

          cy.visit(url);
          cy.wait(1000);
          cy.get(selCtrlCTZero).click(force);
          cy.wait(1000);
          cy.contains(targetLinkTexts[1]).click(force);

          cy.wait(1000);
          confirmCTZeroSetting(false);
          cy.go('back');
          cy.wait(1000);
          confirmCTZeroSetting(true);

          cy.contains(linkTexts[0]).click(force);
          confirmCTZeroSetting(true);
          cy.go('back');
          confirmCTZeroSetting(true);
        });

        it('Should (conditionally) reset the content tier zero control', () => {
          const country = 'Belgium';
          const url = `/country/${country}`;
          const valPercent = '44.1%';
          const valPercentCTZero = '11.6%';
          const selPercent = '.total.percent-value';

          // go to Belgium
          cy.visit(url);
          cy.wait(1000);
          cy.get(selPercent).contains(valPercent).should('exist');
          cy.get(selPercent).contains(valPercentCTZero).should('not.exist');
          confirmCTZeroSetting(false);

          // activate content tier zero
          cy.get(selCtrlCTZero).click(force);
          cy.wait(1000);
          cy.get(selPercent).contains(valPercent).should('not.exist');
          cy.get(selPercent).contains(valPercentCTZero).should('exist');
          confirmCTZeroSetting(true);

          // click through to the "Type data"
          cy.contains(linkTexts[0]).click(force);
          cy.wait(1000);
          confirmCTZeroSetting(true);

          // go back to Belgium
          cy.go('back');
          cy.wait(1000);
          cy.get(selPercent).contains(valPercent).should('not.exist');
          cy.get(selPercent).contains(valPercentCTZero).should('exist');
          confirmCTZeroSetting(true);

          // click a target link
          cy.contains(targetLinkTexts[0]).click(force);
          cy.wait(1000);
          checkCTZeroParamAbsent(country);
          confirmCTZeroSetting(false);

          // go back to Belgium
          cy.go('back');
          cy.wait(1000);
          cy.get(selPercent).contains(valPercent).should('not.exist');
          cy.get(selPercent).contains(valPercentCTZero).should('exist');

          // click another target link
          cy.contains(targetLinkTexts[1]).click(force);
          cy.wait(1000);

          // return to Belgium (via the menu)
          cy.contains('a', country).click(force);
          cy.wait(1000);

          cy.get(selPercent).contains(valPercent).should('exist');
          cy.get(selPercent).contains(valPercentCTZero).should('not.exist');

          // return to the data page and then back to Belgium
          cy.go(-2);
          cy.wait(1000);
          cy.get(selPercent).contains(valPercent).should('not.exist');
          cy.get(selPercent).contains(valPercentCTZero).should('exist');
        });
      });
    });

    describe('filtering', () => {
      const selFilterOpener = '.opener-name';
      const urlDefault = `/data/${DimensionName.country}`;
      const urlCTZero = `${urlDefault}?${ctZeroParam}`;
      const selTotalRecords = '[data-e2e="total-records"]';

      it('should enable and disable the control according to the url', () => {
        cy.visit(urlDefault);
        confirmCTZeroSetting(false);
        cy.visit(urlCTZero);
        confirmCTZeroSetting(true);
      });

      it('should enable and disable the menu item', () => {
        cy.visit(urlDefault);

        cy.get(selFilterLabel).should('have.length', 0);
        cy.get(selFilterOpener)
          .contains('Content Tier')
          .should('have.length', 1);

        cy.get(selFilterOpener).contains('Content Tier').click(force);
        cy.get(selFilterLabel).contains('Tier 0').should('have.length', 0);

        cy.get(selCtrlCTZero).click(force);

        cy.get(selFilterOpener).contains('Content Tier').click(force);
        cy.get(selFilterLabel).contains('Tier 0').should('have.length', 1);
      });

      it('should load CT Zero records', () => {
        cy.visit(urlCTZero);

        cy.get(selTotalRecords).contains('1,000').should('have.length', 1);
        cy.get(selTotalRecords).contains('819').should('have.length', 0);

        cy.get(selCtrlCTZero).click(force);

        cy.get(selTotalRecords).contains('1,000').should('have.length', 0);
        cy.get(selTotalRecords).contains('819').should('have.length', 1);
      });
    });
  });
});

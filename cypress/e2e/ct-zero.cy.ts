import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
  describe('content-tier zero', () => {
    const ctZeroParam = 'content-tier-zero=true';
    const ctZeroFilterParam = DimensionName.contentTier;
    const selCtrlCTZero = '[for=ctZero]';
    const selFilterLabel = '.checkbox-labelled.contentTier .checkbox-label';

    describe('country pages', () => {
      const urlDefault = `/country/Europe`;
      const urlCTZero = `${urlDefault}?${ctZeroParam}`;

      const checkCTZeroParamAbsent = (linkText: string, linkSelector = '') => {
        cy.contains(`a${linkSelector}`, linkText)
          .should('exist')
          .invoke('attr', 'href')
          .should('not.contain', ctZeroParam);
      };

      const checkCTZeroParamPresent = (linkText: string, linkSelector = '') => {
        cy.contains(`a${linkSelector}`, linkText)
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
        it('should (conditionally) show the control zero control', () => {
          cy.visit(urlDefault);

          cy.get(selCtrlCTZero).filter(':visible').should('exist');

          cy.visit('/country/Austria');

          cy.get(selCtrlCTZero).filter(':visible').should('not.exist');

          cy.scrollTo('bottom');

          cy.get(selCtrlCTZero).filter(':visible').should('exist');
        });

        it('should update the content when the zero control control is toggled', () => {
          cy.visit(urlDefault);

          const valDefault = '10%';
          const valCTZero = '21.6%';
          const sel = '.entry-card .total.triple';

          cy.get(sel).contains(valDefault).should('exist');
          cy.get(sel).contains(valCTZero).should('not.exist');

          cy.get(selCtrlCTZero).click();

          cy.get(sel).contains(valCTZero).should('exist');
          cy.get(sel).contains(valDefault).should('not.exist');

          cy.get(selCtrlCTZero).click();

          cy.get(sel).contains(valDefault).should('exist');
          cy.get(sel).contains(valCTZero).should('not.exist');
        });

        it('should parameterise the links', () => {
          cy.visit(urlDefault);
          cy.wait(100);

          const linkTexts = [
            'View by type',
            'View by rights category',
            'View by data provider',
            'View by provider'
          ];

          linkTexts.forEach((linkText: string) => {
            checkCTZeroParamAbsent(linkText);
          });

          cy.visit(urlCTZero);
          cy.wait(100);

          linkTexts.forEach((linkText: string) => {
            checkCTZeroParamPresent(linkText);
          });
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

        cy.get(selCtrlCTZero)
          .contains('Disable content tier 0')
          .should('have.length', 0);
        cy.get(selCtrlCTZero)
          .contains('Enable content tier 0')
          .should('have.length', 1);

        cy.visit(urlCTZero);

        cy.get(selCtrlCTZero)
          .contains('Disable content tier 0')
          .should('have.length', 1);
        cy.get(selCtrlCTZero)
          .contains('Enable content tier 0')
          .should('have.length', 0);
      });

      it('should enable and disable the menu item', () => {
        cy.visit(urlDefault);

        cy.get(selFilterLabel).should('have.length', 0);
        cy.get(selFilterOpener)
          .contains('Content Tier')
          .should('have.length', 1);

        cy.get(selFilterOpener).contains('Content Tier').click({ force: true });
        cy.get(selFilterLabel).contains('Tier 0').should('have.length', 0);

        cy.get(selCtrlCTZero).click({ force: true });

        cy.get(selFilterOpener).contains('Content Tier').click({ force: true });
        cy.get(selFilterLabel).contains('Tier 0').should('have.length', 1);
      });

      it('should load CT Zero records', () => {
        cy.visit(urlCTZero);

        cy.get(selTotalRecords).contains('1,000').should('have.length', 1);
        cy.get(selTotalRecords).contains('819').should('have.length', 0);

        cy.get(selCtrlCTZero).click({ force: true });

        cy.get(selTotalRecords).contains('1,000').should('have.length', 0);
        cy.get(selTotalRecords).contains('819').should('have.length', 1);
      });
    });
  });
});

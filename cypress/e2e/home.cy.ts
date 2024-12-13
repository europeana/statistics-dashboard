context('Statistics Dashboard', () => {
  describe('home', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    const delayMapUpdate = 750;
    const force = { force: true };

    const selCountrySelect = '.link-select-country';

    const selHeader = '.header';
    const selHeaderTitle = `${selHeader} + .page-title-wrapper`;
    const selLinkHeader = '[data-e2e=link-home-header]';
    const selLinkDataContentTier = '[data-e2e=link-entry-ct]';
    const selLinkDataMetadata = '[data-e2e=link-entry-metadata]';
    const selLinkDataCountry = '[data-e2e=link-entry-country]';
    const selLinkDataType = '[data-e2e=link-entry-type]';
    const selLinkDataRights = '[data-e2e=link-entry-rights]';
    const selLinkDataDataProvider = '[data-e2e=link-entry-provider]';
    const selLinkDataProvider = '[data-e2e=link-entry-data-provider]';
    const selLinkInfo = '.entry-card-header a.info-icon';
    const selMap = '#mapChart';
    const selMapLegend = '#mapLegend';

    it('should allow countries to be selected and deselected', () => {
      const selCloseMapSelection = '[data-e2e=close-map-selection]';

      cy.get(selCountrySelect).should('exist');
      cy.get(selCountrySelect)
        .contains('Belgium')
        .filter(':visible')
        .should('exist');
      cy.get(selCloseMapSelection).should('not.exist');

      cy.wait(delayMapUpdate);
      cy.get(selCountrySelect).contains('Belgium').click(force);

      cy.get(selCountrySelect).filter(':visible').should('not.exist');
      cy.get(selCloseMapSelection).should('exist');
    });

    it('should allow countries to be browsed', () => {
      const selCountryNav = '.map-navigation-link';

      cy.wait(delayMapUpdate);

      cy.get(selCountryNav).should('not.exist');
      cy.get(selCountrySelect).contains('Belgium').click(force);

      cy.wait(delayMapUpdate);

      cy.get(selCountryNav).should('exist');
      cy.get(selCountryNav).contains('Norway').should('exist');
      cy.get(selCountryNav).contains('Bulgaria').should('exist');
      cy.get(selCountryNav).contains('Croatia').should('not.exist');

      cy.get(selCountryNav).contains('Bulgaria').click(force);
      cy.wait(delayMapUpdate);

      cy.get(selCountryNav).contains('Norway').should('not.exist');
      cy.get(selCountryNav).contains('Croatia').should('exist');
    });

    it('should show the header with home link and title', () => {
      cy.get(selHeader).should('have.length', 1);
      cy.get(selHeaderTitle).should('have.length', 1);
      cy.get(selLinkHeader).should('have.length', 1);
    });

    it('should show information links', () => {
      cy.get(selLinkInfo).should('have.length', 4);
    });

    it('should show a map', () => {
      cy.get(selMap).should('have.length', 1);
      cy.get(selMapLegend).should('have.length', 1);
    });

    it('should show the data entry point links', () => {
      cy.get(selLinkDataContentTier).should('have.length', 1);
      cy.get(selLinkDataMetadata).should('have.length', 1);
      cy.get(selLinkDataCountry).should('have.length', 1);
      cy.get(selLinkDataType).should('have.length', 1);
      cy.get(selLinkDataRights).should('have.length', 1);
      cy.get(selLinkDataDataProvider).should('have.length', 1);
      cy.get(selLinkDataProvider).should('have.length', 1);
    });
  });
});

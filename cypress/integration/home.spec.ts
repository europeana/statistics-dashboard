context('statistics-dashboard', () => {
  describe('home', () => {

    beforeEach(() => {
      cy.visit('/')
    });

    const selHeader = '.header';
    const selHeaderTitle = `${selHeader} + .page-title`;
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

    it('should show the header with home link and title', () => {
      console.log('selHeaderTitle ' + selHeaderTitle)
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

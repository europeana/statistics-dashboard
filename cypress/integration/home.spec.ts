context('statistics-dashboard', () => {
  describe('home', () => {

    beforeEach(() => {
      cy.visit('/')
    });

    const selLinkHeader = '[data-e2e=link-home-header]';
    const selLinkContentTier = '[data-e2e=link-entry-ct]';
    const selLinkMetadata = '[data-e2e=link-entry-metadata]';
    const selLinkCountry = '[data-e2e=link-entry-country]';
    const selLinkType = '[data-e2e=link-entry-type]';
    const selLinkRights = '[data-e2e=link-entry-rights]';
    const selLinkDataProvider = '[data-e2e=link-entry-provider]';
    const selLinkProvider = '[data-e2e=link-entry-data-provider]';

    it('should show the header and home link', () => {
      cy.get('.header').should('have.length', 1);
      cy.get(selLinkHeader).should('have.length', 1);
    });

    it('should show the entry point links', () => {
      cy.get(selLinkContentTier).should('have.length', 1);
      cy.get(selLinkMetadata).should('have.length', 1);
      cy.get(selLinkCountry).should('have.length', 1);
      cy.get(selLinkType).should('have.length', 1);
      cy.get(selLinkRights).should('have.length', 1);
      cy.get(selLinkDataProvider).should('have.length', 1);
      cy.get(selLinkProvider).should('have.length', 1);
    });

  });
});

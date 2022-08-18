import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {

  const ctZeroParam = 'content-tier-zero=true';
  const ctZeroFilterParam = DimensionName.contentTier;
  const selCtrlCTZero = '[for=ctZero]';
  const selFilterLabel = '.checkbox-labelled.contentTier .checkbox-label';

  const selFilterOpener = '.opener-name';
  const urlDefault = `/data/${DimensionName.country}`;
  const urlCTZero = `${urlDefault}?content-tier-zero=true`;

  const selTotalRecords = '[data-e2e="total-records"]';

  describe('content-tier zero', () => {

    it('should enable and disable the control according to the url', () => {
      cy.visit(urlDefault);

      cy.get(selCtrlCTZero).contains('Disable content tier 0').should('have.length', 0);
      cy.get(selCtrlCTZero).contains('Enable content tier 0').should('have.length', 1);

      cy.visit(urlCTZero);

      cy.get(selCtrlCTZero).contains('Disable content tier 0').should('have.length', 1);
      cy.get(selCtrlCTZero).contains('Enable content tier 0').should('have.length', 0);
    });

    it('should enable and disable the menu item', () => {
      cy.visit(urlDefault);

      cy.get(selFilterLabel).should('have.length', 0);
      cy.get(selFilterOpener).contains('Content Tier').should('have.length', 1);

      cy.get(selFilterOpener).contains('Content Tier').click({force: true});
      cy.get(selFilterLabel).contains('Tier 0').should('have.length', 0);

      cy.get(selCtrlCTZero).click({force: true});

      cy.get(selFilterOpener).contains('Content Tier').click({force: true});
      cy.get(selFilterLabel).contains('Tier 0').should('have.length', 1);
    });

    it('should load CT Zero records', () => {
      cy.visit(urlCTZero);

      cy.get(selTotalRecords).contains('1,000').should('have.length', 1);
      cy.get(selTotalRecords).contains('819').should('have.length', 0);

      cy.get(selCtrlCTZero).click({force: true});

      cy.get(selTotalRecords).contains('1,000').should('have.length', 0);
      cy.get(selTotalRecords).contains('819').should('have.length', 1);
    });
  });
});

context('statistics-dashboard', () => {

  const tmpLoad = '[data-e2e=tmpLoadServerData]';

  const ctZeroParam = 'content-tier-zero=true';
  const ctZeroFilterParam = 'contentTier';
  const selCtrlCTZero = '[for=ctZero]';
  const selFilterLabel = '.filter-label';
  const selFilterOpener = '.opener-name';
  const urlDefault = '/data/COUNTRY';
  const urlCTZero = `${urlDefault}?content-tier-zero=true`;

  const selTotalRecords = '[data-e2e="total-records"]';

  describe('content-tier zero', () => {

    // Temporary: this data will already be loaded when we move to the data server
    tmpB4 = () => {
      cy.get(tmpLoad).click({force: true});
    };

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
      //tmpB4();

      cy.get(selFilterLabel).should('have.length', 0);
      cy.get(selFilterOpener).contains('Content Tier').should('have.length', 1);

      cy.get(selFilterOpener).contains('Content Tier').click();
      cy.get(selFilterLabel).contains('Tier 0').should('have.length', 0);

      cy.get(selCtrlCTZero).click();

      cy.get(selFilterOpener).contains('Content Tier').click();
      cy.get(selFilterLabel).contains('Tier 0').should('have.length', 1);
    });

    it('should load CT Zero records', () => {
      cy.visit(urlCTZero);

      cy.get(selTotalRecords).contains('1,000').should('have.length', 1);
      cy.get(selTotalRecords).contains('819').should('have.length', 0);

      cy.get(selCtrlCTZero).click();

      cy.get(selTotalRecords).contains('1,000').should('have.length', 0);
      cy.get(selTotalRecords).contains('819').should('have.length', 1);
    });
  });
});

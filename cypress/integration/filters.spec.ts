context('statistics-dashboard', () => {
  describe('filters', () => {

    const selDateFrom = '[data-e2e="dateFrom"]';
    const selDateTo = '[data-e2e="dateTo"]';
    const selDateSummary = '[data-e2e="date-summary"]';
    const selFilter = '.filter';
    const selFilterOpener = '.filter-opener';
    const selFilterOpenerName = `${selFilterOpener} .opener-name`;
    const selFilterOpened = `${selFilter} .checkboxes-list`;
    const selFilterRemove = `[data-e2e="rm-filter"]`;
    const selCheckbox = `${selFilter} [data-e2e="cb-filter"]`;
    const selSearch = `.checkbox-filter-input`;
    const selFilterValueLabel = `.filter-label`;

    it('should not include filters for the current dimension', () => {
      cy.visit('/data/COUNTRY');
      cy.get(selFilterOpenerName).contains('Country').should('have.length', 0);
      cy.get(selFilterOpenerName).contains('Content Tier').should('have.length', 1);

      cy.visit('/data/contentTier');
      cy.get(selFilterOpenerName).contains('Country').should('have.length', 1);
      cy.get(selFilterOpenerName).contains('Content Tier').should('have.length', 0);
    });

    it('should show the filters (closed)', () => {
      cy.visit('/data/COUNTRY');
      cy.get(selFilter).should('have.length', 7);
      cy.get(selFilterOpener).should('have.length', 7);
      cy.get(selFilterOpened).should('have.length', 0);
    });

    it('should open and close the filters', () => {
      cy.visit(`/data/COUNTRY`);
      cy.get(selFilterOpener).first().click({force: true});
      cy.get(selFilterOpened).should('have.length', 1);
      cy.get(selFilterOpener).last().click({force: true});
      cy.get(selFilterOpened).should('have.length', 0);
    });

    it('should apply the filters', () => {
      cy.visit(`/data/COUNTRY`);
      cy.get(selFilterOpener).first().click({force: true});
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selCheckbox).first().click({force: true});
      cy.get(selFilterRemove).should('have.length', 1);
    });

    it('should search the filters', () => {
      cy.visit(`/data/contentTier`);
      cy.get(selFilterValueLabel).should('have.length', 0);
      cy.get(selFilterOpener).first().click({force: true});
      cy.get(selFilterValueLabel).should('have.length.gt', 0);

      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 1);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);
      cy.get(selSearch).should('have.length', 1);

      cy.get(selSearch).type('Ge', 1);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);
    });

    it('should allow date range definitions', () => {
      cy.visit(`/data/contentTier`);
      cy.get(selDateFrom).should('have.length', 0);
      cy.get(selDateTo).should('have.length', 0);
      cy.get(selFilterOpener).last().click({force: true});
      cy.get(selDateFrom).should('have.length', 1);
      cy.get(selDateSummary).should('have.length', 0);

      const today = new Date().toISOString().split('T')[0];
      cy.get(selDateFrom).type(today);
      cy.get(selDateTo).type(today);

      cy.get(selDateSummary).should('have.length', 1);
      cy.get(selDateFrom).clear();
      cy.get(selDateSummary).should('have.length', 0);
    });

  });
});

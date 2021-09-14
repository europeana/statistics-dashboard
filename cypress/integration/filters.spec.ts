context('statistics-dashboard', () => {
  describe('filters', () => {

    const selDateFrom = '[data-e2e="dateFrom"]';
    const selDateTo = '[data-e2e="dateTo"]';
    const selCloseDateOverride = '[data-e2e="close-date-override"]';
    const selFiltersHeader = '.filters-header';
    const selFilter = `${selFiltersHeader} + .filters .filter`;
    const selFilterOpener = '.filter-opener';
    const selFilterOpenerName = `${selFilterOpener} .opener-name`;
    const selFilterOpened = `${selFilter} .checkboxes-list`;
    const selFilterRemove = `.rm-filter`;
    const selFilterRemoveNav = `.rm-filter-nav`;

    const selCheckbox = `${selFilter} .checkbox`;
    const selSearch = `.checkbox-filter-input`;
    const selFilterValueLabel = `${selFilter} .filter-label`;

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

    it('should scroll the filter remove options', () => {
      cy.visit(`/data/COUNTRY`);
      cy.get(selFilterOpener).eq(2).click({force: true});
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selFilterRemoveNav).should('have.length', 0);

      for(let i=0; i<4; i++){
        cy.get(selCheckbox).eq(i).click({force: true});
      }
      cy.get(selFilterRemove).should('have.length', 4);
      cy.get(selFilterRemoveNav).should('have.length', 1);
    });

    it('should search the filters and remember the term when re-opened', () => {
      cy.visit(`/data/contentTier`);
      cy.get(selFilterValueLabel).should('have.length', 0);
      cy.get(selFilterOpener).eq(1).click({force: true});
      cy.get(selFilterValueLabel).should('have.length.gt', 0);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 1);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);
      cy.get(selSearch).should('have.length', 1);

      cy.get(selSearch).type('Ge', 1);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);

      cy.get(selFiltersHeader).click({force: true});
      cy.get(selFilterOpener).eq(1).click({force: true});
      cy.get(selSearch).should('have.value', 'Ge');
    });

/*
    it('should allow date range definitions', () => {
      cy.visit(`/data/contentTier`);
      cy.get(selDateFrom).should('have.length', 0);
      cy.get(selDateTo).should('have.length', 0);
      cy.get(selFilterOpener).last().click({force: true});
      cy.get(selDateFrom).should('have.length', 1);

      const today = new Date().toISOString().split('T')[0];
      cy.get(selDateFrom).type(today);
      cy.get(selDateTo).type(today);

      cy.get(selCloseDateOverride).should('be.visible');
      cy.get(selDateFrom).clear();
      cy.get(selCloseDateOverride).should('not.be.visible');
    });
*/
  });
});

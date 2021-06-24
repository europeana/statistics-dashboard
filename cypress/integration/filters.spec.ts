context('statistics-dashboard', () => {
  describe('filters', () => {

    const selFilter = '.filter';
    const selFilterOpener = '.filter-opener';
    const selFilterOpened = `${selFilter} .checkboxes`;

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
      cy.get(selFilterOpened).should('have.length', 1);
      cy.get(selFilterOpener).last().click({force: true});
      cy.get(selFilterOpened).should('have.length', 0);
    });

  });
});

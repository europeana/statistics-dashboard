context('statistics-dashboard', () => {
  describe('filters', () => {
    const selFilter = '.filter';
    const selFilterOpen = `${selFilter} .checkboxes`;

    it('should show the filters (closed)', () => {
      cy.visit('/data/COUNTRY');
      cy.get(selFilter).should('have.length', 7);
      cy.get(selFilterOpen).should('have.length', 0);
    });

    it('should open from url (one open)', () => {
      cy.visit(`/data/COUNTRY?TYPE=SOUND`);
      cy.get(selFilterOpen).should('have.length', 1);
    });

    it('should open from url (two open)', () => {
      cy.visit(`/data/COUNTRY?TYPE=SOUND&metadataTier=A`);
      cy.get(selFilterOpen).should('have.length', 2);
    });

  });
});

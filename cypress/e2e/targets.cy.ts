context('Statistics Dashboard', () => {
  describe('targets', () => {
    beforeEach(() => {
      cy.visit('/targets');
    });

    const selIsOpen = '.is-open';
    const selLegendGrid = '.legend-grid';
    const selPinnedOpener = '.stick-left';
    const selOpenerCountry = '.legend-item-country-opener';
    const selOpenerSeries = '.legend-item-series-opener';

    it('should show the legend', () => {
      cy.get('#lineChart').should('have.length', 1);
      cy.get(selLegendGrid).should('have.length', 1);
    });

    it('should pin a country when opened', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selOpenerCountry)
        .contains('Cyprus')
        .should('have.length', 1)
        .click();
      cy.get(selPinnedOpener).should('have.length', 2);
    });

    it('should unpin a country when closed', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 3);

      cy.get(selOpenerCountry)
        .contains('Cyprus')
        .should('have.length', 1)
        .click();
      cy.get(selPinnedOpener).should('have.length', 2);
      cy.get(selIsOpen).should('have.length', 6);

      cy.get(selOpenerCountry).contains('Cyprus').click();
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 3);
    });

    it('should pin a country (when individual item opened)', () => {
      cy.get(selPinnedOpener).should('have.length', 1);

      // Open an entry under Cyprus
      cy.get(selOpenerSeries).eq(6).click();
      cy.get(selPinnedOpener).should('have.length', 2);

      // Open an entry under Denmark
      cy.get(selOpenerSeries).eq(12).click();
      cy.get(selPinnedOpener).should('have.length', 3);

      // Close again with country openers
      cy.get(selOpenerCountry).contains('Cyprus').click();
      cy.get(selPinnedOpener).should('have.length', 2);

      cy.get(selOpenerCountry).contains('Denmark').click();
      cy.get(selPinnedOpener).should('have.length', 1);

      cy.wait(1000);
      // Open the next Danish entry
      cy.get(selOpenerSeries).eq(13).click();
      cy.get(selPinnedOpener).should('have.length', 2);
    });

    it('should re-open a country initially opened by an individual item', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 3);

      // open with individual item
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selOpenerSeries).eq(12).click();
      cy.get(selIsOpen).should('have.length', 4);

      // close with country opener
      cy.get(selPinnedOpener).contains('Denmark').click();
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 3);

      // open again with country opener
      cy.get(selOpenerCountry).contains('Denmark').click();
      cy.get(selIsOpen).should('have.length', 4);
    });

    it('should keep individually-opened items open when siblings added', () => {
      cy.get(selIsOpen).should('have.length', 3);

      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selOpenerSeries).eq(12).click();
      cy.get(selIsOpen).should('have.length', 4);
      cy.get(selPinnedOpener).contains('Denmark').should('have.length', 1);

      cy.get(selOpenerSeries).eq(4).click();
      cy.get(selIsOpen).should('have.length', 5);
    });
  });
});

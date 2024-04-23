context('Statistics Dashboard', () => {
  describe('legend grid', () => {
    beforeEach(() => {
      cy.visit('/country/France');
    });

    const force = { force: true };
    const selIsOpen = '.roll-down-wrapper.is-open';
    const selLegendGrid = '.legend-grid';
    const selPinnedOpener = '.stick-left';
    const selToggleCountry = '.legend-item-country-toggle';
    const selOpenerSeries = '.legend-item-series-toggle';

    const clickSeriesOpener = (country: string, seriesIndex = 0): void => {
      cy.get(selToggleCountry)
        .contains(country)
        .closest(selToggleCountry)
        .next()
        .find(selOpenerSeries)
        .eq(seriesIndex)
        .click(force);
      cy.wait(1000);
    };

    it('should show the legend', () => {
      cy.get('#lineChart').should('have.length', 1);
      cy.get(selLegendGrid).should('have.length', 1);
    });

    it('should pin a country when opened', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selToggleCountry)
        .contains('Cyprus')
        .should('have.length', 1)
        .click();
      cy.get(selPinnedOpener).should('have.length', 2);
    });

    it('should unpin a country when closed', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 2);

      cy.get(selToggleCountry)
        .contains('Cyprus')
        .should('have.length', 1)
        .click();
      cy.get(selPinnedOpener).should('have.length', 2);
      cy.get(selIsOpen).should('have.length', 4);

      cy.get(selToggleCountry).contains('Cyprus').click();
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 2);
    });

    it('should pin a country (when individual item opened)', () => {
      cy.get(selPinnedOpener).should('have.length', 1);

      // Open (the first) Cyprus series
      clickSeriesOpener('Cyprus');
      cy.get(selPinnedOpener).should('have.length', 2);

      // Open (the first) Danish series
      clickSeriesOpener('Denmark');
      cy.get(selPinnedOpener).should('have.length', 3);

      // Close each with country togglers
      cy.get(selToggleCountry).contains('Cyprus').click(force);
      cy.wait(1000);

      cy.get(selPinnedOpener).should('have.length', 2);

      cy.get(selToggleCountry).contains('Denmark').click(force);
      cy.wait(1000);

      cy.get(selPinnedOpener).should('have.length', 1);

      // Open the next Danish entry
      clickSeriesOpener('Denmark', 1);
      cy.get(selPinnedOpener).should('have.length', 2);
    });

    it('should re-open a country initially opened by an individual item', () => {
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 2);

      // open with individual item
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      clickSeriesOpener('Denmark');
      cy.get(selIsOpen).should('have.length', 3);

      // close with country opener
      cy.get(selPinnedOpener).contains('Denmark').click();
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 2);

      cy.wait(1000);
      // open again with country opener
      cy.get(selToggleCountry).contains('Denmark').click();
      cy.get(selIsOpen).should('have.length', 3);
    });

    it('should keep individually-opened items open when siblings added', () => {
      cy.get(selIsOpen).should('have.length', 2);

      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      clickSeriesOpener('Denmark');

      cy.get(selIsOpen).should('have.length', 3);
      cy.get(selPinnedOpener).contains('Denmark').should('have.length', 1);

      clickSeriesOpener('Denmark', 1);
      cy.get(selIsOpen).should('have.length', 4);
    });
  });
});

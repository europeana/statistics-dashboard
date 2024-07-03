context('Statistics Dashboard', () => {
  describe('legend grid', () => {
    beforeEach(() => {
      cy.visit('/country/France');
      cy.wait(1500);
    });

    const numSeriesInGroup = 3;
    const force = { force: true };
    const selIsOpen = '.roll-down-wrapper.is-open';
    const selLegendGrid = '.legend-grid';
    const selPinnedOpener = '.stick-left';
    const selToggleCountry = '.legend-item-country-toggle';
    const selOpenerSeries = '.legend-item-series-toggle';
    const selColClose = '.column-close';
    const selColRestore = '.column-restore';

    const clickSeriesOpener = (country: string, seriesIndex = 0): void => {
      cy.get(selToggleCountry)
        .contains(country)
        .closest(selToggleCountry)
        .next()
        .find(selOpenerSeries)
        .eq(seriesIndex)
        .click(force);
      cy.wait(1500);
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
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);

      cy.get(selToggleCountry)
        .contains('Cyprus')
        .should('have.length', 1)
        .click();
      cy.get(selPinnedOpener).should('have.length', 2);
      cy.get(selIsOpen).should('have.length', 2 * numSeriesInGroup);

      cy.get(selToggleCountry).contains('Cyprus').click();
      cy.wait(1000);
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);
    });

    it('should pin a country (when individual item opened)', () => {
      cy.get(selPinnedOpener).should('have.length', 1);

      // Open (the first) Cyprus series
      clickSeriesOpener('Cyprus');
      cy.get(selPinnedOpener).should('have.length', 2);

      // Open (the first) Danish series
      clickSeriesOpener('Denmark');
      cy.get(selPinnedOpener).should('have.length', numSeriesInGroup);

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
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);

      // open with individual item
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      clickSeriesOpener('Denmark');
      cy.get(selIsOpen).should('have.length', numSeriesInGroup + 1);

      // close with country opener
      cy.get(selPinnedOpener).contains('Denmark').click();
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selPinnedOpener).should('have.length', 1);
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);

      cy.wait(1000);
      // open again with country opener
      cy.get(selToggleCountry).contains('Denmark').click();
      cy.get(selIsOpen).should('have.length', numSeriesInGroup + 1);
    });

    it('should keep individually-opened items open when siblings added', () => {
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);

      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      clickSeriesOpener('Denmark');

      cy.get(selIsOpen).should('have.length', numSeriesInGroup + 1);
      cy.get(selPinnedOpener).contains('Denmark').should('have.length', 1);

      clickSeriesOpener('Denmark', 1);
      cy.get(selIsOpen).should('have.length', numSeriesInGroup + 2);
    });

    it('should toggle the columns', () => {
      cy.get(selIsOpen).should('have.length', 3);

      cy.get(selColClose).eq(0).click(force);
      cy.get(selIsOpen).should('have.length', 2);

      cy.get(selColClose).eq(0).click(force);
      cy.get(selIsOpen).should('have.length', 1);

      cy.get(selColRestore).eq(0).click(force);
      cy.get(selIsOpen).should('have.length', 2);

      cy.get(selColRestore).eq(0).click(force);
      cy.get(selIsOpen).should('have.length', 3);
    });

    it('should remove and restore pins when toggling columns', () => {
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');

      // open Denmark 3D
      clickSeriesOpener('Denmark', 0);

      cy.get(selIsOpen).should('have.length', numSeriesInGroup + 1);
      cy.get(selPinnedOpener).contains('Denmark').should('have.length', 1);

      // hide 3d column
      cy.get(selColClose).eq(0).click(force);
      cy.wait(1000);

      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');
      cy.get(selIsOpen).should('have.length', 2);

      // restore
      cy.get(selColRestore).eq(0).click(force);
      cy.wait(1000);
      cy.get(selPinnedOpener).contains('Denmark').should('have.length', 1);
      cy.get(selIsOpen).should('have.length', 1 + numSeriesInGroup);

      // now repeat with the original 3d item closed

      clickSeriesOpener('France', 0);
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);

      cy.get(selColClose).eq(0).click(force);
      cy.wait(1000);

      cy.get(selIsOpen).should('have.length', 2);
      cy.get(selColRestore).eq(0).click(force);
      cy.wait(1000);

      // confirm it did not accifentally re-enable the original 3d item
      cy.get(selIsOpen).should('have.length', numSeriesInGroup);
    });

    it('should restore pins in the correct order', () => {
      const countries = ['Belgium', 'Croatia', 'Denmark'];
      const checkPinOrder = () => {
        ['France', ...countries].forEach((country: string, index: number) => {
          cy.get(selPinnedOpener)
            .eq(index)
            .contains(country)
            .should('have.length', 1);
        });
      };

      countries.forEach((country: string, index: number) => {
        clickSeriesOpener(country, index);
      });

      // check the pin order
      checkPinOrder();

      // Hide column, removing Belgium's only series
      cy.get(selColClose).eq(0).click(force);

      cy.get(selPinnedOpener).contains('Belgium').should('not.exist');

      cy.get(selPinnedOpener).eq(0).contains('France').should('have.length', 1);
      cy.get(selPinnedOpener)
        .eq(1)
        .contains('Croatia')
        .should('have.length', 1);
      cy.get(selPinnedOpener)
        .eq(2)
        .contains('Denmark')
        .should('have.length', 1);

      // Restore column
      cy.get(selColRestore).eq(0).click(force);

      // Belgian pin should be restored
      cy.get(selPinnedOpener).contains('Belgium').should('exist');
      checkPinOrder();

      // Hide column, removing Croatia's only series
      cy.get(selColClose).eq(1).click(force);
      cy.get(selPinnedOpener).contains('Croatia').should('not.exist');

      // Restore column
      cy.get(selColRestore).eq(1).click(force);
      cy.get(selPinnedOpener).contains('Croatia').should('exist');
      checkPinOrder();

      // Hide column, removing Denmark's only series
      cy.get(selColClose).eq(2).click(force);
      cy.get(selPinnedOpener).contains('Denmark').should('not.exist');

      // Restore column
      cy.get(selColRestore).eq(2).click(force);
      cy.get(selPinnedOpener).contains('Denmark').should('exist');
      checkPinOrder();

      // Additional test: remove the default pin when the column is hidden

      // Hide column, removing Croatia's only series
      cy.get(selColClose).eq(1).click(force);
      cy.get(selPinnedOpener).contains('Croatia').should('not.exist');

      // Hide default pin
      cy.get(selPinnedOpener).contains('France').click(force);
      cy.wait(5);
      cy.get(selPinnedOpener).contains('France').should('not.exist');
      cy.get(selPinnedOpener).contains('Croatia').should('not.exist');

      // Restore column
      cy.get(selColRestore).eq(1).click(force);
      cy.get(selPinnedOpener).contains('Croatia').should('exist');
      cy.get(selPinnedOpener).contains('France').should('not.exist');

      // Check order (without France)
      countries.forEach((country: string, index: number) => {
        cy.get(selPinnedOpener)
          .eq(index)
          .contains(country)
          .should('have.length', 1);
      });
    });
  });
});

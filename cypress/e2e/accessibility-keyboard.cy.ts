context('Keyboard Accessibility', () => {
  const focusHighlightColour = 'rgb(252, 138, 98)';
  const selCountryMenuOpener = '.active-country';
  const selCountryMenu = '.country-select';

  describe('Focusable Highlights', () => {
    const checkFocusHighlights = (filter = '*') => {
      cy.get('button, input, [tabindex="0"]')
        .filter(':visible')
        .filter(filter)
        .each(($link) => {
          cy.wrap($link[0])
            .focus()
            .should('have.css', 'outline-color', focusHighlightColour);
        });
    };

    it('should highlight (top-level) focusable items (landing page)', () => {
      const selCountryLink = '.link-select-country';

      cy.visit('/');
      cy.get('#europeana-feedback-widget').invoke('remove');
      checkFocusHighlights(`:not(${selCountryLink})`);

      cy.get(selCountryLink).each(($link) => {
        cy.wrap($link[0])
          .focus()
          .children('span')
          .should('have.css', 'border-color', focusHighlightColour);
      });
    });

    it('should highlight (top-level) focusable items (overview page)', () => {
      const selDatasetName = '.dataset-name';
      cy.visit('/data/contentTier');
      cy.get('#europeana-feedback-widget').invoke('remove');
      checkFocusHighlights(`:not(${selDatasetName})`);
      cy.get(selDatasetName)
        .focus()
        .should('have.css', 'border-color', focusHighlightColour);
    });

    it('should highlight (top-level) focusable items (country page)', () => {
      cy.visit('/country/Austria');
      cy.get('#europeana-feedback-widget').invoke('remove');
      checkFocusHighlights(':not(g)');
    });
  });

  describe('Country Menu', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('Should open and close the country menu', () => {
      cy.get(selCountryMenu).filter(':visible').should('not.exist');
      cy.get(selCountryMenuOpener)
        .focus()
        .should('have.css', 'outline-color', focusHighlightColour)
        .type('{enter}');
      cy.get(selCountryMenu).filter(':visible').should('exist');
      cy.get(selCountryMenuOpener).focus().type('{enter}');
      cy.get(selCountryMenu).filter(':visible').should('not.exist');

      cy.get(selCountryMenuOpener).focus().type('{enter}');
      cy.get(selCountryMenu).filter(':visible').should('exist');
      cy.get(selCountryMenuOpener).focus().type('{esc}');
      cy.get(selCountryMenu).filter(':visible').should('not.exist');
    });

    it('Should navigate from the country menu', () => {
      [
        'Austria',
        'Belgium',
        'Bulgaria',
        'Croatia',
        'Denmark',
        'Estonia',
        'Europe',
        'Finland'
      ].forEach((country: string) => {
        cy.get(selCountryMenuOpener).focus().type('{enter}');
        cy.get(`${selCountryMenu} a`).contains(country).type('{enter}');
        cy.url().should('include', country);
      });
    });
  });

  describe('Filter Menus', () => {
    it('Should open and close the filter menus', () => {
      cy.visit('/data/contentTier');

      const selOpenFilter = '.filter-opener.open';

      [
        'Metadata Tier',
        'Country',
        'Data Provider',
        'Provider',
        'Rights Category',
        'Media Type'
      ].forEach((filterName: string) => {
        cy.get(selOpenFilter).should('not.exist');

        cy.get('.opener-name').contains(filterName).type('{enter}');
        cy.get(selOpenFilter).should('exist');

        cy.focused().type('{esc}');
        cy.get(selOpenFilter).should('not.exist');
      });
    });
  });

  describe('Export', () => {
    const selExportOpen = '.export.active';
    const selExportOpener = '.export-icon.export-opener';

    beforeEach(() => {
      cy.visit('/data/contentTier');
    });

    it('should highlight focus on the export opener', () => {
      cy.get(selExportOpener)
        .focus()
        .should('have.css', 'outline-color', focusHighlightColour);
    });

    it('should open and close the export pop up', () => {
      cy.get(selExportOpen).should('not.exist');

      cy.get(selExportOpener).focus().type('{enter}');
      cy.get(selExportOpen).should('exist');

      cy.focused().type('{enter}');
      cy.get(selExportOpen).should('not.exist');

      cy.get(selExportOpener).focus().type('{enter}');
      cy.get(selExportOpen).should('exist');

      cy.focused().type('{esc}');
      cy.get(selExportOpen).should('not.exist');
    });
  });
});

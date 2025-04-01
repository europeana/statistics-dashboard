context('Statistics Dashboard Accessibility', () => {
  const focusHighlightColour = 'rgb(252, 138, 98)';
  const selCountryMenuOpener = '.active-country';
  const selCountryMenu = '.country-select';

  describe('Keyboard Accessibility', () => {
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
        cy.visit('/');
        cy.get('#europeana-feedback-widget').invoke('remove');
        checkFocusHighlights();
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
        cy.get('#europeana-feedback-widget').invoke('remove');
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
  });
});

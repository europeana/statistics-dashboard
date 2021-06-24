import { facetNames } from '../../src/app/_data';

context('statistics-dashboard', () => {
  describe('overview', () => {

    const selLinkHomeHeader = '[data-e2e=link-home-header]';
    const selLinkHome = '[data-e2e=link-home]';
    const selCTZero = '[data-e2e=ct-zero-switch]';
    const urlParamCTZero = 'content-tier-zero=true';

    it('should show for all urls', () => {
      facetNames.forEach((url: string) => {
        cy.visit(`/data/${url}`)
        cy.url().should('contain', url);
        cy.get(selLinkHomeHeader).click();
        cy.url().should('not.contain', url);
      });
    });

    it('should show the home link', () => {
      const url = '/data/COUNTRY';
      cy.visit(url);
      cy.get(selLinkHome).should('have.length', 1);
      cy.get(selLinkHome).click({ force: true });
      cy.url().should('not.contain', url);
    });

    it('should respond to the CT-Zero option', () => {
      cy.visit('/data/COUNTRY');
      cy.get(selCTZero).should('have.length', 1);
      cy.get(selCTZero).should('not.be.checked');

      cy.get(selCTZero).click({ force: true });
      cy.get(selCTZero).should('be.checked');
      cy.url().should('contain', urlParamCTZero);
    });

    it('should respond to the CT-Zero url parameter', () => {
      cy.visit(`/data/COUNTRY?${urlParamCTZero}`);
      cy.get(selCTZero).should('be.checked');
      cy.get(selCTZero).click({ force: true });
      cy.url().should('not.contain', urlParamCTZero);
    });

    it('should show filter-removal options', () => {
      const filteredTypes = ['VIDEO', '3D'];
      const param = `?TYPE=${filteredTypes[0]}&TYPE=${filteredTypes[1]}`;

      cy.visit(`/data/COUNTRY${param}`);

      cy.url().should('contain', filteredTypes[0]);
      cy.url().should('contain', filteredTypes[1]);
      cy.get('.rm-filter').should('have.length', 2);

      cy.get('#rm_filter_TYPE_0').click({ force: true });
      cy.get('.rm-filter').should('have.length', 1);
      cy.url().should('not.contain', filteredTypes[0]);

      cy.get('#rm_filter_TYPE_0').click({ force: true });
      cy.get('.rm-filter').should('have.length', 0);
      cy.url().should('not.contain', filteredTypes[1]);
    });
  });
});

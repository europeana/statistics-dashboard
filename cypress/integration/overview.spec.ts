import { facetNames } from '../../src/app/_data';

context('statistics-dashboard', () => {
  describe('overview', () => {

    const selLinkHeader = '[data-e2e=link-home-header]';

    it('should show show for all urls', () => {
      facetNames.forEach((url: string) => {
        cy.visit(`/data/${url}`)
        cy.url().should('contain', url);
        cy.get(selLinkHeader).click();
        cy.url().should('not.contain', url);
      });
    });

    it('should show filter-removal options', () => {
      const param = '?TYPE=3D';
      cy.visit(`/data/COUNTRY${param}`);
      cy.get('.rm-filter').should('have.length', 1);
      cy.get('#rm_filter_TYPE_0').click({ force: true });
      cy.get('.rm-filter').should('have.length', 0);
      cy.url().should('not.contain', param);
    });
  });
});

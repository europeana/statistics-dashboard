context('Statistics Dashboard', () => {
  describe('cookie policy', () => {

    beforeEach(() => {
      cy.visit('/')
    });

    const selCookiePolicy = '[data-e2e="cookie-policy"]';

    it('should show the cookie policy when the user goes there directly', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.visit('/cookie-policy')
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy when the user clicks the footer link', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.get('a').contains('Cookie Policy').should('have.length', 1).click({ force: true });
      cy.get(selCookiePolicy).should('have.length', 1);
    });
  });
});

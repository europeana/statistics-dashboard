context('Statistics Dashboard', () => {
  describe('cookie policy', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    const selCookiePolicy = '[data-e2e="cookie-policy"]';

    it('should show the cookie policy when the user goes there directly', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.visit('/cookie-policy');
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy when the user clicks the footer link', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.get('a')
        .contains('Cookies Policy')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy from the consent manager', () => {
      const selCmLink = '.eu-cm a';
      cy.get(selCookiePolicy).should('not.exist');
      cy.get(selCmLink).should('not.exist');
      cy.get('.eu-cm-ctrls')
        .contains('Let me choose')
        .should('have.length', 1)
        .click();
      cy.get(selCmLink)
        .contains('cookies policy')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selCookiePolicy).should('have.length', 1);
    });
  });
});

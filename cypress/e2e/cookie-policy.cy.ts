context('Statistics Dashboard', () => {
  describe('cookie policy', () => {
    const selCookiePolicy = '[data-e2e="cookie-policy"]';
    const urlCookiePolicy = '/cookie-policy';

    it('should show the country menu', () => {
      cy.visit(urlCookiePolicy);
      cy.get('.country-menu-opener').click();
      cy.get('.country-select .menu-item')
        .contains('Belgium')
        .should('have.length', 1);
    });

    it('should hide the content-tier-zero control', () => {
      const selCtrlCTZero = '[for=ctZero]';
      cy.visit(urlCookiePolicy);
      cy.get(selCtrlCTZero).should('not.exist');
    });

    it('should show the cookie policy when the user goes there directly', () => {
      cy.visit('/');
      cy.get(selCookiePolicy).should('not.exist');
      cy.visit('/cookie-policy');
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy when the user clicks the footer link', () => {
      cy.visit('/');
      cy.get(selCookiePolicy).should('not.exist');
      cy.get('a')
        .contains('Cookies Policy')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy from the consent manager', () => {
      cy.visit('/');
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

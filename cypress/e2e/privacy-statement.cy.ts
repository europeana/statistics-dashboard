context('Statistics Dashboard', () => {
  describe('privacy statement', () => {
    const urlPrivacyStatement = '/privacy-statement';
    const selPrivacy = '[data-e2e="privacy-statement"]';

    it('should show the country menu', () => {
      cy.visit(urlPrivacyStatement);
      cy.get('.country-menu-opener').click();
      cy.get('.country-select .menu-item')
        .contains('Belgium')
        .should('have.length', 1);
    });

    it('should hide the content-tier-zero control', () => {
      const selCtrlCTZero = '[for=ctZero]';
      cy.visit(urlPrivacyStatement);
      cy.get(selCtrlCTZero).should('not.exist');
    });

    it('should show the privacy statement when the user goes there directly', () => {
      cy.visit('/');
      cy.get(selPrivacy).should('not.exist');
      cy.visit(urlPrivacyStatement);
      cy.get(selPrivacy).should('have.length', 1);
    });

    it('should show the privacy statement when the user clicks the footer link', () => {
      cy.visit('/');
      cy.get(selPrivacy).should('not.exist');
      cy.get('a')
        .contains('Privacy Statement')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selPrivacy).should('have.length', 1);
    });
  });
});

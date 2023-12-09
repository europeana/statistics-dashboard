context('Statistics Dashboard', () => {
  describe('privacy policy', () => {

    beforeEach(() => {
      cy.visit('/')
    });

    const selPrivacy = '[data-e2e="privacy-policy"]';

    it('should show the privacy policy when the user goes there directly', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.visit('/privacy-policy')
      cy.get(selPrivacy).should('have.length', 1);
    });

    it('should show the privacy policy when the user clicks the footer link', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.get('a').contains('Privacy Policy').should('have.length', 1).click({ force: true });
      cy.get(selPrivacy).should('have.length', 1);
    });

    it('should show the privacy policy from the consent manager', () => {
      const selCmLink = '.eu-cm a';
      cy.get(selPrivacy).should('not.exist');
      cy.get(selCmLink).should('not.exist');
      cy.get('.eu-cm-ctrls').contains('Let me choose').should('have.length', 1).click();
      cy.get(selCmLink).contains('privacy policy').should('have.length', 1).click({ force: true });
      cy.get(selPrivacy).should('have.length', 1);
    });
  });
});
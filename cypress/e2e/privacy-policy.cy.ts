context('Statistics Dashboard', () => {
  describe('privacy statement', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    const selPrivacy = '[data-e2e="privacy-statement"]';

    it('should show the privacy statement when the user goes there directly', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.visit('/privacy-statement');
      cy.get(selPrivacy).should('have.length', 1);
    });

    it('should show the privacy statement when the user clicks the footer link', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.get('a')
        .contains('Privacy Statement')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selPrivacy).should('have.length', 1);
    });
  });
});

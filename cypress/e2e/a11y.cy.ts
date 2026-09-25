context('Statistics Dashboard Accessibility', () => {
  const checkZone = (selector: string): void => {
    cy.get(selector).should('have.length', 1);
    cy.checkA11y(selector);
  };

  describe('Landing Page', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.injectAxe(); // Native command works now!
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations ()', () => {
      cy.checkA11y();
    });
  });

  describe('Data Page', () => {
    beforeEach(() => {
      cy.visit(`/data/contentTier`);
      cy.injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y();
    });
  });
});

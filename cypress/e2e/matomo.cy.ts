context('Statistics Dashboard', () => {
  describe('Matomo', () => {
    const checkLogLength = (length: number): void => {
      cy.window().its('matomoLog').should('have.length', length);
    };

    const force = { force: true };

    it('should create the tracker (and a log when in ci mode)', () => {
      const url = '/';
      cy.visit(url);
      cy.window().its('_paq').should('exist');
      checkLogLength(1);
    });
  });
});

import 'cypress-axe'

context('Statistics Dashboard', () => {
  describe('Accessibility', () => {

    const injectAxe = () => {
      /*
       cy.injectAxe();
       cy.injectAxe is currently broken. https://github.com/component-driven/cypress-axe/issues/82
       (so use custom injection logic)
      */

      cy.readFile('../../node_modules/axe-core/axe.min.js').then((source) => {
        return cy.window({ log: false }).then((window) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).eval(source);
        });
      });
    };

    beforeEach(() => {
      cy.server();
    });

    it('Has no detectable a11y violations (landing page)', () => {
      cy.visit('/');
      injectAxe();
      cy.checkA11y();
    })

    it('Has no detectable a11y violations (data page)', () => {
      cy.visit(`/data/contentTier`);
      injectAxe();
      cy.checkA11y();
    })

  });
});

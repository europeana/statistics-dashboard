import 'cypress-axe'

context('Statistics Dashboard Accessibility', () => {

  const checkZone = (selector: string): void => {
    cy.get(selector).should('have.length', 1);
    cy.checkA11y(selector);
  };

  const injectAxe = (): void => {
    // cy.injectAxe();
    // cy.injectAxe is currently broken. https://github.com/component-driven/cypress-axe/issues/82
    // (so use custom injection logic)

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

  describe('Landing Page', () => {

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
      cy.visit('/');
      injectAxe();
      cy.checkA11y();
    })
  });

  describe('Data Page', () => {

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
      cy.visit(`/data/contentTier`);
      injectAxe();
      cy.checkA11y();
    })

  });
});

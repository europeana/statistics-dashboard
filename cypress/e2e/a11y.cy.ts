context('Statistics Dashboard Accessibility', () => {
  const baseExclusions = [
    // ignore cookie banner region, graph & axes and the (too light) content box titles
    '.eu-cm-mini-mode-text',
    'g[transform]',
    'tspan',
    '.data-rows-title > span'
  ];

  const dataPageSpecificExclusions = [
    // ignore known colour contrast issues to do with theme
    '[data-e2e="link-home"]',
    '.filters-header',
    'label[for="ctZero"]',
    '.checkbox-label',
    '.editable',
    '.export-opener-link'
  ];

  const runStandardSuite = (url: string, pageExclusions: string[]) => {
    beforeEach(() => {
      cy.visit(url);
      cy.injectAxe();
    });

    it('Has an accessible header', () => {
      cy.get('header').should('have.length', 1);
      cy.checkA11y({ include: ['header'], exclude: pageExclusions });
    });

    it('Has an accessible footer', () => {
      cy.get('footer').should('have.length', 1);
      cy.checkA11y({ include: ['footer'], exclude: pageExclusions });
    });

    it('Has an accessible main', () => {
      cy.get('main').should('have.length', 1);
      cy.checkA11y({ include: ['main'], exclude: pageExclusions });
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y({ exclude: pageExclusions });
    });
  };

  describe('Landing Page', () => {
    runStandardSuite('/', baseExclusions);
  });

  describe('Data Page', () => {
    const dataPageExclusions = [
      ...baseExclusions,
      ...dataPageSpecificExclusions
    ];
    runStandardSuite('/data/contentTier', dataPageExclusions);
  });
});

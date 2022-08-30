context('Statistics Dashboard', () => {

  const urlContentTier = '/data/contentTier';
  const urlParamCTZero = 'content-tier-zero=';
  const urlParamCTZeroTrue = `?${urlParamCTZero}true`;

  describe('App General', () => {
    it('should show the feedback link (landing page / data page)', () => {
      cy.visit('/');
      cy.get('[data-e2e=user-assistance]').should('have.length', 1);
      cy.visit(urlContentTier);
      cy.get('[data-e2e=user-assistance]').should('have.length', 1);
    });
  });

  describe('App Routes', () => {
    const selCTZero = '#ctZero';
    const selLinkDataContentTier = '[data-e2e=link-entry-ct]';
    const selLinkHeader = '[data-e2e=link-home-header]';

    const checkCTZeroChangesUrl = (): void => {
      cy.get(selCTZero).should('have.length', 1);
      cy.get(selCTZero).should('not.be.checked');
      cy.url().should('not.contain', urlParamCTZero);

      cy.get(selCTZero).click({force: true});
      cy.get(selCTZero).should('be.checked');
      cy.url().should('contain', urlParamCTZero);
    };

    it('the url should reflect content-tier-zero visibility (landing page)', () => {
      cy.visit('/');
      checkCTZeroChangesUrl();
    });

    it('the url should reflect content-tier-zero visibility (data page)', () => {
      cy.visit(urlContentTier);
      checkCTZeroChangesUrl();
    });

    it('the content-tier-zero should be remembered between pages (click test)', () => {
      cy.visit('/');
      cy.get(selCTZero).click({force: true});
      cy.get(selCTZero).should('be.checked');
      cy.url().should('contain', urlParamCTZero);

      const goBackAndForth = () => {
        cy.url().should('not.contain', '/data');
        cy.get(selLinkDataContentTier).click({force: true});

        cy.get(selCTZero).should('be.checked');
        cy.url().should('contain', urlParamCTZero);

        cy.get(selLinkHeader).click({force: true});

        cy.get(selCTZero).should('be.checked');
        cy.url().should('contain', urlParamCTZero);
      };
      goBackAndForth();
      goBackAndForth();
    });

    it('the content-tier-zero should be remembered between pages (history test)', () => {

      const host = 'http://localhost:4280';
      cy.visit('/')
      const expectedHistory = ['/', `/${urlParamCTZeroTrue}`, `${urlContentTier}${urlParamCTZeroTrue}`, `${urlContentTier}`, '/'];

      cy.location('search').should('equal', '');
      cy.location('pathname').should('equal', '/');
      cy.location('href').should('equal', `${host}${expectedHistory[0]}`);

      cy.get(selCTZero).click({force: true});
      cy.location('href').should('equal', `${host}${expectedHistory[1]}`);

      cy.get(selLinkDataContentTier).click({force: true});
      cy.location('href').should('equal', `${host}${expectedHistory[2]}`);

      cy.get(selCTZero).click({force: true});
      cy.location('href').should('equal', `${host}${expectedHistory[3]}`);

      cy.get(selLinkHeader).click({force: true});
      cy.location('href').should('equal', `${host}${expectedHistory[4]}`);

      // browser back
      for(let i = 0; i < expectedHistory.length -1; i++) {
        const historyIndex = expectedHistory.length - (i + 1);
        cy.location('href').should('equal', `${host}${expectedHistory[historyIndex]}`);
        cy.go('back');
      }

      // browser forward
      for(let i = 0; i < expectedHistory.length -1; i++) {
        cy.location('href').should('equal', `${host}${expectedHistory[i]}`);
        cy.go('forward');
      }
    });
  });
});

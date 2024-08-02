context('Statistics Dashboard', () => {
  const force = { force: true };
  const host = 'http://localhost:4280';
  const urlContentTier = '/data/contentTier';
  const urlParamCTZero = 'content-tier-zero=';
  const urlParamCTZeroTrue = `?${urlParamCTZero}true`;
  const urlCountry = '/country/Europe';

  describe('App General', () => {
    it('should show the feedback link (landing page / data page)', () => {
      cy.visit('/');
      cy.get('[data-e2e=user-assistance]').should('have.length', 1);
      cy.visit(urlContentTier);
      cy.get('[data-e2e=user-assistance]').should('have.length', 1);
    });
  });

  describe('App Route History', () => {
    it('should keep filter controls synced with the url history', () => {
      const baseUrl = `${host}${urlContentTier}`;
      const selFilter = `.filters-header + .filters .filter`;
      const selFilterOpener = '.filter-opener';
      const selFilterValueLabel = `${selFilter} .checkbox-label`;
      const selFilterRemove = '.rm-filter .checkbox-label';

      cy.visit(urlContentTier);
      cy.location('href').should('equal', baseUrl);
      cy.get(selFilterRemove).should('not.exist');

      // filter on country Belgium / confirm url & filter rm buttons updated

      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selFilterValueLabel).contains('Belgium').click(force);

      cy.location('href').should('equal', `${baseUrl}?country=Belgium`);
      cy.get(selFilterRemove).contains('Belgium').should('have.length', 1);

      // filter on Metadata Tier 0 / confirm url & filter rm buttons updated

      cy.get(selFilterRemove).contains('Tier 0').should('not.exist');
      cy.get(selFilterOpener).eq(0).click(force);
      cy.get(selFilterValueLabel).contains('Tier 0').click(force);

      cy.location('href').should(
        'equal',
        `${baseUrl}?metadataTier=0&country=Belgium`
      );
      cy.get(selFilterRemove).contains('Tier 0').should('have.length', 1);

      // filter on type IMAGE / confirm url & filter rm buttons updated

      cy.get(selFilterRemove).contains('IMAGE').should('not.exist');
      cy.get(selFilterOpener).eq(5).click(force);
      cy.get(selFilterValueLabel).contains('IMAGE').click(force);

      cy.location('href').should(
        'equal',
        `${baseUrl}?metadataTier=0&country=Belgium&type=IMAGE`
      );
      cy.get(selFilterRemove).contains('IMAGE').should('have.length', 1);

      // filter on inexistent dataset id / confirm url & filter rm buttons updated

      const selDatasetId = '.dataset-name';

      cy.get(selFilterRemove).contains('dataset_not_found').should('not.exist');
      cy.get(selDatasetId).type('dataset_not_found{enter}', force);
      cy.get(selFilterRemove)
        .contains('dataset_not_found')
        .should('have.length', 1);

      // History Checks

      // go back (remove dataset id)

      cy.go('back');

      cy.get(selFilterRemove).contains('dataset_not_found').should('not.exist');
      cy.get(selFilterRemove).contains('IMAGE').should('exist');
      cy.get(selFilterRemove).contains('Tier 0').should('exist');
      cy.get(selFilterRemove).contains('Belgium').should('exist');

      // go back (remove image)

      cy.go('back');

      cy.get(selFilterRemove).contains('IMAGE').should('not.exist');
      cy.get(selFilterRemove).contains('Tier 0').should('exist');
      cy.get(selFilterRemove).contains('Belgium').should('exist');
      cy.location('href').should(
        'equal',
        `${baseUrl}?metadataTier=0&country=Belgium`
      );

      // go back (remove Tier 0)
      cy.go('back');

      cy.get(selFilterRemove).contains('Tier 0').should('not.exist');
      cy.get(selFilterRemove).contains('Belgium').should('exist');
      cy.location('href').should('equal', `${baseUrl}?country=Belgium`);

      // go back (remove Country)
      cy.go('back');

      cy.get(selFilterRemove).should('not.exist');
      cy.location('href').should('equal', baseUrl);

      // go forward (re-add Country)
      cy.go('forward');

      cy.get(selFilterRemove).contains('Belgium').should('exist');
      cy.get(selFilterRemove).contains('IMAGE').should('not.exist');
      cy.location('href').should('equal', `${baseUrl}?country=Belgium`);

      // go forward (re-add Tier 0)

      cy.go('forward');

      cy.get(selFilterRemove).contains('Belgium').should('exist');
      cy.get(selFilterRemove).contains('Tier 0').should('exist');
      cy.get(selFilterRemove).contains('IMAGE').should('not.exist');
      cy.location('href').should(
        'equal',
        `${baseUrl}?metadataTier=0&country=Belgium`
      );

      // go forward (re-add IMAGE)
      cy.go('forward');

      cy.get(selFilterRemove).contains('Belgium').should('exist');
      cy.get(selFilterRemove).contains('Tier 0').should('exist');
      cy.get(selFilterRemove).contains('IMAGE').should('exist');
      cy.location('href').should(
        'equal',
        `${baseUrl}?metadataTier=0&country=Belgium&type=IMAGE`
      );
    });
  });

  describe('App Content Tier Zero', () => {
    const selCTZero = '#ctZero';
    const selLinkDataContentTier = '[data-e2e=link-entry-ct]';
    const selLinkHome = '[data-e2e=link-home-header]';

    const checkCTZeroChangesUrl = (): void => {
      cy.get(selCTZero).should('have.length', 1);
      cy.get(selCTZero).should('not.be.checked');
      cy.url().should('not.contain', urlParamCTZero);

      cy.get(selCTZero).click(force);
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
      cy.get(selCTZero).click(force);
      cy.get(selCTZero).should('be.checked');
      cy.url().should('contain', urlParamCTZero);

      const goBackAndForth = () => {
        cy.url().should('not.contain', '/data');
        cy.get(selLinkDataContentTier).click(force);

        cy.get(selCTZero).should('be.checked');
        cy.url().should('contain', urlParamCTZero);

        cy.get(selLinkHome).click(force);

        cy.get(selCTZero).should('be.checked');
        cy.url().should('contain', urlParamCTZero);
      };
      goBackAndForth();
      goBackAndForth();
    });

    it('the content-tier-zero should be remembered between pages (history test)', () => {
      cy.visit('/');
      const expectedHistory = [
        '/',
        `/${urlParamCTZeroTrue}`,
        `${urlContentTier}${urlParamCTZeroTrue}`,
        `${urlContentTier}`,
        '/'
      ];

      cy.location('search').should('equal', '');
      cy.location('pathname').should('equal', '/');
      cy.location('href').should('equal', `${host}${expectedHistory[0]}`);

      cy.get(selCTZero).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[1]}`);

      cy.get(selLinkDataContentTier).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[2]}`);

      cy.get(selCTZero).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[3]}`);

      cy.get(selLinkHome).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[4]}`);

      // browser back
      for (let i = 0; i < expectedHistory.length - 1; i++) {
        const historyIndex = expectedHistory.length - (i + 1);
        cy.location('href').should(
          'equal',
          `${host}${expectedHistory[historyIndex]}`
        );
        cy.go('back');
      }

      // browser forward
      for (let i = 0; i < expectedHistory.length - 1; i++) {
        cy.location('href').should('equal', `${host}${expectedHistory[i]}`);
        cy.go('forward');
      }
    });

    it('the content-tier-zero setting should be retained across history test', () => {
      cy.visit(urlCountry);
      const expectedHistory = [
        `${urlCountry}`,
        `${urlCountry}${urlParamCTZeroTrue}`,
        `${urlCountry}`
      ];

      cy.location('href').should('equal', `${host}${expectedHistory[0]}`);

      cy.get(selCTZero).parent().should('not.have.class', 'checked');

      cy.get(selCTZero).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[1]}`);
      cy.get(selCTZero).parent().should('have.class', 'checked');

      cy.get(selCTZero).click(force);
      cy.location('href').should('equal', `${host}${expectedHistory[2]}`);
      cy.get(selCTZero).parent().should('not.have.class', 'checked');

      cy.go('back');
      cy.location('href').should('equal', `${host}${expectedHistory[1]}`);
      cy.get(selCTZero).parent().should('have.class', 'checked');

      cy.go('back');
      cy.location('href').should('equal', `${host}${expectedHistory[0]}`);
      cy.get(selCTZero).parent().should('not.have.class', 'checked');

      cy.go('forward');
      cy.location('href').should('equal', `${host}${expectedHistory[1]}`);
      cy.get(selCTZero).parent().should('have.class', 'checked');

      cy.go('forward');
      cy.location('href').should('equal', `${host}${expectedHistory[2]}`);
      cy.get(selCTZero).parent().should('not.have.class', 'checked');
    });
  });
});

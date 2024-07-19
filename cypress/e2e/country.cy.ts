context('Statistics Dashboard', () => {
  const force = { force: true };

  describe('Country Page', () => {
    const selPowerBar = '.powerbar .powerbar-charge';
    const selPowerBar3D = '.entry-card:first-child .powerbar-charge';
    const selPowerBarHQ = '.entry-card:last-child .powerbar-charge';

    beforeEach(() => {
      cy.visit('/country/Austria');
    });

    it('should toggle the appendices', () => {
      const selAppendiceToggle = '.appendice-toggle';
      const selAppendiceTable = '.appendice-grid';

      cy.get(selAppendiceTable).filter(':visible').should('have.length', 0);
      cy.get(selAppendiceToggle).click(force);
      cy.get(selAppendiceTable).filter(':visible').should('have.length', 1);
      cy.get(selAppendiceToggle).click(force);
      cy.get(selAppendiceTable).filter(':visible').should('have.length', 0);
    });

    it('should toggle the cards and columns', () => {
      const selColClose = '.column-close';
      const selColRestore = '.column-restore';
      const selAppendiceToggle = '.appendice-toggle';
      const selAppendiceTable = '.appendice-grid';

      cy.get(selAppendiceTable).should('not.have.class', 'single');
      cy.get(selAppendiceTable).should('not.have.class', 'double');
      cy.get(selPowerBar).should('have.length', 6);
      cy.get(selColClose).should('have.length', 3);
      cy.get(selColRestore).should('not.exist', 2);

      // close the first column
      cy.get(selColClose).eq(0).click(force);
      cy.get(selPowerBar).should('have.length', 4);
      cy.get(selColRestore).filter(':visible').should('have.length', 2);
      cy.get(selAppendiceTable).should('not.have.class', 'single');
      cy.get(selAppendiceTable).should('have.class', 'double');

      // close the 2nd column
      cy.get(selColClose).eq(0).click(force);
      cy.get(selPowerBar).should('have.length', 2);
      cy.get(selColRestore).filter(':visible').should('have.length', 2);
      cy.get(selAppendiceTable).should('have.class', 'single');
      cy.get(selAppendiceTable).should('not.have.class', 'double');

      // restore
      cy.get(selColRestore).eq(0).click(force);
      cy.get(selPowerBar).should('have.length', 4);
      cy.get(selAppendiceTable).should('not.have.class', 'single');
      cy.get(selAppendiceTable).should('have.class', 'double');

      cy.get(selColRestore).eq(0).click(force);
      cy.get(selPowerBar).should('have.length', 6);
      cy.get(selAppendiceTable).should('not.have.class', 'single');
      cy.get(selAppendiceTable).should('not.have.class', 'double');
    });

    it('should show the power bars', () => {
      cy.get(selPowerBar).should('have.length', 6);
      cy.get(selPowerBarHQ).should('have.length', 2);
      cy.get(selPowerBar3D).should('have.length', 2);
    });

    it('should show the power bar summaries', () => {
      const selSummary = '[e2e="power-bar-summary"]';
      cy.get(selSummary).should('have.length', 3);
    });

    it('should show the data entry point links', () => {
      const selLinkData3D = '[data-e2e=link-entry-3d]';
      const selLinkDataHQ = '[data-e2e=link-entry-hq]';
      const selLinkDataType = '[data-e2e=link-entry-type]';
      const selLinkDataRights = '[data-e2e=link-entry-rights]';
      const selLinkDataDataProvider = '[data-e2e=link-entry-provider]';
      const selLinkDataProvider = '[data-e2e=link-entry-data-provider]';

      cy.get(selLinkData3D).should('have.length', 1);
      cy.get(selLinkDataHQ).should('have.length', 1);
      cy.get(selLinkDataType).should('have.length', 1);
      cy.get(selLinkDataRights).should('have.length', 1);
      cy.get(selLinkDataDataProvider).should('have.length', 1);
      cy.get(selLinkDataProvider).should('have.length', 1);
    });
  });

  describe('Country Menu', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(3000);
    });

    const selLinkHomeHeader = '[data-e2e=link-home-header]';
    const selOpener = '.header .country-menu-opener';
    const selCountryMenu = '.header .country-select';
    const selCountryLink = `${selCountryMenu} a`;

    it('should open the country menu', () => {
      cy.get(selOpener).should('have.length', 1);
      cy.get(selCountryMenu).should('have.length', 1);
      cy.get(selCountryMenu).should('not.be.visible');
      cy.get('.active-country').click();
      cy.get(selCountryMenu).should('be.visible');
    });

    it('should open the country page', () => {
      const country = 'Austria';

      cy.url().should('not.include', country);
      cy.get(selCountryLink).should('exist');
      cy.get(selCountryLink).should('not.have.attr', 'disabled');

      cy.wait(3000);
      cy.get(selCountryLink).contains(country).click(force);
      cy.wait(3000);

      cy.url().should('include', country);
      cy.get(selCountryLink).should('have.attr', 'disabled');
    });

    it('should change the country page', () => {
      const country1 = 'Austria';
      const country2 = 'Belgium';
      const selLink = `${selCountryLink} span`;

      cy.url().should('not.include', country1);
      cy.url().should('not.include', country2);

      cy.get(selLink).contains(country1).click(force);

      cy.url().should('include', country1);
      cy.url().should('not.include', country2);

      cy.get(selLink).contains(country2).click(force);

      cy.url().should('include', country2);
      cy.url().should('not.include', country1);

      cy.get(selLinkHomeHeader).click(force);
      cy.url().should('not.include', country2);
    });

    it('should show open non member-state pages', () => {
      const country1 = 'Austria';
      const country2 = 'Europe';
      const country3 = 'Belgium';
      const selEntryCard = '.entry-card';
      const selLink = `${selCountryLink} span`;

      cy.get(selLink).contains(country1).click(force);
      cy.get(selEntryCard).should('have.length', 8);

      cy.get(selLink).contains(country2).click(force);
      cy.get(selEntryCard).should('have.length', 4);

      cy.get(selLink).contains(country3).click(force);
      cy.get(selEntryCard).should('have.length', 8);
    });
  });
});

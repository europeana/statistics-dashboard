context('Statistics Dashboard', () => {
  const force = { force: true };

  describe('Country Target Page', () => {
    const selPowerBar = '.powerbar .powerbar-charge';
    const selPowerBar3D = '.entry-card:first-child .powerbar-charge';
    const selPowerBarHQ = '.entry-card:last-child .powerbar-charge';

    it('should show the power bars', () => {
      cy.visit('/country/Austria');
      cy.get(selPowerBar).should('have.length', 6);
      cy.get(selPowerBarHQ).should('have.length', 2);
      cy.get(selPowerBar3D).should('have.length', 2);
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
      //cy.get(selLinkDataType).should('have.length', 1);
      cy.get(selLinkDataRights).should('have.length', 1);
      cy.get(selLinkDataDataProvider).should('have.length', 1);
      cy.get(selLinkDataProvider).should('have.length', 1);
    });
  });

  describe('Country Target Menu', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(3000);
    });

    const selLinkHomeHeader = '[data-e2e=link-home-header]';
    const selTarget = '.header .target';
    const selTargetMenu = '.header .target-select';
    const selTargetLink = '.header .target-select a span';
    const selTargetLinkActive = '.header .target-select a[disabled]';

    it('should open the target menu', () => {
      cy.get(selTarget).should('have.length', 1);
      cy.get(selTargetMenu).should('have.length', 1);
      cy.get(selTargetMenu).should('not.be.visible');
      cy.get('.active-country').click();
      cy.get(selTargetMenu).should('be.visible');
    });

    it('should open the country target page', () => {
      const country = 'Austria';

      cy.url().should('not.include', country);
      cy.get(selTargetLinkActive).should('not.exist');

      cy.wait(3000);
      cy.get(selTargetLink).contains(country).click(force);
      cy.wait(3000);

      cy.url().should('include', country);
      cy.get(selTargetLinkActive).should('have.length', 1);
    });

    it('should change the country target page', () => {
      const country1 = 'Austria';
      const country2 = 'Belgium';
      cy.url().should('not.include', country1);
      cy.url().should('not.include', country2);

      cy.get(selTargetLink).contains(country1).click(force);

      cy.url().should('include', country1);
      cy.url().should('not.include', country2);

      cy.get(selTargetLink).contains(country2).click(force);

      cy.url().should('include', country2);
      cy.url().should('not.include', country1);

      cy.get(selLinkHomeHeader).click(force);
      cy.url().should('not.include', country2);
    });
  });
});

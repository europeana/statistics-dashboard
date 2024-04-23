context('Statistics Dashboard', () => {
  const force = { force: true };

  describe('Country Target Page', () => {
    const selPowerBar = '.powerbar .powerbar-charge';
    const selPowerBar3D = '.entry-card:first-child .powerbar-charge';
    const selPowerBarHQ = '.entry-card:last-child .powerbar-charge';

    it('should show the power bars', () => {
      cy.visit('/country/Austria');
      cy.get(selPowerBar).should('have.length', 4);
      cy.get(selPowerBarHQ).should('have.length', 2);
      cy.get(selPowerBar3D).should('have.length', 2);
    });

    it('should colour the power bar charge label', () => {
      const selPowerBarChargeLabel = '.powerbar-charge-label';
      cy.visit('/country/Belarus');
      cy.get(selPowerBarChargeLabel)
        .eq(0)
        .should('have.css', 'color')
        .and('eq', 'rgb(77, 77, 77)');

      cy.visit('/country/Belgium');
        cy.get(selPowerBarChargeLabel)
          .eq(0)
          .should('have.css', 'color')
          .and('eq', 'rgb(255, 255, 255)');

      cy.visit('/country/Belgium');
        cy.get(selPowerBarChargeLabel)
          .eq(1)
          .should('have.css', 'color')
          .and('eq', 'rgb(10, 114, 204)');
    });

    it('should link to the 3D data', () => {
      const selLinkEntry3D = '[data-e2e=link-entry-3d]';
      const param3D = 'type=3D';

      cy.visit('/country/Austria');
      cy.url().should('not.include', param3D);

      cy.get(selLinkEntry3D).should('have.length', 1);
      cy.get(selLinkEntry3D).click(force);

      // confirm we're on the data page
      cy.url().should('include', param3D);

      // find the link back & return
      cy.get('.target-links .target').click(force);
      cy.url().should('not.include', param3D);
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

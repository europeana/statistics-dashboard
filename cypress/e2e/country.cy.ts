context('Statistics Dashboard', () => {
  describe('Country Target Menu', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(3000);
    });

    const force = { force: true };
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

      /*
      cy.get('.active-country').click();
      cy.wait(3000);
      cy.get(selTargetLinkActive).should('have.length', 1);
      */
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
    });

    /*
    it('close the country target page', () => {
      const country = 'Bulgaria';
      cy.visit(`/country/${country}`);
      cy.wait(1000);
      cy.get(selTargetLinkActive).should('have.length', 1);
      cy.get(selLinkHomeHeader).click();
      cy.get(selTargetLinkActive).should('not.exist');
    });
    */
  });
});

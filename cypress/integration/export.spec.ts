import { DimensionName } from '../../src/app/_models';

context('statistics-dashboard', () => {

  const force = { force : true };
  const selExports = '.export.active';
  const selOpener = '.export-opener';
  const selText = '.copy-source';

  const urlDefault = `/data/${DimensionName.country}`;
  const urlFiltered = `${urlDefault}?provider=Athena`;

  describe('exports', () => {

    it('should show and hide the exports panel', () => {
      cy.visit(urlDefault);
      cy.get(selExports).should('have.length', 0);
      cy.get(selOpener).should('have.length', 1);
      cy.get(selOpener).click(force);
      cy.get(selExports).should('have.length', 1);
      cy.get(selOpener).click(force);
      cy.get(selExports).should('have.length', 0);
    });

    it('should be aware of the current page url', () => {
      cy.visit(urlDefault);
      cy.get(selOpener).click(force);
      cy.get(selText).invoke('val').should('contain', urlDefault);
      cy.get(selText).invoke('val').should('not.contain', urlFiltered);
      cy.visit(urlFiltered);
      cy.get(selOpener).click(force);
      cy.get(selText).invoke('val').should('contain', urlFiltered);
    });

  });
});

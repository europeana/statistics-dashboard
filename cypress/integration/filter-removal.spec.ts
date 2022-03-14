import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
  describe('filter removal', () => {
    const force = { force: true };
    const selFilterRemove = '.rm-filter';
    const selFilterRemoveNav = '.rm-filter-nav';
    const selNavNext = `${selFilterRemoveNav}-next`;
    const selNavPrev = `${selFilterRemoveNav}-prev`;
    const selNavNextActive = `${selNavNext}.active`;
    const selNavPrevActive = `${selNavPrev}.active`;
    const url = `/data/${DimensionName.country}?dataset-id='datasetId_123,datasetId_456,datasetId_789,datasetId_abc,datasetId_def,datasetId_hij`;

    it('should show the filter remove scroll controls', () => {
      cy.visit(url);
      cy.get(selFilterRemove).should('have.length', 6);
      cy.get(selFilterRemoveNav).should('have.length', 1);
      cy.get(selNavNext).should('have.length', 1);
      cy.get(selNavPrev).should('have.length', 1);
      cy.get(selNavNextActive).should('have.length', 1);
      cy.get(selNavPrevActive).should('have.length', 0);
    });

    it('should scroll the filter remove options', () => {
      cy.visit(url);
      cy.get(selNavPrevActive).should('have.length', 0);
      cy.get(selNavNextActive).click(force);
      cy.get(selNavPrevActive).should('have.length', 1);
    });
  });
});

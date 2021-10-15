import { DimensionName } from '../../src/app/_models';

context('statistics-dashboard', () => {
  describe('filters', () => {

    const force = { force: true };
    const selCloseDateOverride = '[data-e2e="close-date-override"]';
    const selDatasetId = '.dataset-name';
    const selDateFrom = '[data-e2e="dateFrom"]';
    const selDateTo = '[data-e2e="dateTo"]';

    const selFacetSelect = '.facet-param';
    const selFiltersHeader = '.filters-header';
    const selFilter = `${selFiltersHeader} + .filters .filter`;
    const selFilterOpener = '.filter-opener';
    const selFilterOpenerName = `${selFilterOpener} .opener-name`;
    const selFilterOpened = `${selFilter} .checkboxes-list`;
    const selFilterRemove = `.rm-filter`;
    const selFilterRemoveNav = `.rm-filter-nav`;
    const selNoData = '.no-data';
    const selCheckbox = `${selFilter} .checkbox`;
    const selSearch = `.checkbox-filter-input`;
    const selFilterValueLabel = `${selFilter} .checkbox-label`;

    it('should not include filters for the current dimension', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selFilterOpenerName).contains('Country').should('have.length', 0);
      cy.get(selFilterOpenerName).contains('Content Tier').should('have.length', 1);

      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpenerName).contains('Country').should('have.length', 1);
      cy.get(selFilterOpenerName).contains('Content Tier').should('have.length', 0);
    });

    it('should show the filters (closed)', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selFilter).should('have.length', 7);
      cy.get(selFilterOpener).should('have.length', 7);
      cy.get(selFilterOpened).should('have.length', 0);
    });

    it('should open and close the filters', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selFilterOpener).first().click(force);
      cy.get(selFilterOpened).should('have.length', 1);
      cy.get(selFilterOpener).last().click(force);
      cy.get(selFilterOpened).should('have.length', 0);
    });

    it('should apply the filters', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selFilterOpener).first().click(force);
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selCheckbox).first().click(force);
      cy.get(selFilterRemove).should('have.length', 1);
    });

    it('should scroll the filter remove options', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selFilterOpener).eq(2).click(force);
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selFilterRemoveNav).should('have.length', 0);

      for(let i=0; i<4; i++){
        cy.get(selCheckbox).eq(i).click(force);
      }

      cy.get(selFilterRemove).should('have.length', 4);
      cy.get(selFilterRemoveNav).should('have.length', 1);
    });

    it('should disable and restore filters', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selFilterValueLabel).contains('Belgium').click();
      cy.get(selFilterRemove).should('have.length', 1);
      cy.get(selFacetSelect).select('Country', force);
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selFacetSelect).select('Provider', force);
      cy.get(selFilterRemove).should('have.length', 1);
    });

    it('should search the filters and remember the term when re-opened', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterValueLabel).should('have.length', 0);
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selFilterValueLabel).should('have.length.gt', 0);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 1);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);
      cy.get(selSearch).should('have.length', 1);

      cy.get(selSearch).type('Ge', 1);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Germany').should('have.length', 1);

      cy.get(selFiltersHeader).click(force);
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selSearch).should('have.value', 'Ge');
    });

    it('should search the filters (diacritics)', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(2).click(force);
      cy.get(selFilterValueLabel).contains('Österreichische Nationalbibliothek - Austrian National Library').should('have.length', 1);

      cy.get(selSearch).type('oster', 1);
      cy.get(selFilterValueLabel).should('have.length', 1);
      cy.get(selSearch).clear();
      cy.get(selFilterValueLabel).should('have.length', 35);
      cy.get(selSearch).type('Öster', 1);
      cy.get(selFilterValueLabel).should('have.length', 1);
      cy.get(selSearch).clear();
      cy.get(selSearch).type('Ester', 1);
      cy.get(selFilterValueLabel).should('have.length', 0);
      cy.get(selSearch).clear();
      cy.get(selSearch).type('oster', 1);
      cy.get(selFilterValueLabel).should('have.length', 1);
    });

    it('should allow date range definitions', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selDateFrom).should('have.length', 0);
      cy.get(selDateTo).should('have.length', 0);
      cy.get(selFilterOpener).last().click(force);
      cy.get(selDateFrom).should('have.length', 1);

      const today = new Date().toISOString().split('T')[0];
      cy.get(selDateFrom).type(today);
      cy.get(selDateTo).type(today);

      cy.get(selCloseDateOverride).should('be.visible');
      cy.get(selDateFrom).clear();
      cy.get(selCloseDateOverride).should('not.be.visible');
    });

    it('should filter on the dataset id', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterRemove).should('have.length', 0);

      cy.get(selDatasetId).type('dataset_1{enter}');
      cy.get(selFilterRemove).should('have.length', 1);
      cy.get(selDatasetId).type(',dataset_2{enter}');
      cy.get(selFilterRemove).should('have.length', 2);

      cy.get(selDatasetId).clear();
      cy.get(selDatasetId).type('{enter}');
      cy.get(selFilterRemove).should('have.length', 0);
    });

    it('should report when no results are found', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selNoData).should('have.length', 0);
      cy.get(selDatasetId).type('dataset_x{enter}');
      cy.get(selNoData).should('be.visible');
    });
  });
});

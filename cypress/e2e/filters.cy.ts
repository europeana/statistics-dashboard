import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
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
    const selFilterOpenerDisabled = `${selFilterOpener}.disabled`;
    const selFilterOpenerName = `${selFilterOpener} .opener-name`;
    const selFilterOpened = `${selFilter} .checkboxes-list`;
    const selFilterRemove = `.rm-filter`;
    const selNoData = '.no-data';
    const selCheckbox = `${selFilter} .checkbox`;
    const selSearch = `.checkbox-filter-input`;
    const selFilterValueLabel = `${selFilter} .checkbox-label`;
    const selPercentFormat = `.chartFormat.checkbox-labelled`;

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

    it('should apply and remove filters', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);

      // apply filter on country Belgium
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selFilterValueLabel).contains('Belgium').click();
      cy.get(selFilterRemove).should('have.length', 1);

      cy.get(selFacetSelect).select('Country', force);
      cy.get(selFilterRemove).should('have.length', 0);
      cy.get(selFacetSelect).select('Provider', force);
      cy.get(selFilterRemove).should('have.length', 1);
    });

    it('should disable and re-enable filters when data isn\'t present', () => {
      cy.visit(`/data/${DimensionName.contentTier}?type=4D`);
      cy.get(selFilterOpenerDisabled).should('have.length', 7);

      // try to open...
      cy.get(selFilterOpener).eq(1).click(force);
      // ...but nothing shows
      cy.get(selCheckbox).should('have.length', 0);

      cy.get(selFilterRemove).click(force);
      cy.get(selFilterOpenerDisabled).should('have.length', 0);

      // Remove the blocking filter...
      cy.get(selCheckbox).should('have.length', 0);

      // ...and things will show
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selCheckbox).should('have.length.gt', 0);
    });

    it('should allow filters disabled by search terms to be reopened', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(1).click(force);

      // search for inexistent country 'xxx'
      cy.get(selCheckbox).should('have.length.gt', 0);
      cy.get(selFilterOpenerDisabled).should('have.length', 0);
      cy.get(selSearch).type('xxx', 1);
      cy.get(selCheckbox).should('have.length', 0);
      cy.get(selFilterOpenerDisabled).should('have.length', 1);

      // open the types menu (closes the country menu)
      cy.get(selFilterOpener).eq(5).click(force);
      cy.get(selFilterValueLabel).contains('3D').should('have.length', 1);

      // re-open the country menu and remove the filter
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selFilterOpenerDisabled).should('have.length', 1);
      cy.get(selSearch).clear();

      // Country menu enabled - the user wasn't locked-out because of their filter
      cy.get(selFilterOpenerDisabled).should('have.length', 0);
    });

    it('should load more', () => {
      const selLoadMore = '.load-more-item a';

      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selLoadMore)
        .should('have.length', 0);
      cy.get(selFilterOpener).eq(2).click(force);

      cy.get(selCheckbox).should('have.length', 50);
      cy.get(selLoadMore)
        .filter(':visible')
        .should('have.length', 1);

      cy.get(selLoadMore).click();

      cy.get(selCheckbox).should('have.length.gt', 50);
      cy.get(selLoadMore)
        .filter(':visible')
        .should('have.length', 0);
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

    it('should search the filters (regex start)', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selCheckbox).should('have.length', 25);
      cy.get(selFilterValueLabel).contains('Cyprus').should('have.length', 1);

      cy.get(selSearch).type('a', 1);
      cy.get(selCheckbox).should('have.length', 20);
      cy.get(selFilterValueLabel).contains('Cyprus').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Croatia').should('have.length', 1);

      cy.get(selSearch).clear().type('^a', 1);
      cy.get(selCheckbox).should('have.length', 1);
      cy.get(selFilterValueLabel).contains('Croatia').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Austria').should('have.length', 1);
    });

    it('should search the filters (regex end)', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(1).click(force);
      cy.get(selCheckbox).should('have.length', 25);
      cy.get(selFilterValueLabel).contains('Austria').should('have.length', 1);

      cy.get(selSearch).type('e', 1);
      cy.get(selCheckbox).should('have.length', 13);
      cy.get(selFilterValueLabel).contains('Austria').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 1);

      cy.get(selSearch).clear().type('e$', 1);
      cy.get(selCheckbox).should('have.length', 3);
      cy.get(selFilterValueLabel).contains('Belgium').should('have.length', 0);
      cy.get(selFilterValueLabel).contains('France').should('have.length', 1);
    });

    it('should search the filters (regex literals)', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(3).click(force);
      cy.get(selCheckbox).should('have.length', 38);
      cy.get(selSearch).type('^', 1);
      cy.get(selCheckbox).should('have.length', 2);
      cy.get(selSearch).clear();
      cy.get(selCheckbox).should('have.length', 38);
      cy.get(selSearch).type('$', 1);
    });

    it('should search the filters (diacritics)', () => {
      cy.visit(`/data/${DimensionName.contentTier}`);
      cy.get(selFilterOpener).eq(2).click(force);
      cy.get(selFilterValueLabel).contains('Österreichische Nationalbibliothek - Austrian National Library').should('have.length', 1);

      cy.get(selSearch).type('oster', 1);
      cy.get(selFilterValueLabel).should('have.length', 1);
      cy.get(selSearch).clear();
      cy.get(selFilterValueLabel).should('have.length', 50);
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

      const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
      cy.get(selDateFrom).type(today);
      cy.get(selDateTo).type(today);

      cy.get(selCloseDateOverride).should('be.visible');
      cy.get(selDateFrom).clear(force);
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
      cy.get(selPercentFormat).should('be.visible');
      cy.get(selNoData).should('have.length', 0);
      cy.get(selDatasetId).type('dataset_x{enter}');
      cy.get(selNoData).should('be.visible');
      cy.get(selPercentFormat).should('have.length', 0);
    });
  });
});

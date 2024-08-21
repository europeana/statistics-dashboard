import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
  describe('grid', () => {
    const force = { force: true };
    const selInputGoTo = 'input.go-to';
    const selInputPageSize = 'select.max-page-size';
    const selRowName = '[data-e2e="grid-row-name"]';
    const selPageNext = '[data-e2e="grid-page-next"]';
    const selPagePrev = '[data-e2e="grid-page-prev"]';
    const selColSortCount = '[data-e2e="grid-sort-count"]:nth-of-type(4) a';
    const selFacetSelect = '.facet-param';
    const selFilter = '.search';

    const assertRowLength = (values: Array<string>, length: number): void => {
      values.forEach((value: string) => {
        cy.get(selRowName + '[title="' + value + '"]').should(
          'have.length',
          length
        );
      });
    };

    it('should filter', () => {
      cy.visit(`/data/${DimensionName.country}`);

      const arCountries = ['Bulgaria', 'Denmark', 'Hungary'];
      const orCountries = ['Norway', 'Portugal'];
      const arProviders = [
        'Arts Council Norway',
        'CARARE',
        '^The European Library'
      ];
      const waProviders = ['EFG - The European Film Gateway'];

      cy.get(selFilter).type('ar', force);

      assertRowLength(arCountries, 1);
      assertRowLength(orCountries, 0);

      cy.get(selFilter).clear(force).type('or', force);
      assertRowLength(arCountries, 0);
      assertRowLength(orCountries, 1);
      cy.get(selFacetSelect).select('Provider', force);
      assertRowLength(waProviders, 0);

      cy.get(selFilter).clear(force).type('wa', force);
      assertRowLength(waProviders, 1);

      cy.get(selFilter).clear(force).type('ar', force);
      assertRowLength(arProviders, 1);
      assertRowLength(waProviders, 0);

      cy.get(selFacetSelect).select('Country', force);

      assertRowLength(arCountries, 1);
      assertRowLength(orCountries, 0);
    });

    it('should filter (diacritics)', () => {
      cy.visit(`/data/${DimensionName.dataProvider}`);
      cy.get(selRowName).should('have.length', 10);
      cy.get(selFilter).type('Sõj', force);
      cy.get(selRowName).should('have.length', 1);
      cy.get(selFilter).clear();
      cy.get(selFilter).type('Os', force);
      cy.get(selRowName).should('have.length', 3);
    });

    it('should go to the user-typed page', () => {
      cy.visit(`/data/${DimensionName.country}`);
      // assumes page of 10 entries
      const pageOneCountries = ['Belgium', 'Holy See (Vatican City State)'];
      const pageTwoCountries = ['Ireland', 'Netherlands'];
      const pageThreeCountries = ['Iceland', 'Czechia'];

      assertRowLength(pageOneCountries, 1);
      assertRowLength(pageTwoCountries, 0);
      assertRowLength(pageThreeCountries, 0);

      cy.get(selInputGoTo).type('2{enter}', force);

      assertRowLength(pageOneCountries, 0);
      assertRowLength(pageTwoCountries, 1);

      assertRowLength(pageThreeCountries, 0);

      cy.get(selInputGoTo).type('3{enter}', force);

      assertRowLength(pageOneCountries, 0);
      assertRowLength(pageTwoCountries, 0);
      assertRowLength(pageThreeCountries, 1);

      cy.get(selInputGoTo).type('999{enter}', force);

      assertRowLength(pageOneCountries, 0);
      assertRowLength(pageTwoCountries, 0);
      assertRowLength(pageThreeCountries, 1);

      cy.get(selInputGoTo).type('0{enter}', force);

      assertRowLength(pageOneCountries, 1);
      assertRowLength(pageTwoCountries, 0);
      assertRowLength(pageThreeCountries, 0);
    });

    it('should retain altered order through facet switches', () => {
      cy.visit(`/data/${DimensionName.country}`);

      assertRowLength(['Belgium'], 1);
      assertRowLength(['Czechia'], 0);

      cy.get(selColSortCount).click(force);
      cy.get(selColSortCount).click(force);
      assertRowLength(['Belgium'], 0);
      assertRowLength(['Czechia'], 1);

      cy.get(selFacetSelect).select('Data Provider', force);

      assertRowLength(['Riksantikvarieämbetet'], 1);
      assertRowLength(['Wielkopolska Biblioteka Cyfrowa'], 0);

      cy.get(selFacetSelect).select('Country', force);

      assertRowLength(['Belgium'], 0);
      assertRowLength(['Czechia'], 1);

      cy.get(selColSortCount).click(force);

      assertRowLength(['Belgium'], 1);
      assertRowLength(['Czechia'], 0);

      cy.get(selFacetSelect).select('Data Provider', force);

      assertRowLength(['Riksantikvarieämbetet'], 0);
      assertRowLength(['Wielkopolska Biblioteka Cyfrowa'], 1);
    });

    it('should paginate back and forth', () => {
      cy.visit(`/data/${DimensionName.country}`);
      assertRowLength(['Belgium'], 1);
      assertRowLength(['Ireland'], 0);

      cy.get(selPageNext).click(force);

      assertRowLength(['Belgium'], 0);
      assertRowLength(['Ireland'], 1);

      cy.get(selPagePrev).click(force);

      assertRowLength(['Belgium'], 1);
      assertRowLength(['Ireland'], 0);
    });

    it('should set the result size', () => {
      cy.visit(`/data/${DimensionName.country}`);
      // assumes page of 10 entries
      const inFirst20 = ['Belgium', 'Bulgaria', 'Croatia', 'Austria'];
      const inSecond20 = ['Norway', 'Poland'];

      assertRowLength(inFirst20, 1);
      assertRowLength(inSecond20, 0);

      cy.get(selInputPageSize).select('20', force);

      assertRowLength(inFirst20, 1);
      assertRowLength(inSecond20, 1);

      cy.get(selInputPageSize).select('10', force);

      assertRowLength(inFirst20, 1);
      assertRowLength(inSecond20, 0);
    });
  });
});

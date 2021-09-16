context('statistics-dashboard', () => {
  describe('grid', () => {

    const force = { force : true };
    const selInputGoTo = 'input.go-to';
    const selInputPageSize = 'select.max-page-size'
    const selRowName = '[data-e2e="grid-row-name"]';
    const selPageNext = '[data-e2e="grid-page-next"]';
    const selPagePrev = '[data-e2e="grid-page-prev"]';
    const selColSortCount = '[data-e2e="grid-sort-count"] a';
    const selFacetSelect = '.facet-param';
    const selFilter = '.search';

    const assertRowLength = (values: Array<string>, length: number): void => {
      values.forEach((value: string)=> {
        cy.get(selRowName + '[title="' + value +'"]').should('have.length', length);
      });
    };

    it('should filter', () => {
      cy.visit('/data/COUNTRY');

      const arCountries = ['Bulgaria', 'Denmark', 'Hungary'];
      const orCountries = ['Norway', 'Portugal'];
      const arProviders = ['CARARE', 'The European Library'];
      const orProviders = ['Digital Repository of Ireland', 'RNOD-Portugal'];

      cy.get(selFilter).type('ar', force);

      assertRowLength(arCountries, 1);
      assertRowLength(orCountries, 0);

      cy.get(selFilter).clear(force).type('or', force);
      assertRowLength(arCountries, 0);
      assertRowLength(orCountries, 1);

      cy.get(selFacetSelect).select('Provider', force);

      assertRowLength(arProviders, 0);
      assertRowLength(orProviders, 1);

      cy.get(selFilter).clear(force).type('ar', force);
      assertRowLength(arProviders, 1);
      assertRowLength(orProviders, 0);

      cy.get(selFacetSelect).select('Country', force);

      assertRowLength(arCountries, 1);
      assertRowLength(orCountries, 0);
    });

    it('should filter (diacritics)', () => {
      cy.visit('/data/DATA_PROVIDER');
      cy.get(selRowName).should('have.length', 10);
      cy.get(selFilter).type('õ', force);
      cy.get(selRowName).should('have.length', 1);
    });

    it('should go to the user-typed page', () => {
      cy.visit('/data/COUNTRY');
      // assumes page of 10 entries
      const pageOneCountries = ['Belgium', 'Greece'];
      const pageTwoCountries = ['Holy See (Vatican City State)', 'Iceland'];
      const pageThreeCountries = ['Slovenia', 'Hungary'];

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
      cy.visit('/data/COUNTRY');

      assertRowLength(['Belgium'], 1);
      assertRowLength(['Czech Republic'], 0);

      cy.get(selColSortCount).click(force);
      assertRowLength(['Belgium'], 0);
      assertRowLength(['Czech Republic'], 1);

      cy.get(selFacetSelect).select('Data Provider', force);

      assertRowLength(['National Library of Finland'], 1);
      assertRowLength(['Meise Botanic Garden'], 0);

      cy.get(selFacetSelect).select('Country', force);

      assertRowLength(['Belgium'], 0);
      assertRowLength(['Czech Republic'], 1);

      cy.get(selColSortCount).click(force);

      assertRowLength(['Belgium'], 1);
      assertRowLength(['Czech Republic'], 0);

      cy.get(selFacetSelect).select('Data Provider', force);

      assertRowLength(['National Library of Finland'], 0);
      assertRowLength(['Meise Botanic Garden'], 1);
    });

    it('should paginate back and forth', () => {
      cy.visit('/data/COUNTRY');
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
      cy.visit('/data/COUNTRY');
      // assumes page of 10 entries
      const inFirst5 = ['Belgium', 'Bulgaria', 'Croatia', 'Austria'];
      const inSecond5 = ['Europe', 'Estonia', 'Germany', 'Greece'];

      assertRowLength(inFirst5, 1);
      assertRowLength(inSecond5, 1);

      cy.get(selInputPageSize).select('5', force);

      assertRowLength(inFirst5, 1);
      assertRowLength(inSecond5, 0);

      cy.get(selInputPageSize).select('10', force);

      assertRowLength(inFirst5, 1);
      assertRowLength(inSecond5, 1);
    });

  });
});

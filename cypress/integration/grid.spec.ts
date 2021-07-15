context('statistics-dashboard', () => {
  describe('grid', () => {

    const force = { force : true };
    const selRowName = '[data-e2e="grid-row-name"]';
    const selPageNext = '[data-e2e="grid-page-next"]';
    const selPagePrev = '[data-e2e="grid-page-prev"]';
    const selColSortCount = '[data-e2e="grid-sort-count"] a';
    const selFacetSelect = '.facet-param';
    const selFilter = '.search';

    const assertRowLength = (values: Array<string>, length: number): void => {
      values.forEach((value: string)=> {
        cy.get(selRowName).contains(value).should('have.length', length);
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

  });
});

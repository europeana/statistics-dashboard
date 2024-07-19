import { facetNames } from '../../src/app/_data';
import { DimensionName } from '../../src/app/_models';

context('Statistics Dashboard', () => {
  describe('overview', () => {
    const selLinkHomeHeader = '[data-e2e=link-home-header]';
    const selLinkHome = '[data-e2e=link-home]';
    const selCTZero = '.ct-zero input';
    const urlParamCTZero = 'content-tier-zero=true';
    const selShortcuts = '.country-shortcut-links-container';

    it('should show for all urls', () => {
      facetNames.forEach((url: string) => {
        cy.visit(`/data/${url}`);
        cy.url().should('contain', url);
        cy.get(selLinkHomeHeader).click();
        cy.url().should('not.contain', url);
      });
    });

    it('should have a working home link', () => {
      const url = `/data/${DimensionName.country}`;
      cy.visit(url);
      cy.get(selLinkHome).should('have.length', 1);
      cy.get(selLinkHome).click({ force: true });
      cy.url().should('not.contain', url);
    });

    it('should respond to the CT-Zero option', () => {
      cy.visit(`/data/${DimensionName.country}`);
      cy.get(selCTZero).should('have.length', 1);
      cy.get(selCTZero).should('not.be.checked');

      cy.get(selCTZero).click({ force: true });
      cy.get(selCTZero).should('be.checked');
      cy.url().should('contain', urlParamCTZero);
    });

    it('should respond to the CT-Zero url parameter', () => {
      cy.visit(`/data/${DimensionName.country}?${urlParamCTZero}`);
      cy.get(selCTZero).should('be.checked');
      cy.get(selCTZero).click({ force: true });
      cy.url().should('not.contain', urlParamCTZero);
    });

    it('should show filter-removal options', () => {
      const filteredTypes = ['3D', 'VIDEO'];
      const param = `?${DimensionName.type}=${filteredTypes[0]}&${DimensionName.type}=${filteredTypes[1]}`;

      cy.visit(`/data/${DimensionName.country}${param}`);

      cy.url().should('contain', filteredTypes[0]);
      cy.url().should('contain', filteredTypes[1]);
      cy.get('.rm-filter').should('have.length', 2);
      cy.get('.rm-filter input').first().click({ force: true });
      cy.get('.rm-filter').should('have.length', 1);
      cy.url().should('not.contain', filteredTypes[0]);

      cy.get('.rm-filter input').first().click({ force: true });
      cy.get('.rm-filter').should('have.length', 0);
      cy.url().should('not.contain', filteredTypes[1]);
    });

    it('should provide shortcuts to the country page (3D)', () => {
      const baseUrlContentTier = `/data/${DimensionName.contentTier}?country=Austria`;
      const baseUrlProvider = `/data/${DimensionName.provider}?country=Austria`;

      cy.visit(baseUrlContentTier);
      cy.get(selShortcuts).should('not.exist');

      cy.visit(`${baseUrlContentTier}&type=3D`);
      cy.get(selShortcuts).should('exist');

      cy.visit(baseUrlProvider);
      cy.get(selShortcuts).should('not.exist');

      cy.visit(`${baseUrlProvider}&type=3D`);
      cy.get(selShortcuts).should('exist');
    });

    it('should provide shortcuts to the country page (HQ)', () => {
      const hqParams =
        '?contentTier=2&contentTier=3&contentTier=4&metadataTier=A&metadataTier=B&metadataTier=C';
      const baseUrlType = `/data/${DimensionName.type}${hqParams}`;
      const baseUrlDataProvider = `/data/${DimensionName.dataProvider}${hqParams}`;

      cy.visit(baseUrlType);
      cy.get(selShortcuts).should('not.exist');

      cy.visit(`${baseUrlType}&country=Austria`);
      cy.get(selShortcuts).should('exist');

      cy.visit(baseUrlDataProvider);
      cy.get(selShortcuts).should('not.exist');

      cy.visit(`${baseUrlDataProvider}&country=Austria`);
      cy.get(selShortcuts).should('exist');
    });
  });
});

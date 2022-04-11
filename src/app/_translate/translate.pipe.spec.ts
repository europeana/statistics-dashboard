import { DimensionName } from '../_models';
import { HighlightMatchPipe } from '.';
import { RenameApiFacetPipe } from '.';
import { RenameApiFacetShortPipe } from '.';

describe('Translation', () => {
  describe('hihglight match pipe', () => {
    it('should highlight the matches', () => {
      const pipe = new HighlightMatchPipe();
      expect(pipe.transform('Hello Europeana', ['Hello'])).toBe(
        '<span class="term-highlight">Hello</span> Europeana'
      );
    });

    it('should not highlight when there are no matches', () => {
      const pipe = new HighlightMatchPipe();
      expect(pipe.transform('Hello Europeana')).toBe('Hello Europeana');
    });
  });

  describe('rename facet pipe', () => {
    it('should rename the facet', () => {
      const pipe = new RenameApiFacetPipe();
      expect(pipe.transform(DimensionName.dataProvider)).toBe('Data Provider');
    });

    it('should handle an empty value', () => {
      const pipe = new RenameApiFacetPipe();
      expect(pipe.transform('xxx' as DimensionName)).toBe('xxx');
    });
  });

  describe('rename facet short pipe', () => {
    it('should rename the facet to something short', () => {
      const pipe = new RenameApiFacetShortPipe();
      expect(pipe.transform(DimensionName.dataProvider)).toBe('CHI');
    });

    it('should rename the facets plural', () => {
      const pipe = new RenameApiFacetShortPipe();
      expect(pipe.transform(`plural_${DimensionName.dataProvider}`)).toBe(
        'CHIs'
      );
    });

    it('should handle an empty value', () => {
      const pipe = new RenameApiFacetShortPipe();
      expect(pipe.transform('xxx' as DimensionName)).toBe('xxx');
    });
  });
});

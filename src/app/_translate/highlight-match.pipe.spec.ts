import { HighlightMatchPipe } from './';

describe('highlight pipe', () => {
  let tagOpen: string;
  let tagClose: string;
  let pipe: HighlightMatchPipe;

  beforeEach(() => {
    pipe = new HighlightMatchPipe();
    tagOpen = pipe.tagOpen;
    tagClose = pipe.tagClose;
  });

  it('should not alter the string if no args are supplied', () => {
    expect(pipe.transform('hello')).toBe('hello');
  });

  it('should highlight', () => {
    expect(pipe.transform('hello', ['a'])).toBe('hello');
    expect(pipe.transform('hello', ['e'])).toBe(`h${tagOpen}e${tagClose}llo`);
  });

  it('should highlight multiple instances', () => {
    expect(pipe.transform('hello', ['l'])).toBe(
      `he${tagOpen}l${tagClose}${tagOpen}l${tagClose}o`
    );
  });

  it('should handle case correctly', () => {
    expect(pipe.transform('hello', ['E'])).toBe(`h${tagOpen}e${tagClose}llo`);
  });

  it('should handle diacritics', () => {
    expect(pipe.transform('A. Avotiņš', ['s'])).toBe(
      `A. Avotiņ${tagOpen}š${tagClose}`
    );
    expect(pipe.transform('Ainārs Radovics', ['A'])).toBe(
      `${tagOpen}A${tagClose}in${tagOpen}ā${tagClose}rs R${tagOpen}a${tagClose}dovics`
    );
    expect(
      pipe.transform('Archiv der brüderunität Herrnhut, Germany', ['a'])
    ).toBe(
      `${tagOpen}A${tagClose}rchiv der brüderunit${tagOpen}ä${tagClose}t Herrnhut, Germ${tagOpen}a${tagClose}ny`
    );
    expect(
      pipe.transform('Archiv der brüderunität Herrnhut, Germany', ['At'])
    ).toBe(`Archiv der brüderunit${tagOpen}ät${tagClose} Herrnhut, Germany`);
    expect(
      pipe.transform('Archiv der brüderunität Herrnhut, Germany', ['U'])
    ).toBe(
      `Archiv der br${tagOpen}ü${tagClose}der${tagOpen}u${tagClose}nität Herrnh${tagOpen}u${tagClose}t, Germany`
    );
    expect(
      pipe.transform('Archives départementales de la Gironde', ['de'])
    ).toBe(
      `Archives ${tagOpen}dé${tagClose}partementales ${tagOpen}de${tagClose} la Giron${tagOpen}de${tagClose}`
    );
    expect(
      pipe.transform('Archives départementales de la Gironde', ['dep'])
    ).toBe(`Archives ${tagOpen}dép${tagClose}artementales de la Gironde`);
  });
});

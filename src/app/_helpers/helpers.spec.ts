import {
  appendDiacriticEquivalents,
  filterList,
  fromCSL,
  fromInputSafeName,
  invalidRegexes,
  replaceDiacritics
} from '.';

describe('Helpers', () => {
  it('should filter lists (primitives)', () => {
    const list = ['aaa', 'bbb', 'ccc'];

    expect(filterList('', list)).toEqual(list);
    expect(filterList('term', list)).toEqual([]);

    ['a', 'b', 'c'].forEach((s: string, i: number) => {
      expect(filterList(s, list)).toEqual([list[i]]);
    });
  });

  it('should filter lists (objects)', () => {
    const list = [{ name: 'aaa' }, { name: 'bbb' }, { name: 'ccc' }];

    expect(filterList('', list, 'name')).toEqual(list);
    expect(filterList('term', list, 'name')).toEqual([]);

    ['a', 'b', 'c'].forEach((s: string, i: number) => {
      expect(filterList(s, list, 'name')).toEqual([list[i]]);
    });
  });

  it('should ignore invalid regexes when filtering lists', () => {
    const list = ['aaa', 'bbb', 'ccc'];
    invalidRegexes.forEach((term: string) => {
      expect(filterList(term, list)).toEqual([]);
    });
  });

  it('should decode input-safe names', () => {
    expect(fromInputSafeName('Hello_____World')).toEqual('Hello.World');
    expect(fromInputSafeName('_____')).toEqual('.');
  });

  it('should append diacritics', () => {
    expect(appendDiacriticEquivalents('A')).toBe(
      '[AÁĂẮẶẰẲẴǍÂẤẬẦẨẪÄẠÀẢĀĄÅǺÃÆǼА]'
    );
    expect(appendDiacriticEquivalents('Z')).toBe('[ZŹŽŻẒẔƵЖЗЦ]');
  });

  it('should replace diacritics', () => {
    expect(replaceDiacritics('A')).toBe('A');
    expect(replaceDiacritics('Á')).toBe('A');
    expect(replaceDiacritics('Ƶ')).toBe('Z');
  });

  it('should convert comma-separated lists', () => {
    expect(fromCSL('1, 2, 3').length).toEqual(3);
    expect(fromCSL('1, 2, 3,').length).toEqual(3);
    expect(fromCSL('1, 2, 3,,').length).toEqual(3);
  });
});

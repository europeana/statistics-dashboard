import {
  appendDiacriticEquivalents,
  filterList,
  fromCSL,
  fromInputSafeName,
  replaceDiacritics
} from '.';

describe('Helpers', () => {
  it('should filter lists (primitives)', () => {
    const list = ['aaa', 'bbb', 'ccc'];

    expect(filterList('', list)).toEqual(list);
    expect(filterList('.', list)).toEqual([]);
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

  it('should decode input-safe names', () => {
    expect(fromInputSafeName('Hello_____World')).toEqual('Hello.World');
    expect(fromInputSafeName('_____')).toEqual('.');
  });

  it('should append diacritics', () => {
    expect(appendDiacriticEquivalents('')).toBe('');
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

  it('should filter lists (regex matches)', () => {
    const list = [
      'Austria',
      'Bosnia',
      'Indiana',
      '^Denmark$',
      '$lovenia',
      'Trie$te'
    ];

    expect(filterList('ia', list).length).toEqual(4);
    expect(filterList('ia$', list).length).toEqual(3);
    expect(filterList('tr', list).length).toEqual(2);
    expect(filterList('^tr', list).length).toEqual(1);

    expect(filterList('Denmark', list).length).toEqual(1);
    expect(filterList('^Denmark$', list).length).toEqual(1);

    expect(filterList('^', list).length).toEqual(1);
    expect(filterList('^A', list).length).toEqual(1);
    expect(filterList('^Z', list).length).toEqual(0);
    expect(filterList('$', list).length).toEqual(3);
    expect(filterList('ia$', list).length).toEqual(3);
    expect(filterList('a$', list).length).toEqual(4);
    expect(filterList('$l', list).length).toEqual(1);
  });
});

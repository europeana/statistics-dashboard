import {
  appendDiacriticEquivalents,
  fromCSL,
  fromInputSafeName,
  replaceDiacritics
} from '.';

describe('Helpers', () => {
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

import { fromInputSafeName } from '.';

describe('Helpers', () => {
  it('should decode input-safe names', () => {
    expect(fromInputSafeName('Hello_____World')).toEqual('Hello.World');
    expect(fromInputSafeName('_____')).toEqual('.');
  });
});

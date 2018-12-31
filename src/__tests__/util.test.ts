import { toAbsolute } from '../util';
import { join } from 'path';
import { getDefaultDatadir } from '../default';

describe('toAbsolute', () => {
  it('returns the provided path if it is already absolute', () => {
    const filePath = '/foo/bar/baz';
    expect(toAbsolute(filePath)).toBe(filePath);
  });

  it('completely ignores the datadir arg if provided path is already absolute', () => {
    const filePath = '/foo/bar/baz';
    expect(toAbsolute(filePath, { datadir: 'does not matter even a little' })).toBe(
      filePath,
    );
  });

  it('joins a relative path to the "datadir" arg if provided', () => {
    const filePath = 'baz';
    const datadir = __dirname;
    expect(toAbsolute(filePath, { datadir })).toBe(join(datadir, filePath));
  });

  it('joins a relative path to the default "datadir" if none is provided', () => {
    const filePath = 'baz';
    expect(toAbsolute(filePath)).toBe(join(getDefaultDatadir(), filePath));
  });
});

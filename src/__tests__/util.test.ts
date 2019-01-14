import { join } from 'path';
import { toAbsolute } from '../util';
import { DEFAULT_DATADIR } from '../constants';

describe(toAbsolute.name, () => {
  it('returns the provided path if it is already absolute', () => {
    const filePath = '/foo/bar/baz';
    expect(toAbsolute(filePath)).toBe(filePath);
  });

  it('completely ignores the datadir arg if provided path is already absolute', () => {
    const filePath = '/foo/bar/baz';
    expect(toAbsolute(filePath, 'does not matter even a little')).toBe(filePath);
  });

  it('joins a relative path to the "datadir" arg if provided', () => {
    const filePath = 'baz';
    const datadir = __dirname;
    expect(toAbsolute(filePath, datadir)).toBe(join(datadir, filePath));
  });

  it('joins a relative path to the default "datadir" if none is provided', () => {
    const filePath = 'baz';
    expect(toAbsolute(filePath)).toBe(join(DEFAULT_DATADIR, filePath));
  });

  it('throws "not an absolute path" if datadir arg is not an absolute path', () => {
    const filePath = 'baz';
    expect(() => {
      toAbsolute(filePath, 'foo');
    }).toThrow('not an absolute path');
  });
});

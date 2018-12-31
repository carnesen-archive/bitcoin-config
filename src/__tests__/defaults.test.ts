import { getDefaultConfig } from '../default';
import { homedir } from 'os';
import { join } from 'path';

describe('getDefaults', () => {
  it('returns a macos-specific datadir on mac', () => {
    const defaults = getDefaultConfig('main', 'darwin');
    expect(defaults.datadir).toMatch('Application Support');
  });

  it('returns a windows-specific datadir on windows', () => {
    const originalValue = process.env.APPDATA;
    const temporaryValue = 'C:\\Users\\carnesen';
    process.env.APPDATA = temporaryValue;
    const defaults = getDefaultConfig('main', 'win32');
    expect(defaults.datadir).toMatch(process.env.APPDATA);
    process.env.APPDATA = originalValue;
  });

  it('returns linux default datadir if platform is not windows or macos', () => {
    const defaults = getDefaultConfig('main', 'aix');
    expect(defaults.datadir).toMatch(join(homedir(), '.bitcoin'));
  });
});
